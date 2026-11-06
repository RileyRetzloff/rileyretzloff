// Request-body validation shared by the recipe create/update endpoints.

const { HttpError, line, text } = require("./http");

const PUBLIC_CACHE = "public, s-maxage=30, stale-while-revalidate=120";

function recipeInput(body) {
  const title = line(body?.title, 120);
  if (!title) throw new HttpError(400, "title is required");
  return { title, body: text(body?.body, 100_000, "recipe") };
}

const today = () => new Date().toISOString().slice(0, 10);

module.exports = { recipeInput, today, PUBLIC_CACHE };
