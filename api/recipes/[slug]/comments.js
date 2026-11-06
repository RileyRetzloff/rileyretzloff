// /api/recipes/:slug/comments
//   GET   the recipe's comments (public)
//   POST  add one (anyone, no account; honeypot + rate limit against spam)

const { route, line, text, isBot, rateLimiter, HttpError } = require("../../_lib/http");
const store = require("../../_lib/recipes");

const isRateLimited = rateLimiter({ max: 5, windowMs: 10 * 60 * 1000 });

module.exports = route({
  async GET(req, res) {
    const { slug } = req.query;
    if (!store.isValidSlug(slug)) throw new HttpError(404, "recipe not found");
    res.setHeader("Cache-Control", "public, s-maxage=15, stale-while-revalidate=60");
    res.status(200).json(await store.getComments(slug));
  },

  async POST(req, res) {
    if (isBot(req.body)) return res.status(204).end();
    const comment = {
      name: line(req.body?.name, 60) || "anonymous",
      text: text(req.body?.text, 2000, "comment"),
    };
    if (isRateLimited(req)) throw new HttpError(429, "slow down a little");
    const { slug } = await store.getRecipe(req.query.slug); // 404s if missing
    res.status(201).json(await store.addComment(slug, comment));
  },
});
