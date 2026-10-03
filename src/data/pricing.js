// Pricing data for the progressive-disclosure /pricing page (three entry
// choices — one tool / a bundle / everything — each revealing its own list).
//
// `tools` mirrors products.js, with Agent Certificates, the Action Ledger and
// Contract & Insurance Gap sold together as AI Agent Trust. Tier numbers
// and notes must match each app's own plan definitions (billingLib.js, or
// src/governance/billing.ts for the console): plans differ by counts, not
// by features, so notes describe the count each plan allows. A tool without
// real numbers has no `tiers` and is marked `contactOnly: true`, so the page
// renders "Contact for early access" instead of a fabricated price.
//
// `bundles` and `everything` intentionally carry no prices at all — they need
// one checkout across products, which doesn't exist yet, so both route to
// /contact rather than inventing a number.
const tools = [
  {
    slug: "offboarding-proof",
    name: "Offboarding Proof",
    section: "grc",
    blurb: "Verifiable proof that departing employees actually lost access — on the day it happened, not weeks later.",
    href: "https://offboarding-proof.onrender.com/signup",
    tiers: [
      { name: "Free", price: "0", period: "mo", note: "Up to 5 employees monitored" },
      { name: "Team", price: "79", period: "mo", note: "Up to 50 employees monitored" },
      { name: "Business", price: "249", period: "mo", note: "Up to 250 employees monitored. More, or many client companies? Ask about Enterprise." }
    ]
  },
  {
    slug: "tpra",
    name: "Vendor Risk",
    section: "grc",
    blurb: "Third-party risk assessment for the vendors and partners that touch your data, scored deterministically.",
    href: "https://tpra.onrender.com/signup",
    tiers: [
      { name: "Free", price: "0", period: "mo", note: "1 vendor assessment" },
      { name: "Team", price: "79", period: "mo", note: "Up to 25 vendor assessments" },
      { name: "Business", price: "199", period: "mo", note: "Up to 100 vendor assessments" }
    ]
  },
  {
    slug: "hipaa",
    name: "HIPAA",
    section: "grc",
    blurb: "A guided risk assessment built around what HIPAA actually requires you to show, not generic checkbox theater.",
    href: "https://hipaa-g37n.onrender.com/signup",
    tiers: [
      { name: "Free", price: "0", period: "mo", note: "1 risk assessment" },
      { name: "Practice", price: "99", period: "mo", note: "Up to 3 risk assessments per rolling 12 months" },
      { name: "Clinic", price: "249", period: "mo", note: "Unlimited risk assessments" }
    ]
  },
  {
    slug: "compliance-readiness",
    name: "Standards Readiness",
    section: "grc",
    blurb: "Readiness for 12 standards: SOC 2, ISO 27001, PCI DSS, NIST CSF 2.0, GDPR, CCPA/CPRA, CMMC Level 2, NIS2, DORA, ISO 42001, EU AI Act Article 50 and NIST AI RMF. Attach evidence to each control; every report is signed. Priced per standard.",
    href: "https://ai-compliance-readiness.onrender.com/signup",
    tiers: [
      { name: "Free", price: "0", period: "mo", note: "Your first assessment, on any standard" },
      { name: "Per standard", price: "129", period: "mo", note: "$129 (NIST CSF, GDPR, CCPA, PCI DSS, NIS2, NIST AI RMF) or $199 (SOC 2, ISO 27001, CMMC, DORA, ISO 42001, EU AI Act)" },
      { name: "Every standard", price: "599", period: "mo", note: "All 12 standards for one workspace" }
    ]
  },
  {
    slug: "agent-governance",
    name: "AI Agent Trust",
    section: "grc",
    blurb: "Agent Certificates, the Action Ledger and Contract & Insurance Gap in one console: signed agent certificates, a live action ledger, named sign-off and insurance coverage.",
    href: "https://agent-contract-gap.onrender.com/console",
    tiers: [
      { name: "Trial", price: "0", period: "mo", note: "Up to 2 active agent certificates" },
      { name: "Team", price: "399", period: "mo", note: "Up to 10 active agent certificates" },
      { name: "Business", price: "1,199", period: "mo", note: "Up to 100 active agent certificates, priority support" }
    ]
  }
];

const bundles = [
  {
    slug: "grc-bundle",
    name: "Compliance Proof bundle",
    section: "grc",
    blurb: "Offboarding Proof, Vendor Risk and HIPAA together.",
    includes: ["Offboarding Proof", "Vendor Risk", "HIPAA"]
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
