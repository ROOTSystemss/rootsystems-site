"use strict";
// Website fixes (2026-10-26): "Post-Quantum Signed" replaces "Quantum-Safe"; products.js lists every
// price shown on /pricing (read from the same data, so they cannot drift); /sitemap.xml and
// /robots.txt exist. No price and no other wording changed.
process.env.NODE_ENV = "production";
delete process.env.SITE_URL;
delete process.env.SMTP_HOST;
const fs = require("fs");
const path = require("path");
const app = require("../src/app");
const { products, sections, otherPrices } = require("../src/data/products");
const { SITEMAP_PATHS } = require("../src/controllers/siteController");
const { guides } = require("../src/data/guides");

let passed = 0, failed = 0;
const check = (label, ok, detail) => { ok ? passed++ : failed++; console.log((ok ? "PASS  " : "FAIL  ") + label + (ok || detail === undefined ? "" : "  -> " + detail)); };

// Every source file a visitor can see, for the wording check.
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

const server = app.listen(0, async () => {
  const base = "http://127.0.0.1:" + server.address().port;
  const get = async (p) => { const r = await fetch(base + p); return { status: r.status, type: r.headers.get("content-type") || "", text: await r.text() }; };
  try {
    // 1) Wording: no "quantum-safe" / "quantum safe" anywhere a visitor sees; the new name is used.
    const files = [...walk(path.join(__dirname, "..", "src")), ...walk(path.join(__dirname, "..", "public")).filter((f) => /\.(html|txt|xml|md|json|js)$/.test(f))];
    const offenders = files.filter((f) => /quantum[- ]?safe/i.test(fs.readFileSync(f, "utf8")));
    check('no "quantum-safe" or "quantum safe" in the site source', offenders.length === 0, offenders.join(", "));
    check('the branch label reads "Post-Quantum Signed"', sections.some((s) => s.label === "Branch 2: Post-Quantum Signed"));
    const home = await get("/");
    check('the home page shows "Post-Quantum Signed" and not "Quantum-Safe"', home.text.includes("Post-Quantum Signed") && !/quantum[- ]?safe/i.test(home.text));
    for (const p of ["/", "/pricing", "/security", "/learn", "/standards", "/toolkits"]) {
      const page = await get(p);
      check(p + ' has no "quantum-safe" wording', !/quantum[- ]?safe/i.test(page.text));
    }

    // 2) Prices: every "$" amount on /pricing is listed in products.js (plans or the card's price).
    const pricingHtml = (await get("/pricing")).text.replace(/<[^>]+>/g, " ").replace(/&#36;|&dollar;/g, "$").replace(/\$\s+/g, "$");
    const onPage = new Set((pricingHtml.match(/\$\d[\d,]*/g) || []));
    const listed = new Set([...products.flatMap((p) => [p.price, ...p.plans.map((x) => x.price)]), ...otherPrices.flatMap((o) => o.plans.map((x) => x.price))].flatMap((s) => String(s).match(/\$\d[\d,]*/g) || []));
    const missing = [...onPage].filter((price) => !listed.has(price));
    check("products.js lists every price shown on /pricing", missing.length === 0, "missing: " + missing.join(", "));
    for (const price of ["$199", "$299", "$599", "$999", "$1,199"]) check(price + " is in products.js", listed.has(price));
    check("each card's own price line is unchanged", products.map((p) => p.price).join(" | ") === "From $79/mo | From $99/mo | From $99/mo | From $129/mo per standard | From $249/mo | Included in the console | Included in the console | $2,500 readiness report");
    check("the toolkit prices are listed apart from the product cards (no new card on the home page)", products.length === 8 && otherPrices[0].name === "Toolkits");

    // 3) sitemap.xml and robots.txt.
    const sitemap = await get("/sitemap.xml");
    check("/sitemap.xml is served as XML", sitemap.status === 200 && /xml/.test(sitemap.type) && sitemap.text.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
    const locs = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    check("the sitemap lists every public page and every guide on https://rootsystems.app", locs.length === SITEMAP_PATHS.length + guides.length && locs.every((u) => u.startsWith("https://rootsystems.app/")));
    for (const loc of locs) {
      const page = await get(loc.replace("https://rootsystems.app", ""));
      check("sitemap page loads: " + loc, page.status === 200, page.status);
    }
    const robots = await get("/robots.txt");
    check("/robots.txt allows all and points to the sitemap", robots.status === 200 && /text\/plain/.test(robots.type) && robots.text.includes("User-agent: *") && robots.text.includes("Allow: /") && robots.text.includes("Sitemap: https://rootsystems.app/sitemap.xml"));
  } catch (err) {
    check("test run", false, err.stack || err.message);
  } finally {
    server.close();
    console.log("\n" + passed + " passed, " + failed + " failed");
    process.exitCode = failed ? 1 : 0;
  }
});
