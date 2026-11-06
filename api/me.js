// GET /api/me: whether the caller is signed in and may edit recipes.
const { route } = require("./_lib/http");
const { getAuth } = require("./_lib/auth");

module.exports = route({
  async GET(req, res) {
    res.status(200).json(await getAuth(req));
  },
});
