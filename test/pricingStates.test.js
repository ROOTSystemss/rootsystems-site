"use strict";
// rootsystems.app/pricing: plan tiers are real radio buttons (role="radio", aria-checked) in one
// radiogroup per product, each with a "Selected" label; /js/pricing.js keeps exactly one selection on
// the page and moves it (clearing the old one and its card); the three state colours are CSS
// variables with a visible focus ring and a reduced-motion rule. Prices are untouched.
process.env.NODE_ENV = "production";
delete process.env.SITE_URL;
const fs = require("fs"), path = require("path");
const app = require("../src/app");
const { tools } = require("../src/data/pricing");
const { select, syncTabStops } = require("../public/js/pricing.js");

let passed = 0, failed = 0;
const check = (label, ok, detail) => { ok ? passed++ : failed++; console.log((ok ? "PASS  " : "FAIL  ") + label + (ok || detail === undefined ? "" : "  -> " + detail)); };

// Minimal stand-ins for DOM elements: just what pricing.js uses.
function fakeCard() { const set = new Set(); return { classList: { add: (c) => set.add(c), remove: (c) => set.delete(c), contains: (c) => set.has(c) } }; }
function fakeRadio(card, group) {
  const attrs = { "aria-checked": "false" };
  const r = { setAttribute: (k, v) => { attrs[k] = String(v); }, getAttribute: (k) => attrs[k], closest: (sel) => (sel === ".rs-plan" ? card : group) };
  group.items.push(r);
  return r;
}
function fakeGroup() { const g = { items: [] }; g.querySelectorAll = () => g.items; return g; }

const server = app.listen(0, async () => {
  const B = "http://127.0.0.1:" + server.address().port;
  try {
    const html = await (await fetch(B + "/pricing")).text();
    const groups = html.match(/role="radiogroup"/g) || [];
    const radios = [...html.matchAll(/<button type="button" class="rs-tier[^"]*" role="radio" aria-checked="false">([\s\S]*?)<\/button>/g)].map((m) => m[1]);
    check("one radiogroup per product card", groups.length === tools.length + 2, groups.length);
    check("every tier is a real button with role=radio, starting unchecked", radios.length > 0 && radios.length === (html.match(/class="rs-tier[ "]/g) || []).length, radios.length);
    check("every tier carries a Selected label", radios.every((r) => /class="rs-tier__selected" aria-hidden="true">✓ Selected</.test(r)));
    check("no block elements inside the buttons (valid HTML)", radios.every((r) => !/<(p|div|h\d)\b/.test(r)));
    check("each radiogroup has a label", (html.match(/role="radiogroup" aria-label="[^"]+ plans"/g) || []).length === groups.length);
    const tierPrices = tools.flatMap((t) => (t.tiers || []).map((tier) => "</span>" + tier.price + "<span class=\"rs-tier__per\">/" + tier.period));
    check("every listed price is shown unchanged inside its tier button", tierPrices.every((p) => radios.some((r) => r.includes(p))), tierPrices.find((p) => !radios.some((r) => r.includes(p))));
    check("the page loads /js/pricing.js", /<script src="\/js\/pricing\.js"><\/script>/.test(html) && (await fetch(B + "/js/pricing.js")).status === 200);

    // Selection logic: one tier on the whole page; choosing another moves it and its card.
    const cardA = fakeCard(), cardB = fakeCard(), gA = fakeGroup(), gB = fakeGroup();
    const a1 = fakeRadio(cardA, gA), a2 = fakeRadio(cardA, gA), b1 = fakeRadio(cardB, gB);
    const all = [a1, a2, b1];
    select(all, a2); syncTabStops([gA, gB]);
    check("selecting a tier checks it and marks its card", a2.getAttribute("aria-checked") === "true" && cardA.classList.contains("is-selected") && !cardB.classList.contains("is-selected"));
    check("only the checked tier in its group is a tab stop", a2.getAttribute("tabindex") === "0" && a1.getAttribute("tabindex") === "-1" && b1.getAttribute("tabindex") === "0");
    select(all, b1);
    check("selecting a tier in another card moves the selection and clears the old one", b1.getAttribute("aria-checked") === "true" && a2.getAttribute("aria-checked") === "false" && !cardA.classList.contains("is-selected") && cardB.classList.contains("is-selected"));
    check("exactly one tier is checked on the page", all.filter((r) => r.getAttribute("aria-checked") === "true").length === 1);
    select(all, a1);
    check("switching within a card keeps the card selected", a1.getAttribute("aria-checked") === "true" && cardA.classList.contains("is-selected") && b1.getAttribute("aria-checked") === "false");

    // Styles.
    const css = fs.readFileSync(path.join(__dirname, "..", "public", "css", "pages.css"), "utf8");
    check("the three state colours are CSS variables", ["--rs-plan-rest", "--rs-plan-hover", "--rs-plan-selected"].every((v) => new RegExp(v + ":").test(css)));
    check("keyboard focus has a visible outline, not only a glow", /button\.rs-tier:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--rs-plan-hover\)/.test(css));
    check("reduced motion turns the glow transitions off", /@media \(prefers-reduced-motion: reduce\)\s*\{\s*button\.rs-tier, \.rs-plan \{ transition: none; \}/.test(css));
  } catch (err) {
    check("test run", false, err.stack || err.message);
  } finally {
    server.close();
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
  }
});
