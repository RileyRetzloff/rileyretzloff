// /api/me — lets the frontend ask "who am I, and may I contribute?"
// Returns the caller's Clerk user ID when signed in, which doubles as the
// bootstrap path for the RECIPE_CONTRIBUTORS allowlist: sign in, read your
// ID here (the recipe editor shows it too), add it in the Vercel dashboard.

const { getAuth } = require("./_lib/clerk");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method not allowed" });
  }
  const auth = await getAuth(req);
  return res.status(200).json({ ok: true, ...auth });
};
