// /api/recipes — list (public) and create (contributors only).
//
// Recipes live as markdown files in a private GitHub repo; see
// api/_lib/recipes.js for the layout and api/_lib/clerk.js for how the
// caller's Clerk session token is verified.

const { isConfigured } = require("./_lib/github");
const store = require("./_lib/recipes");
const { getAuth } = require("./_lib/clerk");

const MAX_TITLE = 120;
const MAX_BODY = 100000;

function cleanTitle(value) {
  return typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, MAX_TITLE)
    : "";
}

function cleanAuthor(value) {
  return typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, 60)
    : "";
}

module.exports = async function handler(req, res) {
  if (!isConfigured()) {
    return res.status(500).json({ ok: false, error: "not configured" });
  }
  try {
    if (req.method === "GET") {
      const recipes = await store.listRecipes();
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=30, stale-while-revalidate=120",
      );
      return res.status(200).json({ ok: true, recipes });
    }

    if (req.method === "POST") {
      const auth = await getAuth(req);
      if (!auth.signedIn) {
        return res.status(401).json({ ok: false, error: "sign in required" });
      }
      if (!auth.contributor) {
        // userId is included so the caller can see the ID that needs to be
        // added to RECIPE_CONTRIBUTORS.
        return res.status(403).json({
          ok: false,
          error: "not a contributor",
          userId: auth.userId,
        });
      }

      const body = req.body ?? {};
      const title = cleanTitle(body.title);
      const content = typeof body.body === "string" ? body.body : "";
      if (!title) {
        return res.status(400).json({ ok: false, error: "title is required" });
      }
      if (content.trim().length === 0) {
        return res.status(400).json({ ok: false, error: "recipe is empty" });
      }
      if (content.length > MAX_BODY) {
        return res.status(400).json({ ok: false, error: "recipe is too long" });
      }

      const slug =
        typeof body.slug === "string" && store.isValidSlug(body.slug)
          ? body.slug
          : store.slugify(title);
      if (await store.readRecipe(slug)) {
        return res.status(409).json({
          ok: false,
          error: "a recipe already exists at this slug",
          slug,
        });
      }

      const today = new Date().toISOString().slice(0, 10);
      const author = cleanAuthor(body.author) || "anonymous cook";
      const text = store.serializeRecipe(
        { title, author, created: today, updated: today },
        content,
      );
      await store.putRecipe(slug, text, null, `add recipe: ${title}`);
      return res.status(201).json({ ok: true, slug });
    }

    return res.status(405).json({ ok: false, error: "method not allowed" });
  } catch (err) {
    console.error("recipes:", err.message);
    return res.status(500).json({ ok: false, error: "something went wrong" });
  }
};
