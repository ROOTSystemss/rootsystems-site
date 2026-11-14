// Subprocessors shown on /security (2026-11-13). Each entry is taken from the products' real configuration,
// named in `source`, not from marketing copy. Change this list only when the configuration changes.
module.exports = [
  { name: "Render", purpose: "Hosts the product applications (Offboarding Proof, Vendor Risk, HIPAA, Standards, AI Agent Trust, PQC Forge)", location: "United States (Oregon)", source: "Render services listed in the Render workspace" },
  { name: "Neon", purpose: "Postgres databases for every product, on Amazon Web Services", location: "United States (US West)", source: "DATABASE_URL on each Render service" },
  { name: "Resend", purpose: "Sends account emails: address confirmation, password reset, invitations and alerts", location: "United States", source: "RESEND_API_KEY on the product services" },
  { name: "Dodo Payments", purpose: "Checkout, subscriptions and tax as merchant of record (billing contact details only; card numbers never reach RootSystems)", location: "See Dodo Payments' own documentation", source: "DODO_PAYMENTS_API_KEY on the product services" },
  { name: "Vercel", purpose: "Hosts this website, rootsystems.app", location: "United States / global edge network", source: "vercel.json in the website repository" },
  { name: "Google", purpose: "Support email (Gmail), website fonts, and \"Continue with Google\" sign-in when you choose it", location: "United States", source: "hello@ mailbox; Google Fonts link; GOOGLE_CLIENT_ID on the product services" },
  { name: "Microsoft", purpose: "\"Continue with Microsoft\" sign-in, only when you choose it", location: "United States", source: "MICROSOFT_CLIENT_ID on the product services" },
];
// Not subprocessors (they receive no customer data): OpenTimestamps public calendars receive only a SHA-256
// fingerprint of a report's chain hash to timestamp it in Bitcoin.
