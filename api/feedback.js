// POST /api/feedback: anonymous feedback, filed as an issue in a private repo.
//
// Env: GITHUB_PSST_ISSUES_READWRITE_TOKEN (fine-grained PAT, Issues
// read/write on the repo) and GITHUB_PSST_ISSUES_REPO ("owner/repo").

const { route, env, text, isBot, rateLimiter, HttpError } = require("./_lib/http");
const { github } = require("./_lib/github");

const isRateLimited = rateLimiter({ max: 5, windowMs: 10 * 60 * 1000 });

module.exports = route({
  async POST(req, res) {
    // Bots get a fake success so they never learn they were caught.
    if (isBot(req.body)) return res.status(204).end();
    const feedback = text(req.body?.text, 5000, "feedback");
    if (isRateLimited(req)) throw new HttpError(429, "slow down a little");

    const stamp = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "medium",
      timeStyle: "short",
    });
    await github(
      env("GITHUB_PSST_ISSUES_READWRITE_TOKEN"),
      `repos/${env("GITHUB_PSST_ISSUES_REPO")}/issues`,
      { method: "POST", body: { title: `feedback · ${stamp}`, body: feedback } },
    );
    res.status(204).end();
  },
});
