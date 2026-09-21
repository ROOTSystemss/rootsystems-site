// Homepage product listing, grouped into three "floors" by domain. Each floor
// has its own accent color (see :root tokens in style.css) applied as a
// left-border/badge/label accent — never a full background wash.
//
// `status` must be the literal truth, not marketing aspiration:
//   LIVE            — real product, reachable, sellable today
//   Private Preview — real product, works, not open for self-serve signup yet
//   Coming Soon     — announced, not yet built/reachable
//   In development  — being built, no usable interface yet
//   Early Stage     — exploratory/prototype work, no committed timeline
//
// `href`: same convention as before — null/`/contact` until something real
// exists to send a visitor to; a live product's own deployed URL otherwise.
const sections = [
  {
    slug: "grc",
    label: "Standards & GRC",
    lead: "Prove the compliance work actually happened.",
    color: "saffron"
  },
  {
    slug: "engineering",
    label: "Engineering & Infra",
    lead: "Decision intelligence for the systems compliance work runs on top of.",
    color: "green"
  },
  {
    slug: "ai-governance",
    label: "AI Governance & Trust",
    lead: "Accountability for what AI agents are actually authorized to do.",
    color: "violet"
  }
];

const products = [
  {
    section: "grc",
    name: "Offboarding Proof",
    category: "Identity & access",
    description:
      "Employee left. Google + Slack + GitHub access revoked. Auditor asking for evidence.",
    outcome: "Turn every departure into a defensible access-removal record.",
    capabilities: ["Access evidence", "Connector checks", "Proof bundle"],
    accent: "coral",
    status: "LIVE",
    href: "https://offboarding-proof.onrender.com"
  },
  {
    section: "grc",
    name: "TPRA — Vendor Risk",
    category: "Third-party risk",
    description:
      "Clients asking: who approved this vendor? Need proof of risk assessment.",
    outcome: "Move from vendor answers to a consistent, explainable risk decision.",
    capabilities: ["Guided assessment", "Risk scoring", "Review trail"],
    accent: "violet",
    status: "LIVE",
    href: "https://tpra.onrender.com"
  },
  {
    section: "grc",
    name: "HIPAA Compliance Tool",
    category: "Healthcare compliance",
    description:
      "HIPAA audit in 14 days. Needs risk assessment + gap analysis + tamper-evident report.",
    outcome: "Keep assessments, risks, BAAs, and training evidence in one workspace.",
    capabilities: ["Security assessment", "Risk register", "BAA & training"],
    accent: "aqua",
    status: "LIVE",
    href: "https://hipaa-g37n.onrender.com"
  },
  {
    section: "engineering",
    name: "Authority Atlas / Supply Atlas",
    category: "Supply chain intelligence",
    description:
      "Needs adaptive supply chain decision intelligence. Data cannot leave India.",
    outcome: "Identify structural supply-chain gaps without the data leaving the country.",
    capabilities: ["Adaptive optimization", "Local-first deployment", "Explainable findings"],
    accent: "amber",
    status: "Private Preview",
    href: "/contact"
  },
  {
    section: "ai-governance",
    name: "AI Compliance Readiness",
    category: "AI governance",
    description:
      "EU AI Act enforcement approaching. Needs ISO 42001 readiness + serious-incident classification.",
    outcome: "Translate AI governance obligations into a concrete readiness path.",
    capabilities: ["ISO 42001 gaps", "Incident triage", "Deadline logic"],
    accent: "amber",
    status: "Coming Soon",
    href: "/contact"
  },
  {
    section: "ai-governance",
    name: "Trust Proof / Accountability Signatures",
    category: "AI governance",
    description:
      "Need to prove WHICH named human approved a compliance decision — independently verifiable.",
    outcome: "Give every automated decision a signed, independently checkable human owner.",
    capabilities: ["Cryptographic signing", "Independent verification", "Decision trail"],
    accent: "violet",
    status: "In development",
    href: null
  },
  {
    section: "ai-governance",
    name: "Agent Contract Gap",
    category: "AI-agent authority",
    description:
      "Our AI agent signs contracts autonomously. Does our insurance actually cover that authority?",
    outcome: "Identify structural gaps before delegating contract authority to an agent.",
    capabilities: ["Authority profiles", "Insurance-gap analysis", "Evidence-linked findings"],
    accent: "violet",
    status: "Early Stage",
    href: "/contact"
  }
];

module.exports = { sections, products };
