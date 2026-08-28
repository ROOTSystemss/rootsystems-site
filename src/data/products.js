// Add future products here — the numbered-row grid on the homepage renders
// directly off this array, so new entries need no template changes.
//
// `href`: leave null until the product's own Express app is actually mounted
// at its subfolder path on this domain (see the routing comment block in
// src/app.js). Once e.g. Offboarding Proof is reachable at /offboarding-proof
// on this domain, set href to that path and the row becomes a real link.
const products = [
  {
    number: "01",
    name: "Offboarding Proof",
    category: "Identity & access",
    description:
      "Verifiable proof that departing employees actually lost access - on the day it happened, not weeks later.",
    outcome: "Turn every departure into a defensible access-removal record.",
    capabilities: ["Access evidence", "Connector checks", "Proof bundle"],
    accent: "coral",
    status: "LIVE",
    href: null
  },
  {
    number: "02",
    name: "TPRA — Vendor Risk",
    category: "Third-party risk",
    description:
      "Third-party risk assessment for the vendors and partners that touch your data, scored deterministically.",
    outcome: "Move from vendor answers to a consistent, explainable risk decision.",
    capabilities: ["Guided assessment", "Risk scoring", "Review trail"],
    accent: "violet",
    status: "LIVE",
    href: null
  },
  {
    number: "03",
    name: "HIPAA Compliance Tool",
    category: "Healthcare compliance",
    description:
      "A guided risk assessment built around what HIPAA actually requires you to show, not generic checkbox theater.",
    outcome: "Keep assessments, risks, BAAs, and training evidence in one workspace.",
    capabilities: ["Security assessment", "Risk register", "BAA & training"],
    accent: "aqua",
    status: "LIVE",
    href: null
  },
  {
    number: "04",
    name: "AI Compliance Readiness",
    category: "AI governance",
    description:
      "ISO 42001 gap analysis and EU AI Act incident classification, with deterministic legal deadlines a model never touches.",
    outcome: "Translate AI governance obligations into a concrete readiness path.",
    capabilities: ["ISO 42001 gaps", "Incident triage", "Deadline logic"],
    accent: "amber",
    status: "LIVE",
    href: null
  }
];

module.exports = products;
