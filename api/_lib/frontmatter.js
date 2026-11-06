// "---\nkey: value\n---\nbody" markdown frontmatter. Flat string values
// only. Shared by the recipes API and scripts/build-posts.mjs.

function parse(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data = {};
  for (const entry of match[1].split(/\r?\n/)) {
    const i = entry.indexOf(":");
    if (i > 0) data[entry.slice(0, i).trim()] = entry.slice(i + 1).trim();
  }
  return { data, body: match[2] };
}

function stringify(data, body) {
  const fields = Object.entries(data).map(([key, value]) => `${key}: ${value}`);
  return ["---", ...fields, "---", "", body.trim(), ""].join("\n");
}

module.exports = { parse, stringify };
