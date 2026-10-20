// /api/recipes/<slug> — read (public), update and delete (contributors only).

const { isConfigured } = require("../_lib/github");
const store = require("../_lib/recipes");
const { getAuth } = require("../_lib/clerk");

const MAX_TITLE = 120;
const MAX_BODY = 100000;

async function requireContributor(req, res) {
  const auth = await getAuth(req);
  if (!auth.signedIn) {
    res.status(401).json({ ok: false, error: "sign in required" });
    return null;
  }
  if (!auth.contributor) {
    res
      .status(403)
      .json({ ok: false, error: "not a contributor", userId: auth.userId });
    return null;
  }
  return auth;
}

module.exports = async function handler(req, res) {
  if (!isConfigured()) {
    return res.status(500).json({ ok: false, error: "not configured" });
  }
  const slug = req.query.slug;
  if (!store.isValidSlug(slug)) {
    return res.status(404).json({ ok: false, error: "recipe not found" });
  }
  try {
    if (req.method === "GET") {
      const recipe = await store.readRecipe(slug);
      if (!recipe) {
        return res.status(404).json({ ok: false, error: "recipe not found" });
      }
      const { sha, ...pub } = recipe;
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=30, stale-while-revalidate=120",
      );
      return res.status(200).json({ ok: true, recipe: pub });
    }

    if (req.method === "PUT") {
      if (!(await requireContributor(req, res))) return;
      const current = await store.readRecipe(slug);
      if (!current) {
        return res.status(404).json({ ok: false, error: "recipe not found" });
      }
      const body = req.body ?? {};
      const title =
        typeof body.title === "string"
          ? body.title.replace(/\s+/g, " ").trim().slice(0, MAX_TITLE)
          : "";
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
      const text = store.serializeRecipe(
        {
          title,
          author: current.author,
          created: current.created,
          updated: new Date().toISOString().slice(0, 10),
        },
        content,
      );
      await store.putRecipe(slug, text, current.sha, `update recipe: ${title}`);
      return res.status(200).json({ ok: true, slug });
    }

    if (req.method === "DELETE") {
      if (!(await requireContributor(req, res))) return;
      const current = await store.readRecipe(slug);
      if (!current) {
        return res.status(404).json({ ok: false, error: "recipe not found" });
      }
      await store.deleteRecipe(slug, current.sha);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: "method not allowed" });
  } catch (err) {
    console.error("recipe:", err.message);
    return res.status(500).json({ ok: false, error: "something went wrong" });
  }
};
