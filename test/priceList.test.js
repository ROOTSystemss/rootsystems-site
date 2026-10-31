"use strict";
// price-list.json is the single source of truth for prices. This fails if the data the pricing page
// renders (pricing.js tiers, standards.js, toolkits.js) or the product cards disagree with it.
const assert = require("assert");
const priceList = require("../src/data/price-list.json");
const pricing = require("../src/data/pricing");
const standards = require("../src/data/standards");
const toolkits = require("../src/data/toolkits");
const { products, otherPrices } = require("../src/data/products");

let passed = 0, failed = 0;
const check = (label, fn) => { try { fn(); passed++; console.log("PASS  " + label); } catch (e) { failed++; console.log("FAIL  " + label + "  -> " + e.message); } };
const tier = (t) => ({ name: t.name, price: "$" + t.price + "/" + t.period });
const plansOf = (name) => priceList.products[name].plans;

for (const [name, slug] of [["Offboarding Proof", "offboarding-proof"], ["HIPAA", "hipaa"], ["Vendor Risk", "tpra"], ["Agent Certificates", "agent-governance"], ["Action Ledger", "agent-governance"], ["Contract & Insurance Gap", "agent-governance"]]) {
  check(`${name}: plans match pricing.js ${slug} tiers`, () => assert.deepStrictEqual(plansOf(name), pricing.tools.find((t) => t.slug === slug).tiers.map(tier)));
}
check("Standards Readiness: free tier, every per-standard price, and the bundle match", () => {
  const free = pricing.tools.find((t) => t.slug === "compliance-readiness").tiers.filter((t) => /free/i.test(t.name)).map(tier);
  const per = [...new Set(standards.standards.map((s) => s.price))].sort((a, b) => a - b).map((usd) => ({ name: "Per standard", price: "$" + usd + "/mo" }));
  assert.deepStrictEqual(plansOf("Standards Readiness"), [...free, ...per, { name: "Every standard", price: "$" + standards.BUNDLE_USD + "/mo" }]);
});
check("Toolkits match toolkits.js", () => assert.deepStrictEqual(priceList.other.Toolkits, [{ name: "One toolkit", price: "$" + toolkits.PRICE + " once" }, { name: "All toolkits", price: "$" + toolkits.BUNDLE_PRICE.toLocaleString("en-US") + " once" }]));
check("every product card reads its price and plans from price-list.json", () => {
  assert.deepStrictEqual(Object.keys(priceList.products).sort(), products.map((p) => p.name).sort());
  for (const p of products) { assert.strictEqual(p.price, priceList.products[p.name].card, p.name); assert.deepStrictEqual(p.plans, priceList.products[p.name].plans, p.name); }
  assert.deepStrictEqual(otherPrices.map((o) => o.name), Object.keys(priceList.other));
});
check("every product has at least one plan", () => { for (const p of products) assert.ok(p.plans.length, p.name); });

// Feature lists per plan: one list per plan name, and the same lists the product apps gate on
// (their src/lib/planFeatures.js), checked when those repos sit next to this one.
const fs = require("fs"), path = require("path");
for (const [name, repo] of [["Offboarding Proof", "offboarding-proof"], ["HIPAA", "hipaa-compliance"], ["Vendor Risk", "tpra-tool"]]) {
  check(`${name}: a feature list for every plan`, () => {
    const f = priceList.products[name].features;
    assert.deepStrictEqual(Object.keys(f), plansOf(name).map((p) => p.name));
    assert.ok(Object.values(f).every((l) => Array.isArray(l) && l.length), "a plan with no features");
  });
  const file = path.join(__dirname, "..", "..", repo, "src", "lib", "planFeatures.js");
  if (!fs.existsSync(file)) { console.log(`SKIP  ${name}: ${repo} not checked out next to the site`); continue; }
  check(`${name}: features match ${repo}'s plan gating`, () => {
    const pf = require(file);
    const fromApp = Object.fromEntries(pf.TIERS.map((t) => [t.name, Object.values(pf.FEATURES).filter((x) => x.tier === t.id).map((x) => x.label)]));
    assert.deepStrictEqual(priceList.products[name].features, fromApp);
  });
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
