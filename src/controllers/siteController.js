const products = require("../data/products");
const resources = require("../data/resources");
const pricing = require("../data/pricing");
const { loadLegalDoc } = require("../utils/markdown");
const { saveContactSubmission } = require("../services/contactService");
const { sendContactEmail } = require("../services/emailService");

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

function contactPage(req, res) {
  res.render("pages/contact", {
    title: "Contact — RootSystems",
    submitted: false,
    errors: {},
    values: {}
  });
}

async function submitContact(req, res, next) {
  const values = {
    name: String(req.body.name || "").trim().slice(0, 100),
    email: String(req.body.email || "").trim().slice(0, 160),
    requestType: String(req.body.requestType || "").trim().slice(0, 40),
    message: String(req.body.message || "").trim().slice(0, 3000)
  };

  // Quietly accept bot submissions without writing them to disk.
  if (req.body.website) {
    return res.render("pages/contact", {
      title: "Message received — RootSystems",
      submitted: true,
      errors: {},
      values: {}
    });
  }

  const errors = {};
  const allowedTypes = ["suggestion", "recommendation", "product-question", "other"];
  if (values.name.length < 2) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Please enter a valid email address.";
  if (!allowedTypes.includes(values.requestType)) errors.requestType = "Please choose a message type.";
  if (values.message.length < 10) errors.message = "Please add a little more detail (at least 10 characters).";

  if (Object.keys(errors).length) {
    return res.status(400).render("pages/contact", {
      title: "Contact — RootSystems",
      submitted: false,
      errors,
      values
    });
  }

  try {
    // Keep a local record as a backup, but do not let a storage problem
    // prevent an otherwise valid email from reaching RootSystems.
    try {
      await saveContactSubmission(values);
    } catch (storageError) {
      console.error("Contact backup could not be saved:", storageError);
    }

    await sendContactEmail(values);
    return res.render("pages/contact", {
      title: "Message received — RootSystems",
      submitted: true,
      errors: {},
      values: {}
    });
  } catch (error) {
    console.error("Contact email could not be delivered:", error);
    return res.status(503).render("pages/contact", {
      title: "Contact — RootSystems",
      submitted: false,
      errors: {
        general: "We couldn’t send your message right now. Please try again shortly or email therootsystems.ops@gmail.com directly."
      },
      values
    });
  }
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
  contactPage,
  submitContact,
  pricingPage,
  terms: legalPage("Terms of Service", "RootSystems_Terms_of_Service.md"),
  privacy: legalPage("Privacy Policy", "RootSystems_Privacy_Policy.md"),
  refund: legalPage("Refund Policy", "RootSystems_Refund_Policy.md")
};
