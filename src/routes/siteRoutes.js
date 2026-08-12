const { Router } = require("express");

const { home } = require("../controllers/siteController");

const router = Router();

router.get("/", home);

// About/Products/Resources are same-page sections (#about, #products,
// #resources) on the homepage, not separate routes - see home.ejs.
// Future top-level pages get added the same way as `home`, e.g.:
// router.get("/blog", blogIndex);
// router.get("/blog/:slug", blogPost);

module.exports = router;
