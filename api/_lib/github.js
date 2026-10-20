// GitHub Contents API helpers for the recipes repo (plain JS, same lesson
// as api/feedback.js: Vercel runs .js functions directly, no build step).
//
// Env vars (set in the Vercel dashboard):
//   GITHUB_RECIPES_TOKEN — fine-grained PAT, Contents read/write, scoped to
//                          the recipes repo only
//   GITHUB_RECIPES_REPO  — "owner/repo", e.g. RileyRetzloff/recipes

const API = "https://api.github.com";

function config() {
  const token = process.env.GITHUB_RECIPES_TOKEN;
  const repo = process.env.GITHUB_RECIPES_REPO;
  if (!token || !repo) return null;
  return { token, repo };
}

function isConfigured() {
  return config() !== null;
}

async function gh(path, options = {}) {
  const cfg = config();
  return fetch(`${API}/repos/${cfg.repo}/contents/${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

function ghError(action, path, status) {
  const err = new Error(`github ${action} ${path} -> ${status}`);
  err.status = status;
  return err;
}

async function listDir(path) {
  const res = await gh(path);
  if (res.status === 404) return [];
  if (!res.ok) throw ghError("list", path, res.status);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function getFile(path) {
  const res = await gh(path);
  if (res.status === 404) return null;
  if (!res.ok) throw ghError("get", path, res.status);
  const data = await res.json();
  return {
    text: Buffer.from(data.content, "base64").toString("utf8"),
    sha: data.sha,
  };
}

async function putFile(path, text, sha, message) {
  const body = {
    message,
    content: Buffer.from(text, "utf8").toString("base64"),
  };
  if (sha) body.sha = sha;
  const res = await gh(path, { method: "PUT", body: JSON.stringify(body) });
  if (!res.ok) throw ghError("put", path, res.status);
  return res.json();
}

async function deleteFile(path, sha, message) {
  const res = await gh(path, {
    method: "DELETE",
    body: JSON.stringify({ message, sha }),
  });
  if (!res.ok) throw ghError("delete", path, res.status);
}

module.exports = { isConfigured, listDir, getFile, putFile, deleteFile };
