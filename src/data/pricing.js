// Pricing data for the progressive-disclosure /pricing page (three entry
// choices — one tool / a bundle / everything — each revealing its own list).
//
// `tools` mirrors products.js 1:1. Offboarding Proof/TPRA/HIPAA carry
// CONFIRMED, real tier numbers — they match each app's own billingLib.js
// plan definitions and the actual Dodo Payments products each app's
// checkout uses. Every other tool has no `tiers` and is marked
// `contactOnly: true` — there is no real number to show yet, so the page
// renders "Contact for early access" instead of a fabricated one.
//
// `bundles` and `everything` intentionally carry no prices at all — bundle/
// combined pricing hasn't been decided, so both route to /contact rather
// than inventing a number.
const tools = [
  {
    slug: "offboarding-proof",
    name: "Offboarding Proof",
    section: "grc",
    blurb: "Verifiable proof that departing employees actually lost access — on the day it happened, not weeks later.",
    href: "https://offboarding-proof.onrender.com",
    tiers: [
      { name: "Free", price: "0", period: "mo", note: "Up to 5 employees monitored, core connectors" },
      { name: "Starter", price: "39", period: "mo", note: "Up to 25 employees, all connectors, tamper-evident reports" },
      { name: "Pro", price: "149", period: "mo", note: "Unlimited employees, priority support" }
    ]
  },
  {
    slug: "tpra",
    name: "TPRA — Vendor Risk",
    section: "grc",
    blurb: "Third-party risk assessment for the vendors and partners that touch your data, scored deterministically.",
    href: "https://tpra.onrender.com",
    tiers: [
      { name: "Free", price: "0", period: "mo", note: "1 vendor assessment" },
      { name: "Starter", price: "29", period: "mo", note: "Core questionnaire, tamper-evident reports" },
      { name: "Pro", price: "79", period: "mo", note: "Persistent risk register, team roles" }
    ]
  },
  {
    slug: "hipaa",
    name: "HIPAA Compliance Tool",
    section: "grc",
    blurb: "A guided risk assessment built around what HIPAA actually requires you to show, not generic checkbox theater.",
    href: "https://hipaa-g37n.onrender.com",
    tiers: [
      { name: "Free", price: "0", period: "mo", note: "1 assessment" },
      { name: "Starter", price: "59", period: "mo", note: "Security Rule assessment, risk register" },
      { name: "Pro", price: "149", period: "mo", note: "BAA vendor tracking, team roles" }
    ]
  },
  {
    slug: "authority-atlas",
    name: "Authority Atlas / Supply Atlas",
    section: "engineering",
    blurb: "Adaptive supply chain decision intelligence — data cannot leave India.",
    contactOnly: true
  },
  {
    slug: "ai-compliance",
    name: "AI Compliance Readiness",
    section: "ai-governance",
    blurb: "ISO 42001 gap analysis and EU AI Act incident classification, with deterministic legal deadlines a model never touches.",
    contactOnly: true
  },
  {
    slug: "trust-proof",
    name: "Trust Proof / Accountability Signatures",
    section: "ai-governance",
    blurb: "Prove which named human approved a compliance decision — independently verifiable.",
    contactOnly: true
  },
  {
    slug: "agent-contract-gap",
    name: "Agent Contract Gap",
    section: "ai-governance",
    blurb: "Check whether your insurance actually covers the authority your AI agent has been given to sign contracts.",
    contactOnly: true
  }
];

const bundles = [
  {
    slug: "grc-bundle",
    name: "Standards & GRC bundle",
    section: "grc",
    blurb: "Offboarding Proof, TPRA, and the HIPAA Compliance Tool together.",
    includes: ["Offboarding Proof", "TPRA — Vendor Risk", "HIPAA Compliance Tool"]
  },
  {
    slug: "engineering-bundle",
    name: "Engineering & Infra bundle",
    section: "engineering",
    blurb: "Authority Atlas / Supply Atlas, and future engineering-floor products as they ship.",
    includes: ["Authority Atlas / Supply Atlas"]
  },
  {
    slug: "ai-governance-bundle",
    name: "AI Governance bundle",
    section: "ai-governance",
    blurb: "AI Compliance Readiness, Trust Proof, and Agent Contract Gap together.",
    includes: ["AI Compliance Readiness", "Trust Proof / Accountability Signatures", "Agent Contract Gap"]
  }
];

const everything = {
  slug: "everything",
  name: "Everything",
  blurb: "Every RootSystems product, across all three floors, on one combined plan.",
  includes: tools.map(function (t) { return t.name; })
};

module.exports = { tools, bundles, everything };
