"use strict";
// QA 2026-11-18 F35: rootsystems.app sends baseline security headers on pages and static files.
process.env.NODE_ENV = "production";
delete process.env.SITE_URL;
delete process.env.SMTP_HOST;
const app = require("../src/app");
let passed = 0, failed = 0;
const check = (label, ok, detail) => { ok ? passed++ : failed++; console.log((ok ? "PASS  " : "FAIL  ") + label + (ok || detail === undefined ? "" : "  -> " + detail)); };
const server = app.listen(0, async () => {
  const base = "http://127.0.0.1:" + server.address().port;
  try {
    for (const p of ["/", "/pricing", "/security", "/robots.txt", "/this-page-does-not-exist"]) {
      const r = await fetch(base + p);
      const h = (k) => r.headers.get(k) || "";
      check(p + ": nosniff, no framing, referrer policy, CSP frame-ancestors none, no x-powered-by", h("x-content-type-options") === "nosniff" && h("x-frame-options") === "DENY" && h("referrer-policy") === "strict-origin-when-cross-origin" && /frame-ancestors 'none'/.test(h("content-security-policy")) && /object-src 'none'/.test(h("content-security-policy")) && !r.headers.get("x-powered-by"), JSON.stringify({ s: r.status, xcto: h("x-content-type-options"), xfo: h("x-frame-options"), csp: h("content-security-policy") }));
    }
  } catch (e) { check("run", false, e.stack); }
  server.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
});
