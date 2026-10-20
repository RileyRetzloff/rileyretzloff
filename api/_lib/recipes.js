// Recipe + comment storage on top of the GitHub Contents API.
//
// Layout in the recipes repo:
//   recipes/<slug>.md    — one markdown file per recipe, YAML-ish frontmatter
//                          (title, author, created, updated) like the blog's
//   comments/<slug>.json — one JSON array per recipe:
//                          [{ id, name, text, createdAt }]

const { listDir, getFile, putFile, deleteFile } = require("./github");

const RECIPES_DIR = "recipes";
const COMMENTS_DIR = "comments";

function isValidSlug(slug) {
  return (
    typeof slug === "string" &&
    slug.length <= 80 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  );
}

function slugify(title) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return slug || "untitled";
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { data, body: match[2] };
}

function serializeRecipe(meta, body) {
  return [
    "---",
    `title: ${meta.title}`,
    `author: ${meta.author}`,
    `created: ${meta.created}`,
    `updated: ${meta.updated}`,
    "---",
    "",
    body.trim(),
    "",
  ].join("\n");
}

async function listRecipes() {
  const entries = await listDir(RECIPES_DIR);
  const summaries = [];
  for (const entry of entries) {
    if (!entry.name.endsWith(".md")) continue;
    const file = await getFile(entry.path);
    if (!file) continue;
    const { data } = parseFrontmatter(file.text);
    summaries.push({
      slug: entry.name.replace(/\.md$/, ""),
      title: data.title || entry.name.replace(/\.md$/, ""),
      author: data.author || "",
      created: data.created || "",
      updated: data.updated || "",
    });
  }
  summaries.sort((a, b) => (b.updated || "").localeCompare(a.updated || ""));
  return summaries;
}

async function readRecipe(slug) {
  const file = await getFile(`${RECIPES_DIR}/${slug}.md`);
  if (!file) return null;
  const { data, body } = parseFrontmatter(file.text);
  return {
    slug,
    title: data.title || slug,
    author: data.author || "",
    created: data.created || "",
    updated: data.updated || "",
    body,
    sha: file.sha,
  };
}

function putRecipe(slug, text, sha, message) {
  return putFile(`${RECIPES_DIR}/${slug}.md`, text, sha, message);
}

async function deleteRecipe(slug, sha) {
  await deleteFile(`${RECIPES_DIR}/${slug}.md`, sha, `delete recipe: ${slug}`);
  // Best effort: take the comments file with it.
  const comments = await getFile(`${COMMENTS_DIR}/${slug}.json`);
  if (comments) {
    await deleteFile(
      `${COMMENTS_DIR}/${slug}.json`,
      comments.sha,
      `delete comments: ${slug}`,
    );
  }
}

async function readComments(slug) {
  const file = await getFile(`${COMMENTS_DIR}/${slug}.json`);
  if (!file) return { comments: [], sha: null };
  try {
    const parsed = JSON.parse(file.text);
    return { comments: Array.isArray(parsed) ? parsed : [], sha: file.sha };
  } catch {
    return { comments: [], sha: file.sha };
  }
}

function putComments(slug, comments, sha, message) {
  return putFile(
    `${COMMENTS_DIR}/${slug}.json`,
    JSON.stringify(comments, null, 2) + "\n",
    sha,
    message,
  );
}

module.exports = {
  isValidSlug,
  slugify,
  serializeRecipe,
  listRecipes,
  readRecipe,
  putRecipe,
  deleteRecipe,
  readComments,
  putComments,
};
