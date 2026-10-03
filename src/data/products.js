// Homepage product listing, grouped by how a customer can buy today.
//
// `status` must be the literal truth, not marketing aspiration:
//   LIVE     — deployed and working today
//   PILOT    — deployed and working; sold as a guided pilot, invoiced
//   SERVICE  — delivered by us as a report, invoiced
//
// `buy` says how a visitor gets it today:
//   "self-serve" — sign up, then pay in the app (Dodo checkout)
//   "invoice"    — contact us; we invoice
//
// `question` is the question a buyer is being asked (by an auditor, a client, a
// regulator, a broker). Each product is introduced by that question.
const sections = [
  {
    slug: "compliance",
    label: "Branch 1: Compliance Proof",
    lead: "Sign up and start today. Every report is signed so anyone can check it.",
    color: "saffron"
  },
  {
    slug: "agents",
    label: "Branch 3: AI Agent Trust",
    lead: "For teams letting AI agents spend money or sign things. One console for all three; start with a free trial.",
    color: "violet"
  },
  {
    slug: "quantum",
    label: "Branch 2: Quantum-Safe",
    lead: "Find the cryptography a quantum computer will break, and the patch that fixes it.",
    color: "green"
  }
];

const products = [
  {
    section: "compliance",
    name: "Offboarding Proof",
    question: "Did everyone who left actually lose access?",
    description:
      "Checks Google Workspace, Microsoft 365, Slack, GitHub and Okta after each departure, and produces a signed record: fully revoked, or exactly what is still open.",
    price: "From $79/mo",
    status: "LIVE",
    buy: "self-serve",
    href: "https://offboarding-proof.onrender.com/signup"
  },
  {
    section: "compliance",
    name: "HIPAA",
    question: "Could you show a regulator your risk analysis today?",
    description:
      "Guided Security Rule risk assessment, a risk register that flags overdue and unowned fixes, and a signed report you can hand over.",
    price: "From $99/mo",
    status: "LIVE",
    buy: "self-serve",
    href: "https://hipaa-g37n.onrender.com/signup"
  },
  {
    section: "compliance",
    name: "Vendor Risk",
    question: "Who approved this vendor, and on what basis?",
    description:
      "Consistent vendor risk assessments with a review trail, so the answer is on record before a client asks.",
    price: "From $99/mo",
    status: "LIVE",
    buy: "self-serve",
    href: "https://tpra.onrender.com/signup"
  },
  {
    section: "compliance",
    name: "Standards Readiness",
    question: "Would you pass a SOC 2, ISO 27001 or PCI DSS audit today?",
    description:
      "Readiness checks for 12 standards, including SOC 2, ISO 27001, PCI DSS, CMMC Level 2, NIS2, DORA, GDPR, CCPA and the AI standards. Attach evidence to each control, and every report says how much is proven. Unanswered controls count against you, and every report is signed.",
    price: "From $129/mo per standard",
    status: "LIVE",
    buy: "self-serve",
    href: "https://ai-compliance-readiness.onrender.com/signup"
  },
  {
    section: "agents",
    name: "Agent Certificates",
    question: "What is this AI agent allowed to do?",
    description:
      "Issue each agent a signed certificate: its permissions, spending limit and expiry. Anyone can check it; you can revoke it at once.",
    price: "From $399/mo",
    status: "LIVE",
    buy: "self-serve",
    href: "https://agent-contract-gap.onrender.com/console"
  },
  {
    section: "agents",
    name: "Action Ledger",
    question: "Did the agent stay inside its authority?",
    description:
      "Checks every agent action against its certificate, blocks forged, over-limit or revoked ones, and keeps a ledger nobody can quietly edit.",
    price: "Included in the console",
    status: "LIVE",
    buy: "self-serve",
    href: "https://agent-contract-gap.onrender.com/console"
  },
  {
    section: "agents",
    name: "Contract & Insurance Gap",
    question: "Does your insurance cover what your agent can do?",
    description:
      "Compares an agent's authority with your contracts and insurance, including the AI exclusions insurers added in 2026, and issues a signed Assurance Pack for your broker.",
    price: "Included in the console",
    status: "LIVE",
    buy: "self-serve",
    href: "https://agent-contract-gap.onrender.com/console"
  },
  {
    section: "quantum",
    name: "PQC Forge",
    question: "Which of your systems will a quantum computer break?",
    description:
      "Scans code and servers for RSA and elliptic-curve cryptography, generates the migration patch, and signs the evidence. We run it on our own products on every change.",
    price: "$2,500 readiness report",
    status: "SERVICE",
    buy: "invoice",
    href: "/contact"
  }
];

module.exports = { sections, products };
