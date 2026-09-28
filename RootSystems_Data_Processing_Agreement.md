# Data Processing Agreement

**Last updated: September 27, 2026**

This Data Processing Agreement ("DPA") forms part of the RootSystems [Terms of Service](/terms) between RootSystems ("we," "Processor") and the organization that uses our products ("you," "Customer"). It applies whenever we process personal data on your behalf while providing any RootSystems product: Offboarding Proof, HIPAA Compliance, TPRA, AI Compliance Readiness, Authority Atlas, Trust Proof, Agent Contract Gap, or PQC Forge (the "Services").

It takes effect automatically when you accept the Terms of Service. If you need a countersigned copy for your records, email therootsystems.ops@gmail.com.

## 1. Roles

You are the controller of the personal data you or your users add to the Services ("Customer Personal Data"). We are your processor. Where the GDPR, the UK GDPR, or similar laws apply, the terms "controller," "processor," "personal data," "processing," and "personal data breach" have the meanings given in those laws.

## 2. Our Commitments

We will:
1. process Customer Personal Data only to provide the Services and on your documented instructions, which are the Terms of Service, this DPA, and your use and configuration of the Services. If we believe an instruction breaks data protection law, we will tell you;
2. make sure anyone who accesses Customer Personal Data is bound by confidentiality. Today, only the owner of RootSystems has such access;
3. apply the security measures in Annex 2;
4. help you, as far as reasonably possible, to answer requests from individuals exercising their rights, and to carry out data protection impact assessments or consultations with authorities that relate to the Services;
5. notify you without undue delay after becoming aware of a personal data breach affecting Customer Personal Data, with the information you need to meet your own obligations;
6. give you the information reasonably needed to show that we comply with this DPA.

## 3. Sub-processors

You authorize the sub-processors listed in Annex 3. We will bind each sub-processor to data protection terms that protect Customer Personal Data at least as well as this DPA, and we remain responsible for their performance. Before adding or replacing a sub-processor that handles Customer Personal Data, we will update Annex 3 and give you at least 30 days' notice by email. If you object on reasonable data protection grounds, we will work with you in good faith; if we cannot resolve the objection, you may terminate the affected Service and receive a pro-rated refund of any prepaid fees for it.

## 4. International Transfers

Customer Personal Data is stored and processed in the United States. Where a transfer from the European Economic Area, the United Kingdom, or Switzerland requires a safeguard:
- **EEA:** the Standard Contractual Clauses approved by European Commission Implementing Decision (EU) 2021/914, Module Two (controller to processor), are incorporated into this DPA. Option 2 of Clause 9 (general written authorization of sub-processors) applies with the notice period in Section 3; Clause 7 (docking) does not apply; the optional wording in Clause 11 does not apply; Clauses 17 and 18 select the law and courts of Ireland. Annexes 1 to 3 of this DPA provide the information required in the Clauses' annexes.
- **United Kingdom:** the International Data Transfer Addendum issued by the UK Information Commissioner applies together with the Clauses above.
- **Switzerland:** the Clauses apply with references to the GDPR read as references to the Swiss Federal Act on Data Protection, and the Swiss Federal Data Protection and Information Commissioner as the competent authority.

If these documents conflict with the rest of this DPA, the transfer documents prevail.

## 5. Audits

We will answer your reasonable written questions about our data protection practices. If those answers are not enough to show compliance, you may audit our compliance with this DPA once a year, with at least 30 days' written notice, at your own cost, during normal business hours, and in a way that does not expose other customers' data.

## 6. Return and Deletion

When your subscription ends, you can export your data from the Services. Within 30 days after the end of the subscription, or sooner if you ask, we will delete Customer Personal Data, unless the law requires us to keep it. Signed reports you downloaded remain yours; deleting our copy does not affect the signatures on them.

## 7. Liability and Precedence

Each party's liability under this DPA is subject to the limitations in the Terms of Service, except where the law does not allow such a limitation. If this DPA conflicts with the Terms of Service, this DPA prevails for matters of personal data protection.


## Annex 1: Details of Processing

**Subject matter and duration:** providing the Services for as long as your subscription is active, plus the deletion period in Section 6.

**Nature and purpose:** storing, organizing, analyzing, and reporting on data you provide, in order to produce assessments, access-removal records, vendor reviews, agent certificates and ledgers, and signed reports.

**Categories of data subjects:** your employees, former employees, contractors, and users of the Services; contacts at your vendors; people named in your assessments and records.

**Categories of personal data:** names; work email addresses; job titles and departments; account identifiers and access status in systems you connect; dates of hire and departure; content of assessments and records; login and activity logs.

**Special categories of data:** none intended. You agree not to enter special category data (such as health data) into the Services unless we have agreed to it in writing.

**Frequency:** continuous, while you use the Services.

## Annex 2: Security Measures

- Encryption in transit (TLS) for all connections to the Services.
- Encryption at rest with AES-256-GCM for sensitive fields, including connection credentials and personal data where the product supports it.
- Passwords stored only as salted hashes (bcrypt or scrypt).
- Tamper evidence: records and reports fingerprinted with SHA-256 and SHA-512 and signed with ML-DSA-65 (NIST FIPS 204); some products also hash-chain their records.
- Access to production systems and databases limited to the owner of RootSystems.
- Customer data kept separate by organization in every product, and checked on every request.
- Data minimization: products collect only the fields they need, and offer retention settings where records can be purged.
- Infrastructure run by established providers (Annex 3) with their own physical and network security and backups.

## Annex 3: Sub-processors

| Sub-processor | Purpose | Location |
|---|---|---|
| Render Services, Inc. | Application hosting; one database | United States (Oregon) |
| Neon | Database hosting on Amazon Web Services | United States (US West) |
| Vercel Inc. | Hosting of the rootsystems.app website | United States / global edge network |
| Dodo Payments | Checkout, subscriptions, and tax as merchant of record (billing contact details only) | See Dodo Payments' own documentation |
| Google LLC | Support email (Gmail) | United States |

---

*This document is a working draft. Please have it reviewed by a qualified attorney before relying on it, particularly the international transfer terms and the choice of Irish law for the Standard Contractual Clauses.*
