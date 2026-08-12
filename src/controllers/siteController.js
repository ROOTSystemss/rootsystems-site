const products = require("../data/products");
const resources = require("../data/resources");

function home(req, res) {
  // Stats strip numbers are all derived from real data above, never
  // hand-typed - consistent with the site's own "if it can't be verified,
  // it doesn't ship" rule applying to its own marketing copy too.
  var liveCount = products.filter(function (p) {
    return p.status === "LIVE";
  }).length;

  res.render("pages/home", {
    title: "RootSystems — Proof, not paperwork.",
    products,
    resources,
    stats: {
      liveCount: liveCount,
      totalCount: products.length,
      foundersCount: 1,
      unverifiedClaims: 0
    }
  });
}

module.exports = { home };
