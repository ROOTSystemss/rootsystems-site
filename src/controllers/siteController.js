const products = require("../data/products");
const resources = require("../data/resources");
const pricing = require("../data/pricing");

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

function pricingPage(req, res) {
  res.render("pages/pricing", {
    title: "Pricing — RootSystems",
    pricing
  });
}

// One shared template for all three legal pages - only the title/slug/intro
// differ, and none of the three have real legal text yet (see legal.ejs).
// Do NOT add real Terms/Privacy/Refund copy here without it coming from the
// business - this controller only ever renders the "not published yet"
// placeholder state.
function legalPage(pageName) {
  return function (req, res) {
    res.render("pages/legal", {
      title: pageName + " — RootSystems",
      pageName
    });
  };
}

module.exports = {
  home,
  pricingPage,
  terms: legalPage("Terms of Service"),
  privacy: legalPage("Privacy Policy"),
  refund: legalPage("Refund Policy")
};
