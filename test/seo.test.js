"use strict";
// SEO pass (2026-11-12): every page has a unique description, a self-referencing canonical, Open Graph and
// Twitter tags with the 1200x630 image, Organization JSON-LD (with the X and Instagram profiles); /pricing
// has one SoftwareApplication per product whose offers equal price-list.json; each guide has an Article;
// every <img> has descriptive alt text; the sitemap lists every guide and robots.txt points to it.
process.env.NODE_ENV = "production";
delete process.env.SITE_URL;
delete process.env.SMTP_HOST;
const fs = require("fs");
const path = require("path");
const app = require("../src/app");
const { SITEMAP_PATHS } = require("../src/controllers/siteController");
const { guides } = require("../src/data/guides");
const priceList = require("../src/data/price-list.json");
const { SOCIAL_LINKS } = require("../src/data/socialLinks");

let passed = 0, failed = 0;
const check = (label, ok, detail) => { ok ? passed++ : failed++; console.log((ok ? "PASS  " : "FAIL  ") + label + (ok || detail === undefined ? "" : "  -> " + String(detail).slice(0, 300))); };
const meta = (html, attr, key) => { const m = new RegExp("<meta " + attr + '="' + key.replace(/[:]/g, "\\$&") + '" content="([^"]*)"').exec(html); return m ? m[1] : null; };
const canonical = (html) => { const m = /<link rel="canonical" href="([^"]*)"/.exec(html); return m ? m[1] : null; };
const ld = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const unesc = (s) => String(s).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const PAGES = [...SITEMAP_PATHS, ...guides.map((g) => "/learn/" + g.slug)];

const server = app.listen(0, async () => {
  const base = "http://127.0.0.1:" + server.address().port;
  const get = async (p) => { const r = await fetch(base + p); return { status: r.status, text: await r.text() }; };
  try {
    const pages = {};
    for (const p of PAGES) pages[p] = await get(p);
    check("every sitemap page answers 200", PAGES.every((p) => pages[p].status === 200), PAGES.filter((p) => pages[p].status !== 200).join(", "));

    // 4 + 1: canonical, OG, Twitter on every page.
    const bad = (fn) => PAGES.filter((p) => !fn(pages[p].text, p));
    const url = (p) => "https://rootsystems.app" + p;
    check("every page has a self-referencing canonical on https://rootsystems.app", bad((h, p) => canonical(h) === url(p)).length === 0, bad((h, p) => canonical(h) === url(p)).join(", "));
    check("every page has og:title, og:description, og:url (= canonical) and og:image", bad((h, p) => meta(h, "property", "og:title") && meta(h, "property", "og:description") && meta(h, "property", "og:url") === url(p) && meta(h, "property", "og:image") === "https://rootsystems.app/images/og-image.png").length === 0);
    check("every page has a summary_large_image Twitter card with title, description and image", bad((h) => meta(h, "name", "twitter:card") === "summary_large_image" && meta(h, "name", "twitter:title") && meta(h, "name", "twitter:description") && meta(h, "name", "twitter:image")).length === 0);
    check("og:title equals the page <title>", bad((h) => meta(h, "property", "og:title") === (/<title>([^<]*)<\/title>/.exec(h) || [])[1]).length === 0);

    // 5: unique descriptions.
    const descs = PAGES.map((p) => meta(pages[p].text, "name", "description"));
    const dupes = descs.filter((d, i) => !d || descs.indexOf(d) !== i);
    check("every page has its own meta description (" + PAGES.length + " pages, no duplicates)", dupes.length === 0, dupes.join(" | "));
    check("a guide's description is its own summary", guides.every((g) => unesc(meta(pages["/learn/" + g.slug].text, "name", "description")) === g.summary));

    // The image itself.
    const png = fs.readFileSync(path.join(__dirname, "..", "public", "images", "og-image.png"));
    check("og-image.png is a 1200x630 PNG served at /images/og-image.png", png.readUInt32BE(16) === 1200 && png.readUInt32BE(20) === 630 && (await fetch(base + "/images/og-image.png")).status === 200);

    // 2: JSON-LD.
    const orgOk = (h) => ld(h).some((o) => o["@type"] === "Organization" && o.name === "RootSystems" && o.url === "https://rootsystems.app/" && /^https:\/\/rootsystems\.app\/images\//.test(o.logo) && SOCIAL_LINKS.every((s) => o.sameAs.includes(s.url)));
    check("every page has Organization JSON-LD with url, logo and the X + Instagram profiles", bad(orgOk).length === 0, bad(orgOk).join(", "));
    check("sameAs is exactly https://x.com/TheROOTsystems and https://www.instagram.com/therootsystemms/", JSON.stringify(ld(pages["/"].text).find((o) => o["@type"] === "Organization").sameAs) === JSON.stringify(["https://x.com/TheROOTsystems", "https://www.instagram.com/therootsystemms/"]));
    const apps = ld(pages["/pricing"].text).filter((o) => o["@type"] === "SoftwareApplication");
    check("/pricing has one SoftwareApplication per product in price-list.json", apps.length === Object.keys(priceList.products).length && Object.keys(priceList.products).every((n) => apps.some((a) => a.name === n)), apps.map((a) => a.name).join(", "));
    const offersMatch = Object.entries(priceList.products).every(([name, entry]) => {
      const a = apps.find((x) => x.name === name);
      return a && a.offers.length === entry.plans.length && entry.plans.every((plan, i) => a.offers[i].name === plan.name && "$" + Number(a.offers[i].price).toLocaleString("en-US") + (/\/mo$/.test(plan.price) ? "/mo" : / once$/.test(plan.price) ? " once" : "") === plan.price && a.offers[i].priceCurrency === "USD");
    });
    check("every offer's name and price equal price-list.json exactly (monthly plans carry a per-month unit)", offersMatch);
    check("other pages have no SoftwareApplication", PAGES.filter((p) => p !== "/pricing").every((p) => !ld(pages[p].text).some((o) => o["@type"] === "SoftwareApplication")));
    check("each /learn guide has an Article (headline, description, url, publisher)", guides.every((g) => ld(pages["/learn/" + g.slug].text).some((o) => o["@type"] === "Article" && o.headline === g.title && o.description === g.summary && o.url === url("/learn/" + g.slug) && o.publisher)));
    check("guides are og:type article, other pages website", guides.every((g) => meta(pages["/learn/" + g.slug].text, "property", "og:type") === "article") && meta(pages["/"].text, "property", "og:type") === "website");

    // 3: alt text.
    const imgs = PAGES.flatMap((p) => [...pages[p].text.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]));
    const noAlt = imgs.filter((t) => !/\balt="[^"]{3,}"/.test(t));
    check("every <img> on every page has descriptive alt text (" + imgs.length + " images)", imgs.length > 0 && noAlt.length === 0, noAlt.join(" "));

    // 5: sitemap and robots.
    const sitemap = (await get("/sitemap.xml")).text;
    check("the sitemap lists /learn and every /learn/<guide>", ["/learn", ...guides.map((g) => "/learn/" + g.slug)].every((p) => sitemap.includes("<loc>" + url(p) + "</loc>")));
    check("robots.txt points to the sitemap", /^Sitemap: https:\/\/rootsystems\.app\/sitemap\.xml$/m.test((await get("/robots.txt")).text));

    // Odd paths: a query string or trailing slash does not change the canonical; a 404 has none and is noindex.
    const q = (await get("/contact?topic=HIPAA")).text;
    check("a query string does not leak into the canonical", canonical(q) === url("/contact"));
    const nf = await get("/no-such-page");
    check("a 404 page has noindex and no canonical", nf.status === 404 && /<meta name="robots" content="noindex"/.test(nf.text) && !canonical(nf.text));
    check("JSON-LD cannot be closed early by page data (< escaped)", PAGES.every((p) => [...pages[p].text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].every((m) => !m[1].includes("<"))));
  } catch (err) {
    check("test run", false, err.stack);
  } finally {
    server.close();
    console.log("\n" + passed + " passed, " + failed + " failed");
    process.exit(failed ? 1 : 0);
  }
});
