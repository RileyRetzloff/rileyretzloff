// Recipe and comment storage: files in a private GitHub repo, via the
// Contents API.
//
//   recipes/<slug>.md     markdown with frontmatter (title, author, created, updated)
//   comments/<slug>.json  [{ id, name, text, createdAt }]
//
// Env: GITHUB_RECIPES_TOKEN (fine-grained PAT, Contents read/write on the
// repo) and GITHUB_RECIPES_REPO ("owner/repo").

const crypto = require("node:crypto");
const { github } = require("./github");
const frontmatter = require("./frontmatter");
const { HttpError, env } = require("./http");

function contents(path, options) {
  const repo = env("GITHUB_RECIPES_REPO");
  return github(env("GITHUB_RECIPES_TOKEN"), `repos/${repo}/contents/${path}`, options);
}

/** `{ text, sha }`, or null if the file doesn't exist. */
async function readFile(path) {
  try {
    const file = await contents(path);
    return { text: Buffer.from(file.content, "base64").toString("utf8"), sha: file.sha };
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

/** Creates the file when `sha` is undefined; otherwise updates it. */
function writeFile(path, text, sha, message) {
  const content = Buffer.from(text, "utf8").toString("base64");
  return contents(path, { method: "PUT", body: { message, content, sha } });
}

function deleteFile(path, sha, message) {
  return contents(path, { method: "DELETE", body: { message, sha } });
}

const recipePath = (slug) => `recipes/${slug}.md`;
const commentsPath = (slug) => `comments/${slug}.json`;

function isValidSlug(slug) {
  return typeof slug === "string" && slug.length <= 80 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

function slugify(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .slice(0, 80)
    .trim()
    .replaceAll(" ", "-");
  return slug || "untitled";
}

function toRecipe(slug, { data, body }) {
  return {
    slug,
    title: data.title || slug,
    author: data.author || "",
    created: data.created || "",
    updated: data.updated || "",
    body,
  };
}

async function listRecipes() {
  let entries;
  try {
    entries = await contents("recipes");
  } catch (err) {
    if (err.status === 404) return [];
    throw err;
  }
  const recipes = await Promise.all(
    entries
      .filter((entry) => entry.name.endsWith(".md"))
      .map(async (entry) => {
        const { body, sha, ...summary } = await getRecipe(entry.name.slice(0, -3));
        return summary;
      }),
  );
  return recipes.sort((a, b) => b.updated.localeCompare(a.updated));
}

/** The recipe plus its file `sha`. Throws a 404 if it doesn't exist. */
async function getRecipe(slug) {
  const file = isValidSlug(slug) ? await readFile(recipePath(slug)) : null;
  if (!file) throw new HttpError(404, "recipe not found");
  return { ...toRecipe(slug, frontmatter.parse(file.text)), sha: file.sha };
}

async function recipeExists(slug) {
  return (await readFile(recipePath(slug))) !== null;
}

function saveRecipe({ slug, title, author, created, updated, body }, sha) {
  const text = frontmatter.stringify({ title, author, created, updated }, body);
  const message = `${sha ? "update" : "add"} recipe: ${title}`;
  return writeFile(recipePath(slug), text, sha, message);
}

async function deleteRecipe(slug, sha) {
  await deleteFile(recipePath(slug), sha, `delete recipe: ${slug}`);
  const comments = await readFile(commentsPath(slug));
  if (comments) {
    await deleteFile(commentsPath(slug), comments.sha, `delete comments: ${slug}`);
  }
}

async function getComments(slug) {
  const file = await readFile(commentsPath(slug));
  return file ? JSON.parse(file.text) : [];
}

async function addComment(slug, { name, text }) {
  const comment = {
    id: crypto.randomUUID(),
    name,
    text,
    createdAt: new Date().toISOString(),
  };
  // Read-modify-write. If someone else commented in between, GitHub rejects
  // the stale sha with a 409; re-read and try again.
  for (let attempt = 1; ; attempt++) {
    const file = await readFile(commentsPath(slug));
    const comments = file ? JSON.parse(file.text) : [];
    try {
      await writeFile(
        commentsPath(slug),
        JSON.stringify([...comments, comment], null, 2) + "\n",
        file?.sha,
        `comment on ${slug} by ${name}`,
      );
      return comment;
    } catch (err) {
      if (err.status !== 409 || attempt === 3) throw err;
    }
  }
}

module.exports = {
  isValidSlug,
  slugify,
  listRecipes,
  getRecipe,
  recipeExists,
  saveRecipe,
  deleteRecipe,
  getComments,
  addComment,
};
