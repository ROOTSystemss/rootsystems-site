// Pricing data for the progressive-disclosure /pricing page (three entry
// choices — one tool / a bundle / everything — each revealing its own list).
//
// Stage 1 list prices from Master Plan Appendix A (locked Phase 0).
// `tools` mirrors products.js, with Agent Certificates, the Action Ledger and
// Contract & Insurance Gap sold together as AI Agent Trust. Tier numbers
// and notes must match each app's own plan definitions once ROOT updates
// processor prices: plans differ by counts, not by features, so notes describe
// the count each plan allows.
//
// Bundles and RootSystems Complete show Stage 1 prices; checkout across
// products is not wired yet, so CTAs route to /contact (or signup where a
// single product still applies).
const tools = [
  {
    slug: "offboarding-proof",
    name: "Offboarding Proof",
    section: "compliance",
    blurb: "Verifiable proof that departing employees actually lost access — on the day it happened, not weeks later.",
    href: "https://offboarding-proof.onrender.com/signup",
    tiers: [
      { name: "Free", price: "0", period: "mo", note: "Up to 5 people monitored" },
      { name: "Team", price: "99", period: "mo", note: "Up to 50 people. Annual = 10× monthly." },
      { name: "Business", price: "299", period: "mo", note: "Up to 250 people. Enterprise from $799/mo for unlimited / multi-client." }
    ]
  },
  {
    slug: "tpra",
    name: "Vendor Risk",
    section: "compliance",
    blurb: "Third-party risk assessment for the vendors and partners that touch your data, scored deterministically.",
    href: "https://tpra.onrender.com/signup",
    tiers: [
      { name: "Free", price: "0", period: "mo", note: "1 vendor assessment" },
      { name: "Team", price: "99", period: "mo", note: "Up to 25 vendors" },
      { name: "Business", price: "249", period: "mo", note: "Up to 100 vendors. Enterprise from $599/mo." }
    ]
  },
  {
    slug: "hipaa",
    name: "HIPAA",
    section: "compliance",
    blurb: "A guided risk assessment built around what HIPAA actually requires you to show, not generic checkbox theater.",
    href: "https://hipaa-g37n.onrender.com/signup",
    tiers: [
      { name: "Free", price: "0", period: "mo", note: "1 risk assessment" },
      { name: "Practice", price: "149", period: "mo", note: "1 location" },
      { name: "Clinic", price: "349", period: "mo", note: "Up to 5 locations. Group from $799/mo." }
    ]
  },
  {
    slug: "compliance-readiness",
    name: "Standards Readiness",
    section: "compliance",
    blurb: "Readiness for 12 standards: SOC 2, ISO 27001, PCI DSS, NIST CSF 2.0, GDPR, CCPA/CPRA, CMMC Level 2, NIS2, DORA, ISO 42001, EU AI Act Article 50 and NIST AI RMF. Attach evidence to each control; every report is signed. Priced per standard.",
    href: "https://ai-compliance-readiness.onrender.com/signup",
    tiers: [
      { name: "Free", price: "0", period: "mo", note: "Your first assessment, on any standard" },
      { name: "Core", price: "149", period: "mo", note: "Per Core standard: NIST CSF 2.0, GDPR, CCPA/CPRA, PCI DSS, NIS2, NIST AI RMF" },
      { name: "Advanced", price: "249", period: "mo", note: "Per Advanced standard: SOC 2, ISO 27001, CMMC Level 2, DORA, ISO 42001, EU AI Act Article 50. All 12 for $799/mo." }
    ]
  },
  {
    slug: "agent-governance",
    name: "AI Agent Trust",
    section: "agents",
    blurb: "Agent Certificates, the Action Ledger and Contract & Insurance Gap in one console: signed agent certificates, a live action ledger, named sign-off and insurance coverage.",
    href: "https://agent-contract-gap.onrender.com/console",
    tiers: [
      { name: "Trial", price: "0", period: "mo", note: "Up to 2 active agent certificates" },
      { name: "Team", price: "499", period: "mo", note: "Up to 10 agents, ledger, named sign-off" },
      { name: "Business", price: "1,499", period: "mo", note: "Up to 100 agents, priority support. Enterprise from $3,999/mo." }
    ]
  }
];

const bundles = [
  {
    slug: "compliance-starter",
    name: "Compliance Starter",
    section: "compliance",
    price: "279",
    period: "mo",
    separately: "347",
    blurb: "Offboarding Team + Vendor Risk Team + 1 Core standard.",
    includes: ["Offboarding Proof Team", "Vendor Risk Team", "1 Core standard"],
    href: "/contact?topic=" + encodeURIComponent("Compliance Starter bundle")
  },
  {
    slug: "clinic-proof",
    name: "Clinic Proof Pack",
    section: "compliance",
    price: "449",
    period: "mo",
    separately: "547",
    blurb: "HIPAA Clinic + Offboarding Team + Vendor Risk Team.",
    includes: ["HIPAA Clinic", "Offboarding Proof Team", "Vendor Risk Team"],
    href: "/contact?topic=" + encodeURIComponent("Clinic Proof Pack")
  },
  {
    slug: "compliance-pro",
    name: "Compliance Pro",
    section: "compliance",
    price: "1,299",
    period: "mo",
    separately: "1,696",
    blurb: "All four Compliance modules at Business level, including all 12 standards.",
    includes: ["Offboarding Business", "Vendor Risk Business", "HIPAA Clinic", "All 12 standards"],
    href: "/contact?topic=" + encodeURIComponent("Compliance Pro bundle")
  },
  {
    slug: "it-provider-partner",
    name: "IT Provider Partner",
    section: "compliance",
    price: "799",
    period: "mo",
    separately: null,
    blurb: "Offboarding + Vendor Risk for 10 client companies, one dashboard. +$59 per extra client.",
    includes: ["Offboarding Proof", "Vendor Risk", "10 client companies"],
    href: "/contact?topic=" + encodeURIComponent("IT Provider Partner plan")
  }
];

const everything = {
  slug: "everything",
  name: "RootSystems Complete",
  price: "1,999",
  period: "mo",
  separately: "2,397",
  blurb: "Compliance Pro + PQC Forge Team + AI Agent Trust Team on one bill.",
  includes: ["Compliance Pro", "PQC Forge Team", "AI Agent Trust Team"],
  href: "/contact?topic=" + encodeURIComponent("RootSystems Complete")
};

// Self-serve CTAs for these tiers live on /pricing#pqc-forge and point at
// PQC_FORGE_PUBLIC_URL (default https://pqc-forge.onrender.com). Stage 1 prices.
const pqcPlans = [
  { name: "Community", price: "0", period: "mo", note: "Public repositories" },
  { name: "Pro", price: "79", period: "repo", note: "Private repos, migration PRs, evidence history" },
  { name: "Team", price: "599", period: "mo", note: "Up to 20 repositories, policy gates, shared evidence" },
  { name: "Business", price: "1,499", period: "mo", note: "Up to 75 repositories, company sign-in, priority support" }
];

const agentExtras = [
  { name: "Contract Gap analysis", price: "499", period: "each", note: "One AI contract and insurance review" },
  { name: "Broker plan", price: "1,999", period: "mo", note: "Up to 10 analyses a month for brokers and counsel" }
];

module.exports = { tools, bundles, everything, pqcPlans, agentExtras };
