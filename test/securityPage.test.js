"use strict";
// /security (BIG RUN 2026-11-13, AD-079): subprocessors listed from the products' real configuration, links to
// the public SAMPLE reports, close-access described as it now behaves (disable only, preview, dry run, cap),
// and no certification the company does not hold.
process.env.NODE_ENV = "production";
delete process.env.SITE_URL;
delete process.env.SMTP_HOST;
const app = require("../src/app");
const subprocessors = require("../src/data/subprocessors");

let passed = 0, failed = 0;
const check = (label, ok, detail) => { ok ? passed++ : failed++; console.log((ok ? "PASS  " : "FAIL  ") + label + (ok || detail === undefined ? "" : "  -> " + String(detail).slice(0, 300))); };
const vis = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");

const server = app.listen(0, async () => {
  const base = "http://127.0.0.1:" + server.address().port;
  try {
    const r = await fetch(base + "/security");
    const html = await r.text();
    const text = vis(html);
    check("/security answers 200", r.status === 200);
    check("every subprocessor from src/data/subprocessors.js is listed", subprocessors.every((s) => html.includes('data-subprocessor="' + s.name + '"')), subprocessors.map((s) => s.name).join(","));
    check("each subprocessor names the configuration it comes from", subprocessors.every((s) => typeof s.source === "string" && s.source.length > 5));
    for (const name of ["Render", "Neon", "Resend", "Dodo Payments", "Vercel"]) check("lists " + name, text.includes(name));
    // 2026-11-14: Offboarding Proof works with any system (Universal Connector); direct integrations optional.
    check("says Offboarding works with any system, read-only, direct integrations optional", /id="universal-connector"/.test(html) && /works with any system/i.test(text) && /only ever called with GET/.test(text) && /Direct integrations are optional add-ons/.test(text) && /help\/universal-connector/.test(html));
    check("links to the Offboarding SAMPLE signed report", /href="https:\/\/offboarding-proof\.onrender\.com\/sample\/report"/.test(html) && /SAMPLE/.test(text));
    check("close-access: disable only, nothing deleted, preview, dry run, hourly cap", /Nothing is deleted/.test(text) && /preview/i.test(text) && /dry run/i.test(text) && /per hour/.test(text) && !/signs it out of active sessions and app permissions/.test(text));
    const claims = [/SOC ?2 (certified|compliant|Type)/i, /ISO ?27001 (certified|compliant)/i, /HIPAA[- ]compliant/i, /FIPS[- ]validated/i, /quantum[- ]safe/i, /penetration[- ]tested/i];
    const found = claims.filter((re) => re.test(text.replace(/no SOC 2 or ISO 27001 report/, "")));
    check("no certification claimed that the company does not hold", found.length === 0, found.join(" | "));
    check("says plainly that no certification is held today", /We hold no security certification today/.test(text));
  } catch (err) {
    check("test run", false, err.stack || err.message);
  } finally {
    server.close();
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
  }
});
