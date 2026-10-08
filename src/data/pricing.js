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
// `bundles` and `everything` carry no bundle price: there is no checkout across
// products yet, so they show what the parts cost separately (computed from the
// tiers below) and route to /contact rather than inventing a discount.
// `proofPlus` is the premium "talk to us" tier: a "from" price, never a checkout.
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
      { name: "Free", price: "0", period: "mo", note: "5 vendor assessments" },
      { name: "Team", price: "99", period: "mo", note: "Up to 25 vendor assessments" },
      { name: "Business", price: "299", period: "mo", note: "Up to 100 vendor assessments" }
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
      { name: "Team", price: "249", period: "mo", note: "Up to 25 active agent certificates" },
      { name: "Business", price: "1,199", period: "mo", note: "Up to 100 active agent certificates, priority support" }
    ]
  }
];

// Monthly price of one tier, read from `tools` above so bundles can never drift from the live list.
function tierPrice(slug, tierName) {
  const tool = tools.find(function (t) { return t.slug === slug; });
  const tier = tool && tool.tiers && tool.tiers.find(function (t) { return t.name === tierName; });
  if (!tier) throw new Error("pricing.js: no tier " + tierName + " on " + slug);
  return Number(String(tier.price).replace(/,/g, ""));
}
const CORE_STANDARD = 129; // the lower per-standard price (standards.js)
const ALL_STANDARDS = 599; // standards.js BUNDLE_USD

function usd(n) { return n.toLocaleString("en-US"); }

// Bundles have no single checkout yet, so they carry no invented bundle price: the card shows what
// the parts cost separately (from the live prices) and asks the buyer to talk to us for the bundle.
function bundle(slug, name, blurb, parts) {
  const total = parts.reduce(function (sum, p) { return sum + p.usd; }, 0);
  return {
    slug,
    name,
    section: "grc",
    blurb,
    includes: parts.map(function (p) { return p.label; }),
    separately: usd(total),
    href: "/contact?topic=" + encodeURIComponent(name + " bundle")
  };
}

const bundles = [
  bundle("compliance-starter", "Compliance Starter", "The first proof most small companies are asked for: people leaving, vendors, and one standard.", [
    { label: "Offboarding Proof Team", usd: tierPrice("offboarding-proof", "Team") },
    { label: "Vendor Risk Team", usd: tierPrice("tpra", "Team") },
    { label: "One standard (NIST CSF, GDPR, CCPA, PCI DSS, NIS2 or NIST AI RMF)", usd: CORE_STANDARD }
  ]),
  bundle("clinic-proof-pack", "Clinic Proof Pack", "For practices and clinics: the HIPAA risk assessment plus proof that leavers lost access and vendors were checked.", [
    { label: "HIPAA Clinic", usd: tierPrice("hipaa", "Clinic") },
    { label: "Offboarding Proof Team", usd: tierPrice("offboarding-proof", "Team") },
    { label: "Vendor Risk Team", usd: tierPrice("tpra", "Team") }
  ]),
  bundle("compliance-pro", "Compliance Pro", "Every Compliance Proof product at its top plan, with all 12 standards.", [
    { label: "Offboarding Proof Business", usd: tierPrice("offboarding-proof", "Business") },
    { label: "Vendor Risk Business", usd: tierPrice("tpra", "Business") },
    { label: "HIPAA Clinic", usd: tierPrice("hipaa", "Clinic") },
    { label: "All 12 standards", usd: ALL_STANDARDS }
  ])
];

// "Everything": every subscription product (PQC Forge is a one-off report, so it is not included).
const everything = (function () {
  const parts = [
    { label: "Offboarding Proof Business", usd: tierPrice("offboarding-proof", "Business") },
    { label: "Vendor Risk Business", usd: tierPrice("tpra", "Business") },
    { label: "HIPAA Clinic", usd: tierPrice("hipaa", "Clinic") },
    { label: "All 12 standards", usd: ALL_STANDARDS },
    { label: "AI Agent Trust Team", usd: tierPrice("agent-governance", "Team") }
  ];
  return Object.assign(bundle("everything", "RootSystems Complete", "Every RootSystems subscription on one bill and one contact.", parts), { section: "all" });
})();

// IT providers (MSPs) managing many client companies: priced per client, by quote.
const partner = {
  slug: "it-provider-partner",
  name: "IT Provider Partner",
  blurb: "Offboarding Proof and Vendor Risk for the client companies you manage, from one login, with reports under each client's name.",
  includes: ["Offboarding Proof", "Vendor Risk", "One dashboard across clients", "Priced per client company"],
  href: "/contact?topic=" + encodeURIComponent("IT Provider Partner plan")
};

// Proof+: the premium tier for the advancements. Quote only, never a checkout.
const proofPlus = {
  slug: "proof-plus",
  name: "Proof+",
  from: "799",
  blurb: "For companies whose auditors, insurers or customers want more than a report: evidence sealed at the source and checks that run on their own.",
  features: [
    { title: "Evidence sealed at the source", text: "Each answer from Microsoft 365, Google Workspace or Okta is signed the moment it arrives, with the system's own request ID, so an auditor can trace it back." },
    { title: "Reality checks", text: "Terminated in HR but still active in the directory, and MFA required by policy but missing on real accounts, listed account by account with the reason." },
    { title: "Two independent timestamps", text: "A Bitcoin-anchored proof plus a standard RFC 3161 timestamp from a public timestamp authority, on every report." },
    { title: "Continuous checks and priority support", text: "Checks run on a schedule instead of once a quarter, and a person answers within one business day." }
  ],
  href: "/contact?topic=" + encodeURIComponent("Proof+")
};

module.exports = { tools, bundles, everything, partner, proofPlus };
