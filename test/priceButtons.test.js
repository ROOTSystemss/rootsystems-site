"use strict";
// /pricing: every Free price opens that tool's sign-up; a paid price with a checkout link opens
// checkout directly (no account first); the prices shown are unchanged.
process.env.NODE_ENV = "production";
delete process.env.SITE_URL;
delete process.env.SMTP_HOST;
const app = require("../src/app");
const { tools } = require("../src/data/pricing");

let passed = 0, failed = 0;
const check = (label, ok, detail) => { ok ? passed++ : failed++; console.log((ok ? "PASS  " : "FAIL  ") + label + (ok || detail === undefined ? "" : "  -> " + detail)); };

const server = app.listen(0, async () => {
  try {
    const html = await (await fetch("http://127.0.0.1:" + server.address().port + "/pricing")).text();
    for (const tool of tools.filter((t) => t.tiers)) {
      const free = tool.tiers.find((t) => t.price === "0");
      if (free) check(tool.name + ": the Free price opens sign-up", html.includes('class="rs-tier rs-tier--link" href="' + tool.href + '"'));
      for (const tier of tool.tiers.filter((t) => t.buy)) {
        check(tool.name + " " + tier.name + " ($" + tier.price + "): the price opens checkout", html.includes('href="' + tier.buy + '" data-checkout="' + tool.slug + '"'));
      }
    }
    check("Offboarding Proof Team and Business go to checkout", html.includes("https://offboarding-proof.onrender.com/buy/starter") && html.includes("https://offboarding-proof.onrender.com/buy/pro"));
    check("the Offboarding prices are still $79 and $249", /\$<\/span>79<span/.test(html) && /\$<\/span>249<span/.test(html));
  } catch (err) {
    check("test run", false, err.stack || err.message);
  } finally {
    server.close();
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
  }
});
