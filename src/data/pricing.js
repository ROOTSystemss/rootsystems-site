// Pricing shown on /pricing. Offboarding Proof/TPRA/HIPAA are CONFIRMED, real
// numbers - they match the actual Dodo Payments products created for each
// app's own billing (see each app's billingLib.js) and the actual Dodo
// product ids each app's checkout uses, not a marketing-only figure that
// could drift from what a customer is really charged. AI Compliance
// Readiness has no Dodo product yet, so it's still intentionally "XX"
// (see the notice rendered at the top of that page, which reflects this
// split) rather than a fabricated realistic-looking number.
//
// `blurb` is real (pulled from what the product actually does), never
// placeholder text.
//
// `href`: same convention as products.js - null until a product is actually purchasable
// somewhere real, then a direct link to its deployed URL (or, later, a subfolder path on this
// domain - see products.js's header comment). Offboarding Proof is the first to get one: its
// Dodo checkout is fully confirmed working with a real test payment as of tonight, so this page
// can actually send someone there to subscribe, not just look at a price.
const pricing = [
  {
    slug: "offboarding-proof",
    name: "Offboarding Proof",
    blurb: "Verifiable proof that departing employees actually lost access — on the day it happened, not weeks later.",
    href: "https://offboarding-proof.onrender.com",
    tiers: [
      { name: "Starter", price: "39", period: "mo", note: "Core connectors, tamper-evident reports" },
      { name: "Pro", price: "149", period: "mo", note: "Higher employee limits, priority support" }
    ]
  },
  {
    slug: "tpra",
    name: "TPRA — Vendor Risk",
    blurb: "Third-party risk assessment for the vendors and partners that touch your data, scored deterministically.",
    tiers: [
      { name: "Starter", price: "29", period: "mo", note: "Core questionnaire, tamper-evident reports" },
      { name: "Pro", price: "79", period: "mo", note: "Persistent risk register, team roles" }
    ]
  },
  {
    slug: "hipaa",
    name: "HIPAA Compliance Tool",
    blurb: "A guided risk assessment built around what HIPAA actually requires you to show, not generic checkbox theater.",
    tiers: [
      { name: "Starter", price: "59", period: "mo", note: "Security Rule assessment, risk register" },
      { name: "Pro", price: "149", period: "mo", note: "BAA vendor tracking, team roles" }
    ]
  },
  {
    slug: "ai-compliance",
    name: "AI Compliance Readiness",
    blurb: "ISO 42001 gap analysis and EU AI Act incident classification, with deterministic legal deadlines a model never touches.",
    tiers: [
      { name: "Starter", price: "XX", period: "mo", note: "ISO 42001 readiness assessment" },
      { name: "Pro", price: "XX", period: "mo", note: "EU AI Act incident classification module" }
    ]
  }
];

module.exports = pricing;
