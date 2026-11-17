"use strict";
// AD-078 (knock-out 2026-11-17): what the uptime monitor checks and the /status page shows. One list for both
// (scripts/uptime-check.js reads it in GitHub Actions; src/services/statusService.js reads it on rootsystems.app).
// `key` is stored in the history file: never rename a key, only add new ones at the end.
module.exports = [
  { key: "site", name: "rootsystems.app (this website)", url: "https://rootsystems.app/" },
  { key: "offboarding", name: "Offboarding Proof", url: "https://offboarding-proof.onrender.com/login" },
  { key: "vendor-risk", name: "Vendor Risk", url: "https://tpra.onrender.com/health" },
  { key: "hipaa", name: "HIPAA", url: "https://hipaa-g37n.onrender.com/login" },
  { key: "standards", name: "Standards Readiness", url: "https://ai-compliance-readiness.onrender.com/login" },
  { key: "agent-trust", name: "AI Agent Trust (console and Contract Gap)", url: "https://agent-contract-gap.onrender.com/health" },
  { key: "trust-proof", name: "AI Agent Trust: Trust Proof", url: "https://trust-proof-2543.onrender.com/health" },
  { key: "atlas", name: "AI Agent Trust: Authority Atlas", url: "https://authority-atlas.onrender.com/health" },
  { key: "pqc", name: "PQC Readiness Report", url: "https://pqc-forge.onrender.com/v1/health" },
];
