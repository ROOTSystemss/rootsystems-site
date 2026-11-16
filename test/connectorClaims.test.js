"use strict";
// 2026-11-16: no direct connector (Microsoft 365, Okta, Slack, GitHub or an industry system) is offered, so no
// public page may claim one. Every page in the sitemap is rendered and checked. The approved line is
// "Works with Microsoft 365, Okta and any system via user export, REST API or SCIM."
// The legal pages (privacy, terms, DPA) are skipped on purpose: they describe how connector data is handled,
// and are changed only with a legal review.
process.env.NODE_ENV = "production";
delete process.env.SITE_URL;
delete process.env.SMTP_HOST;
const app = require("../src/app");
const { products } = require("../src/data/products");

let passed = 0, failed = 0;
const check = (label, ok, detail) => { ok ? passed++ : failed++; console.log((ok ? "PASS  " : "FAIL  ") + label + (ok || detail === undefined ? "" : "  -> " + String(detail).slice(0, 300))); };
const vis = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/\s+/g, " ");

const APPROVED = "Works with Microsoft 365, Okta and any system via user export, REST API or SCIM.";
const CLAIMS = [
  /direct (connector|integration)s? (are |is )?(an )?optional/i,
  /optional direct (connector|integration)/i,
  /direct (connector|integration)s?(?: add-ons?)? \(/i,
  /industry connectors?/i,
  /\b(Microsoft 365|Okta|Slack|GitHub)\b[^.]{0,60}\b(connectors?|integrations?|add-ons?)\b/i,
  /\b(connectors?|integrations?|integrates?)\b[^.]{0,40}\b(Microsoft 365|Okta|Slack|GitHub)\b/i,
  /Works with Microsoft 365, Google/i,
];
const LEGAL = new Set(["/privacy", "/terms", "/dpa", "/refund"]);
const claimsIn = (text) => CLAIMS.filter((re) => re.test(text)).map((re) => text.match(re)[0]);

const server = app.listen(0, async () => {
  const base = "http://127.0.0.1:" + server.address().port;
  try {
    const sm = await (await fetch(base + "/sitemap.xml")).text();
    const paths = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    check("sitemap lists pages", paths.length >= 5, paths.length);
    for (const p of paths) {
      if (LEGAL.has(p)) continue;
      const r = await fetch(base + p);
      const html = await r.text();
      // Visible text and the JSON-LD / meta descriptions search engines read.
      const meta = [...html.matchAll(/<meta[^>]+content="([^"]*)"/gi)].map((m) => m[1]).join(" . ");
      const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join(" . ");
      const found = claimsIn(vis(html) + " . " + meta + " . " + ld);
      check(p + ": no direct-connector claim", found.length === 0, found.join(" | "));
    }
    const off = products.find((x) => x.name === "Offboarding Proof");
    check("Offboarding card uses the approved line", off && off.description.startsWith(APPROVED), off && off.description);
    const sec = vis(await (await fetch(base + "/security")).text());
    check("/security uses the approved line", sec.includes(APPROVED));
  } catch (e) {
    check("no exception", false, e.stack);
  } finally {
    server.close();
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
  }
});
