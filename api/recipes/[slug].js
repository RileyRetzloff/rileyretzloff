// /api/recipes/:slug
//   GET     one recipe (public)
//   PUT     update title/body (contributors only)
//   DELETE  delete it and its comments (contributors only)

const { route } = require("../_lib/http");
const { requireContributor } = require("../_lib/auth");
const store = require("../_lib/recipes");
const { recipeInput, today, PUBLIC_CACHE } = require("../_lib/recipe-input");

module.exports = route({
  async GET(req, res) {
    const { sha, ...recipe } = await store.getRecipe(req.query.slug);
    res.setHeader("Cache-Control", PUBLIC_CACHE);
    res.status(200).json(recipe);
  },

  async PUT(req, res) {
    await requireContributor(req);
    const { sha, ...current } = await store.getRecipe(req.query.slug);
    const { title, body } = recipeInput(req.body);
    await store.saveRecipe({ ...current, title, body, updated: today() }, sha);
    res.status(200).json({ slug: current.slug });
  },

  async DELETE(req, res) {
    await requireContributor(req);
    const { slug, sha } = await store.getRecipe(req.query.slug);
    await store.deleteRecipe(slug, sha);
    res.status(204).end();
  },
});
