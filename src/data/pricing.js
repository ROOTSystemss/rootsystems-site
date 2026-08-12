// Pricing shown on /pricing is PLACEHOLDER until real numbers are confirmed —
// see the flagged notice rendered at the top of that page. Tier names and
// structure follow the Starter/Pro shape already used in Offboarding Proof's
// own billing code; the dollar amounts below are intentionally unset ("XX")
// rather than a fabricated realistic-looking number, so nothing here can be
// mistaken for a real, final price.
//
// `blurb` is real (pulled from what the product actually does), never
// placeholder text — only the numbers are pending.
const pricing = [
  {
    slug: "offboarding-proof",
    name: "Offboarding Proof",
    blurb: "Verifiable proof that departing employees actually lost access — on the day it happened, not weeks later.",
    tiers: [
      { name: "Starter", price: "XX", period: "mo", note: "Core connectors, tamper-evident reports" },
      { name: "Pro", price: "XX", period: "mo", note: "Higher employee limits, priority support" }
    ]
  },
  {
    slug: "tpra",
    name: "TPRA — Vendor Risk",
    blurb: "Third-party risk assessment for the vendors and partners that touch your data, scored deterministically.",
    tiers: [
      { name: "Starter", price: "XX", period: "mo", note: "Core questionnaire, tamper-evident reports" },
      { name: "Pro", price: "XX", period: "mo", note: "Persistent risk register, team roles" }
    ]
  },
  {
    slug: "hipaa",
    name: "HIPAA Compliance Tool",
    blurb: "A guided risk assessment built around what HIPAA actually requires you to show, not generic checkbox theater.",
    tiers: [
      { name: "Starter", price: "XX", period: "mo", note: "Security Rule assessment, risk register" },
      { name: "Pro", price: "XX", period: "mo", note: "BAA vendor tracking, team roles" }
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
