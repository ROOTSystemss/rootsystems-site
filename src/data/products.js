// Add future products here — the numbered-row grid on the homepage renders
// directly off this array, so new entries need no template changes.
//
// `href`: leave null until the product is actually reachable somewhere real. Two ways that
// happens, both valid - use whichever's actually true for a given product right now:
//   1. A direct link straight to that product's own deployed Render URL - the simple,
//      immediately-workable option, used below for Offboarding Proof/TPRA/HIPAA as of tonight
//      (each has a real, confirmed-successful Dodo test payment, so each is actually sellable -
//      the link just needs to exist). AI Compliance Readiness stays null: no Dodo product/
//      pricing exists for it yet, so there's nothing to actually sell there.
//   2. Once/if it's worth the infra work, the product's own Express app mounted at a subfolder
//      path on this domain instead (see the routing comment block in src/app.js) - set href to
//      that path (e.g. "/offboarding-proof") instead of the external URL, and everything else
//      here (this file, home.ejs) needs no change either way - the template already renders a
//      real <a> whenever href is set, external or internal.
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
    href: "https://offboarding-proof.onrender.com"
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
    href: "https://tpra.onrender.com"
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
    href: "https://hipaa-g37n.onrender.com"
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
