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
    description:
      "Verifiable proof that departing employees actually lost access - on the day it happened, not weeks later.",
    status: "LIVE",
    href: null
  },
  {
    number: "02",
    name: "TPRA — Vendor Risk",
    description:
      "Third-party risk assessment for the vendors and partners that touch your data, scored deterministically.",
    status: "LIVE",
    href: null
  },
  {
    number: "03",
    name: "HIPAA Compliance Tool",
    description:
      "A guided risk assessment built around what HIPAA actually requires you to show, not generic checkbox theater.",
    status: "LIVE",
    href: null
  },
  {
    number: "04",
    name: "AI Compliance Readiness",
    description:
      "ISO 42001 gap analysis and EU AI Act incident classification, with deterministic legal deadlines a model never touches.",
    status: "LIVE",
    href: null
  }
];

module.exports = products;
