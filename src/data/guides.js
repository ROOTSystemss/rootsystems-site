// Learn: short, plain-English guides. Each one is a lesson a customer can finish in a few
// minutes. Keep every claim true today; link to the official source instead of paraphrasing law.
const guides = [
  {
    slug: "readiness-vs-certification",
    kind: "Start here",
    minutes: 4,
    title: "Readiness is not certification, and why that is useful",
    summary: "What a readiness report proves, what it does not, and how it saves you money before an audit.",
    sections: [
      { h: "What an audit or certification is", p: [
        "A SOC 2 report can only be issued by a licensed CPA firm. ISO 27001 and ISO 42001 certificates come from accredited certification bodies. CMMC Level 2 certification comes from an authorized assessor (a C3PAO). No software can issue these, including ours."
      ] },
      { h: "What a readiness check is", p: [
        "A readiness check asks, control by control, whether what the standard expects is in place, and scores the gaps before an auditor finds them. Our checks fail closed: a control you leave unanswered counts as missing, never as done.",
        "The result is a prioritized list of gaps, the evidence an auditor will ask for, and a signed report you can show a customer today while the audit is still months away."
      ] },
      { h: "How to use it", p: [
        "Run the check, fix the critical gaps first, attach evidence as you go, and run it again. When the report says Evidence-backed with no critical gaps, you are ready to book the audit, and the audit tends to be shorter and cheaper."
      ] }
    ]
  },
  {
    slug: "evidence-fingerprints",
    kind: "How it works",
    minutes: 3,
    title: "Evidence fingerprints: proof without handing over your files",
    summary: "Why a readiness answer is only a claim until a document backs it, and how we record that document without keeping it.",
    sections: [
      { h: "Answers are claims", p: [
        "Anyone can tick YES. Auditors know that, so they ask for the policy, the screenshot or the export behind each answer. A report that shows which answers are backed by a document is worth far more than a questionnaire."
      ] },
      { h: "What happens when you attach a file", p: [
        "We compute the file's SHA-256 fingerprint, a 64-character code that changes completely if even one byte of the file changes. We keep the fingerprint, the file name and its size, and we discard the file itself. We never store your document.",
        "The signed report lists every fingerprint. Months later, an auditor can fingerprint your copy of the file and see that it matches the one recorded on the day of the assessment."
      ] },
      { h: "The assurance rating", p: [
        "Each report is rated Evidence-backed, Partly evidenced or Self-assessed, and names the critical controls you claimed without proof. The rating never changes your readiness score. It tells the reader how much of the score is proven."
      ] }
    ]
  },
  {
    slug: "verify-a-report",
    kind: "How it works",
    minutes: 3,
    title: "How to check a RootSystems report yourself",
    summary: "Every report is signed. Here is how anyone can confirm it came from us and was not changed.",
    sections: [
      { h: "Why reports are signed", p: [
        "A PDF is easy to edit. A signature makes an edit visible. Each report is fingerprinted with SHA-512 and signed with ML-DSA-65, the post-quantum signature standard NIST published in 2024 as FIPS 204."
      ] },
      { h: "Where the key is", p: [
        "Every product publishes its public signing key at /.well-known/rootsystems-signing-key.json on its own address. The key only checks signatures; it cannot create them."
      ] },
      { h: "Checking a report", p: [
        "Upload your saved copy on the product's Reports page to check it, or check the signed manifest against the published key with any ML-DSA-65 library. If one character of the report changed, the check fails."
      ] }
    ]
  },
  {
    slug: "choosing-a-standard",
    kind: "Guide",
    minutes: 5,
    title: "Which standard do you actually need?",
    summary: "A quick map from who is asking to which standard answers them.",
    sections: [
      { h: "Start from the person asking", p: [
        "A US business customer usually asks for SOC 2. A European or global customer usually asks for ISO 27001. If you take card payments, your bank or payment provider will ask about PCI DSS. If you handle US health information for a covered entity, HIPAA applies.",
        "Personal data brings its own laws: the GDPR for people in the EU and UK, and the CCPA for Californians once you pass its thresholds.",
        "Some sectors have their own rules: CMMC for US Defense contractors, NIS2 for essential and important entities in the EU, and DORA for EU financial firms and their ICT providers.",
        "For AI, ISO 42001 is the certifiable management system, the EU AI Act sets legal duties (Article 50 covers transparency), and the NIST AI RMF is the voluntary US framework buyers often ask about."
      ] },
      { h: "If you are not sure", p: [
        "Your first assessment is free on any standard. Run the one your largest customer asked about, and the gap list will show how far the others are."
      ] }
    ]
  },
  {
    slug: "offboarding-proof",
    kind: "Guide",
    minutes: 3,
    title: "Proving a leaver lost access",
    summary: "Why \"we removed their account\" is one of the most common audit findings, and what proof looks like.",
    sections: [
      { h: "Why auditors ask", p: [
        "Access left open after someone leaves is a classic path to a breach, so SOC 2, ISO 27001, NIST SP 800-171 and HIPAA all expect access to be removed promptly and the removal to be recorded."
      ] },
      { h: "What proof looks like", p: [
        "Proof is a record, made at the time, of each system the person could reach and the moment access ended, signed so it cannot be changed later. Offboarding Proof checks the connected systems and produces that signed record."
      ] }
    ]
  },
  {
    slug: "post-quantum",
    kind: "Guide",
    minutes: 4,
    title: "Post-quantum cryptography in plain English",
    summary: "What quantum computers break, what NIST standardized, and what to do first.",
    sections: [
      { h: "What breaks", p: [
        "A large enough quantum computer could break RSA and elliptic-curve cryptography (ECDSA, ECDH), which protect most signatures and key exchanges today. Data recorded now could be decrypted later."
      ] },
      { h: "What replaces it", p: [
        "In 2024 NIST published FIPS 203 (ML-KEM, for key exchange), FIPS 204 (ML-DSA, for signatures) and FIPS 205 (SLH-DSA, for signatures). RootSystems signs every report with ML-DSA-65."
      ] },
      { h: "What to do first", p: [
        "Find where RSA and elliptic-curve cryptography are used in your code and servers, stop adding more, and plan the migration. PQC Forge finds them, proposes the patch and fails a build that adds new vulnerable cryptography."
      ] }
    ]
  }
];

module.exports = { guides, bySlug: function (slug) { return guides.find(function (g) { return g.slug === slug; }) || null; } };
