// /api/recipes
//   GET   list recipe summaries (public)
//   POST  create a recipe (contributors only)

const { route, line, HttpError } = require("./_lib/http");
const { requireContributor } = require("./_lib/auth");
const store = require("./_lib/recipes");
const { recipeInput, today, PUBLIC_CACHE } = require("./_lib/recipe-input");

module.exports = route({
  async GET(req, res) {
    res.setHeader("Cache-Control", PUBLIC_CACHE);
    res.status(200).json(await store.listRecipes());
  },

  async POST(req, res) {
    await requireContributor(req);
    const { title, body } = recipeInput(req.body);
    const slug = store.slugify(title);
    if (await store.recipeExists(slug)) {
      throw new HttpError(409, "a recipe with that title already exists");
    }
    const author = line(req.body?.author, 60) || "anonymous cook";
    await store.saveRecipe({ slug, title, author, created: today(), updated: today(), body });
    res.status(201).json({ slug });
  },
});
