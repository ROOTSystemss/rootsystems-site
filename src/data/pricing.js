// Pricing data for the progressive-disclosure /pricing page (three entry
// choices — one tool / a bundle / everything — each revealing its own list).
//
// `tools` mirrors products.js except Trust Proof, which has no interface yet and is not sold. Offboarding Proof/TPRA/HIPAA carry
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
    href: "https://offboarding-proof.onrender.com/signup",
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
    href: "https://tpra.onrender.com/signup",
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
    href: "https://hipaa-g37n.onrender.com/signup",
    tiers: [
      { name: "Free", price: "0", period: "mo", note: "1 assessment" },
      { name: "Starter", price: "59", period: "mo", note: "Security Rule assessment, risk register" },
      { name: "Pro", price: "149", period: "mo", note: "BAA vendor tracking, team roles" }
    ]
  },
  {
    slug: "compliance-readiness",
    name: "Compliance Readiness",
    section: "grc",
    blurb: "Readiness for 12 standards: SOC 2, ISO 27001, PCI DSS, NIST CSF 2.0, GDPR, CCPA/CPRA, CMMC Level 2, NIS2, DORA, ISO 42001, EU AI Act Article 50 and NIST AI RMF. Attach evidence to each control; every report is signed. Priced per standard.",
    href: "https://ai-compliance-readiness.onrender.com/signup",
    tiers: [
      { name: "Free", price: "0", period: "mo", note: "Your first assessment, on any standard" },
      { name: "Per standard", price: "59", period: "mo", note: "From $59 (NIST CSF, GDPR, CCPA) to $99 (SOC 2, ISO 27001, CMMC, DORA, ISO 42001)" },
      { name: "Every standard", price: "249", period: "mo", note: "All 12 standards for one workspace" }
    ]
  },
  {
    slug: "agent-governance",
    name: "Agent Governance console",
    section: "grc",
    blurb: "Authority Atlas, Trust Proof and Agent Contract Gap in one console: signed agent certificates, a live action ledger, named sign-off and insurance coverage.",
    href: "https://agent-contract-gap.onrender.com/console",
    tiers: [
      { name: "Trial", price: "0", period: "mo", note: "Up to 2 active agents" },
      { name: "Team", price: "299", period: "mo", note: "Up to 10 active agents, approvals, coverage" },
      { name: "Business", price: "999", period: "mo", note: "Up to 100 active agents, priority support" }
    ]
  }
];

const bundles = [
  {
    slug: "grc-bundle",
    name: "Standards & GRC bundle",
    section: "grc",
    blurb: "Offboarding Proof, TPRA, and the HIPAA Compliance Tool together.",
    includes: ["Offboarding Proof", "TPRA — Vendor Risk", "HIPAA Compliance Tool"]
  }
];

// "Everything" covers only products that have real pricing (every tool with tiers).
const everything = {
  slug: "everything",
  name: "Everything",
  blurb: "Every priced RootSystems product on one combined plan.",
  includes: tools.filter(function (t) { return t.tiers; }).map(function (t) { return t.name; })
};

module.exports = { tools, bundles, everything };
