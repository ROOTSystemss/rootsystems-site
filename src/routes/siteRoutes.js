const { Router } = require("express");

const {
  home,
  contactPage,
  submitContact,
  pricingPage,
  toolkitsPage,
  standardsPage,
  securityPage,
  learnPage,
  guidePage,
  securityTxt,
  terms,
  privacy,
  refund,
  dpa
} = require("../controllers/siteController");
const { verifyAgentPage, verifyAgentSubmit } = require("../controllers/verifyAgentController");

const router = Router();

router.get("/", home);
router.get("/contact", contactPage);
router.post("/contact", submitContact);

// About/Products/Resources are same-page sections (#about, #products,
// #resources) on the homepage, not separate routes - see home.ejs.
router.get("/pricing", pricingPage);
router.get("/toolkits", toolkitsPage);
router.get("/standards", standardsPage);
router.get("/security", securityPage);
router.get("/verify-agent", verifyAgentPage);
router.post("/verify-agent", verifyAgentSubmit);
router.get("/learn", learnPage);
router.get("/learn/:slug", guidePage);
router.get("/.well-known/security.txt", securityTxt);
router.get("/terms", terms);
router.get("/privacy", privacy);
router.get("/refund", refund);
router.get("/dpa", dpa);

// Future top-level pages get added the same way, e.g.:
// router.get("/blog", blogIndex);
// router.get("/blog/:slug", blogPost);

module.exports = router;
