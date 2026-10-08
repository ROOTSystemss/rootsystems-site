// The 12 standards Compliance Readiness checks (plus HIPAA, which has its own tool).
// Prices match Master Plan Stage 1: Core $149, Advanced $249, all 12 $799.
// `source` is the official publisher of each standard, so a buyer can read the original.
const APP = "https://ai-compliance-readiness.onrender.com";

const groups = [
  { slug: "security", label: "Security & trust", color: "saffron", lead: "The frameworks customers and auditors ask for first." },
  { slug: "privacy", label: "Privacy", color: "green", lead: "Personal data laws in the EU, UK and California." },
  { slug: "regulated", label: "Regulated sectors", color: "violet", lead: "Defense contractors, essential services and financial firms." },
  { slug: "ai", label: "AI governance", color: "saffron", lead: "How you manage, test and disclose AI." }
];

const standards = [
  { id: "soc2", group: "security", name: "SOC 2", price: 249, who: "US software and service companies selling to businesses.", checks: "The Trust Services Criteria: security, plus availability, confidentiality, processing integrity and privacy if you include them.", source: { label: "AICPA", url: "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2" } },
  { id: "iso27001", group: "security", name: "ISO/IEC 27001:2022", price: 249, who: "Any organization proving it runs an information security management system, worldwide.", checks: "Clauses 4 to 10 of the management system and the Annex A controls.", source: { label: "ISO", url: "https://www.iso.org/standard/27001" } },
  { id: "pci-dss", group: "security", name: "PCI DSS v4.0.1", price: 149, who: "Anyone who stores, processes or transmits payment card data.", checks: "The 12 principal requirements, including the ones that became mandatory on 31 March 2025.", source: { label: "PCI Security Standards Council", url: "https://www.pcisecuritystandards.org/document_library/" } },
  { id: "nist-csf-2", group: "security", name: "NIST CSF 2.0", price: 149, who: "Organizations of any size wanting a common security baseline.", checks: "The six functions: Govern, Identify, Protect, Detect, Respond and Recover.", source: { label: "NIST", url: "https://doi.org/10.6028/NIST.CSWP.29" } },
  { id: "gdpr", group: "privacy", name: "GDPR", price: 149, who: "Anyone processing personal data of people in the EU or UK.", checks: "Lawful basis, notices, individuals' rights, security, breaches, processors and transfers.", source: { label: "EUR-Lex, Regulation (EU) 2016/679", url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj" } },
  { id: "ccpa", group: "privacy", name: "CCPA / CPRA", price: 149, who: "Businesses above the California thresholds that handle Californians' data.", checks: "Notices, the rights to know, delete, correct and opt out, Global Privacy Control, contracts and security.", source: { label: "California Civil Code and CPPA regulations", url: "https://cppa.ca.gov/regulations/" } },
  { id: "cmmc-l2", group: "regulated", name: "CMMC 2.0 Level 2 / NIST SP 800-171", price: 249, who: "US Defense contractors and subcontractors that handle Controlled Unclassified Information.", checks: "The System Security Plan, SPRS score, POA&M and the most-failed of the 110 requirements.", source: { label: "32 CFR Part 170 and NIST SP 800-171 Rev. 2", url: "https://csrc.nist.gov/pubs/sp/800/171/r2/upd1/final" } },
  { id: "nis2", group: "regulated", name: "NIS2", price: 149, who: "Essential and important entities in EU sectors such as energy, health, digital infrastructure and ICT services.", checks: "Management accountability, the ten risk-management measures of Article 21, and the 24-hour, 72-hour and one-month reporting steps.", source: { label: "EUR-Lex, Directive (EU) 2022/2555", url: "https://eur-lex.europa.eu/eli/dir/2022/2555/oj" } },
  { id: "dora", group: "regulated", name: "DORA", price: 249, who: "EU financial entities and the ICT providers that serve them.", checks: "ICT risk management, incident classification and reporting, resilience testing and third-party risk.", source: { label: "EUR-Lex, Regulation (EU) 2022/2554", url: "https://eur-lex.europa.eu/eli/reg/2022/2554/oj" } },
  { id: "iso42001", group: "ai", name: "ISO/IEC 42001:2023", price: 249, who: "Organizations building or using AI that want a certifiable AI management system.", checks: "The AI management system clauses and the Annex A controls for AI.", source: { label: "ISO", url: "https://www.iso.org/standard/42001" } },
  { id: "eu-ai-act-art50", group: "ai", name: "EU AI Act, Article 50", price: 249, who: "Providers and deployers of chatbots, generated content and deepfakes offered in the EU.", checks: "The transparency duties: telling people they are talking to AI and marking AI-generated content.", source: { label: "EUR-Lex, Regulation (EU) 2024/1689", url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj" } },
  { id: "nist-ai-rmf", group: "ai", name: "NIST AI RMF", price: 149, who: "Anyone who wants to show buyers and regulators they manage AI risk with care.", checks: "The Govern, Map, Measure and Manage functions, plus the Generative AI Profile.", source: { label: "NIST AI 100-1 and AI 600-1", url: "https://doi.org/10.6028/NIST.AI.100-1" } }
];

const BUNDLE_USD = 799;

module.exports = {
  groups,
  standards: standards.map(function (s) { return Object.assign({}, s, { href: APP + "/assessments?framework=" + s.id }); }),
  BUNDLE_USD,
  signupHref: APP + "/signup"
};
