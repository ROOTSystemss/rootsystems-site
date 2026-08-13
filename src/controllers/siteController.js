const products = require("../data/products");
const resources = require("../data/resources");
const pricing = require("../data/pricing");
const { loadLegalDoc } = require("../utils/markdown");

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

// One shared template for all three legal pages - only the title/slug/source
// file differ. Real copy comes from the business as a markdown file in the
// repo root (RootSystems_Terms_of_Service.md etc.), parsed at request time
// by utils/markdown.js. If a given file is ever missing (not yet delivered,
// renamed, deleted), loadLegalDoc returns null and legal.ejs automatically
// falls back to the "not published yet" placeholder notice instead of
// showing broken or stale content - never hardcode legal copy directly into
// this controller.
function legalPage(pageName, filename) {
  return function (req, res) {
    res.render("pages/legal", {
      title: pageName + " — RootSystems",
      pageName,
      doc: loadLegalDoc(filename)
    });
  };
}

module.exports = {
  home,
  pricingPage,
  terms: legalPage("Terms of Service", "RootSystems_Terms_of_Service.md"),
  privacy: legalPage("Privacy Policy", "RootSystems_Privacy_Policy.md"),
  refund: legalPage("Refund Policy", "RootSystems_Refund_Policy.md")
};
