// Minimal GitHub REST client. Throws on any non-2xx response; the error's
// `status` lets callers handle specific codes (404, 409).

async function github(token, path, { method = "GET", body } = {}) {
  const res = await fetch(`https://api.github.com/${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    // Never include the response body: it could echo the token back.
    const err = new Error(`github ${method} ${path} -> ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

module.exports = { github };
