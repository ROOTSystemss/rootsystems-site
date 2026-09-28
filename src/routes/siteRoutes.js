const { Router } = require("express");

const {
  home,
  contactPage,
  submitContact,
  pricingPage,
  terms,
  privacy,
  refund,
  dpa
} = require("../controllers/siteController");

const router = Router();

router.get("/", home);
router.get("/contact", contactPage);
router.post("/contact", submitContact);

// About/Products/Resources are same-page sections (#about, #products,
// #resources) on the homepage, not separate routes - see home.ejs.
router.get("/pricing", pricingPage);
router.get("/terms", terms);
router.get("/privacy", privacy);
router.get("/refund", refund);
router.get("/dpa", dpa);

// Future top-level pages get added the same way, e.g.:
// router.get("/blog", blogIndex);
// router.get("/blog/:slug", blogPost);

module.exports = router;
