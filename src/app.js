const path = require("path");
const express = require("express");

const siteRoutes = require("./routes/siteRoutes");

// Future route modules get required + mounted here as the site grows, e.g.:
// const blogRoutes = require("./routes/blogRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "..", "public")));

// This parent site mounts at "/" — rootsystems.app itself. Individual
// products live at subfolder paths on the SAME domain (rootsystems.app/tpra,
// rootsystems.app/offboarding-proof, etc.), not on subdomains — subfolders
// keep the whole site's SEO/domain authority in one place instead of
// splitting it across subdomains, which is why this matters.
app.use("/", siteRoutes);

// ===========================================================
// How to mount a product here later
// ===========================================================
// Each product (TPRA, Offboarding Proof, ...) is its OWN Express app in its
// own repo right now, running standalone on its own port for local dev. To
// put one live at rootsystems.app/<product-slug>, there are two real options
// once you're ready to deploy this site for real:
//
// Option A — reverse-proxy at the infra layer (recommended for two separate
// codebases/deploys): keep each product as its own deployed service, and
// have Cloudflare (or whatever sits in front of rootsystems.app) route
// requests for /tpra/* to the TPRA service and /offboarding-proof/* to that
// service, while everything else falls through to this app. Nothing in this
// repo needs to change for that - it's a routing rule at the edge.
//
// Option B — mount the product's Express app instance directly in this
// process, if it's ever simpler to run all of them together:
//   const tpraApp = require("../../tpra-tool/src/app"); // exports the app, doesn't call .listen()
//   app.use("/tpra", tpraApp);
// The product app would need two adjustments to make this work cleanly:
//   1. Export the `app` instance instead of calling app.listen() directly
//      (see how this file's own server.js is split out for that reason).
//   2. Any absolute internal links/redirects/static asset paths inside that
//      product ("/dashboard", "/css/style.css", etc.) need to become
//      relative or prefixed with req.baseUrl, since they'd now be served
//      under /tpra instead of at the domain root.
//
// Either way, product rows in src/data/products.js get an `href` pointing at
// the subfolder path (e.g. "/tpra") once that product is actually reachable
// there - the homepage template already renders a real <a> instead of a
// plain <div> the moment `href` is set.
// ===========================================================

app.use((req, res) => {
  res.status(404).render("pages/not-found", {
    title: "Page not found — RootSystems"
  });
});

module.exports = app;
