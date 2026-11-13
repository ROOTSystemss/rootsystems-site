// Search and link-preview tags for every page, from one place (SEO pass 2026-11-12):
//   - a unique meta description per page (guides use their own summary);
//   - a self-referencing canonical URL on https://rootsystems.app (no query string, no trailing slash);
//   - Open Graph and Twitter card tags with one shared 1200x630 image (public/images/og-image.png);
//   - JSON-LD: Organization on every page, a SoftwareApplication per product on /pricing (offers read
//     from src/data/price-list.json, the single source of truth for prices), an Article on each guide.
// head.ejs renders tags(locals); nothing here is hand-typed twice.
const priceList = require("../data/price-list.json");
const { products } = require("../data/products");
const { SOCIAL_LINKS } = require("../data/socialLinks");

const SITE_ORIGIN = "https://rootsystems.app";
const SITE_NAME = "RootSystems";
const OG_IMAGE = { path: "/images/og-image.png", width: 1200, height: 630, alt: "RootSystems: Proof, not paperwork." };
const LOGO_PATH = "/images/rs-mark-orange.png";

// One description per page, written for that page. Guides are not listed: they use guide.summary.
const DESCRIPTIONS = {
  "/": "RootSystems builds compliance and security tools that turn everyday operational work into signed, verifiable evidence: offboarding, HIPAA, vendor risk, standards readiness and AI agent trust.",
  "/pricing": "Prices for every RootSystems product: Offboarding Proof, HIPAA, Vendor Risk, Standards Readiness, AI Agent Trust and PQC Forge. Free plans to start, monthly plans, no long contracts.",
  "/toolkits": "Ready-made compliance toolkits: policies, checklists and evidence templates you can download and adapt, one at a time or the whole set.",
  "/standards": "The standards RootSystems Standards Readiness checks, control by control: what each one asks for and what a readiness report shows before your audit.",
  "/security": "How RootSystems protects your data: encryption at rest, signed and hash-chained reports, minimal data kept, and how to report a vulnerability.",
  "/verify-agent": "Check an AI agent's RootSystems certificate: paste or upload it to see who issued it, what the agent may do, and whether it is still valid.",
  "/learn": "Short, plain-English guides on readiness, evidence, verifying signed reports, choosing a standard, offboarding and post-quantum signatures.",
  "/contact": "Send RootSystems a question, a suggestion or a request to buy. We read every message and reply by email.",
  "/terms": "The RootSystems Terms of Service: the agreement that covers your use of RootSystems products and this website.",
  "/privacy": "The RootSystems Privacy Policy: what personal data we collect, why, how long we keep it and how to ask us to delete it.",
  "/refund": "The RootSystems Refund Policy: when and how you can get your money back for a subscription or a one-time purchase.",
  "/dpa": "The RootSystems Data Processing Agreement: our commitments when we process personal data on your behalf as a processor.",
};
const FALLBACK_DESCRIPTION = "RootSystems builds focused compliance and security products that turn operational work into clear, verifiable evidence.";

const abs = (p) => SITE_ORIGIN + p;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// JSON inside <script type="application/ld+json">: "<" is escaped so no value can close the tag.
const ldJson = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");

// "/learn/" -> "/learn", "/" stays "/". Query strings never reach here (req.path has none).
function canonicalPath(p) {
  const clean = String(p || "/").split("?")[0].replace(/\/+$/, "");
  return clean || "/";
}

function description({ path, guide }) {
  if (guide && guide.summary) return guide.summary;
  return DESCRIPTIONS[canonicalPath(path)] || FALLBACK_DESCRIPTION;
}

function organization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": SITE_ORIGIN + "/#organization",
    name: SITE_NAME,
    url: SITE_ORIGIN + "/",
    logo: abs(LOGO_PATH),
    email: "hello@rootsystems.app",
    sameAs: SOCIAL_LINKS.map((l) => l.url),
  };
}

// "$79/mo" -> { price: "79", unit: "MONTH" }; "$2,500 once" -> { price: "2500", unit: null }.
function parsePrice(text) {
  const m = /^\$([\d,]+(?:\.\d+)?)\s*(\/mo|once)?$/.exec(String(text).trim());
  if (!m) throw new Error("price-list.json: cannot read the price \"" + text + "\"");
  return { price: m[1].replace(/,/g, ""), unit: m[2] === "/mo" ? "MONTH" : null };
}

function offer(plan) {
  const { price, unit } = parsePrice(plan.price);
  const o = { "@type": "Offer", name: plan.name, price, priceCurrency: "USD", url: SITE_ORIGIN + "/pricing" };
  if (unit) o.priceSpecification = { "@type": "UnitPriceSpecification", price, priceCurrency: "USD", unitCode: "MON", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" } };
  return o;
}

// One SoftwareApplication per product in price-list.json, with every plan as an offer, exactly as listed.
function softwareApplications() {
  return Object.entries(priceList.products).map(([name, entry]) => {
    const p = products.find((x) => x.name === name) || {};
    const href = p.href && /^https:\/\//.test(p.href) ? p.href : SITE_ORIGIN + "/pricing";
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name,
      description: p.description || entry.card,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: href,
      publisher: { "@id": SITE_ORIGIN + "/#organization" },
      offers: entry.plans.map(offer),
    };
  });
}

function article(guide) {
  const url = abs("/learn/" + guide.slug);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.summary,
    url,
    mainEntityOfPage: url,
    image: abs(OG_IMAGE.path),
    timeRequired: "PT" + guide.minutes + "M",
    articleSection: guide.kind,
    author: { "@id": SITE_ORIGIN + "/#organization" },
    publisher: { "@id": SITE_ORIGIN + "/#organization" },
  };
}

function jsonLd({ path, guide }) {
  const out = [organization()];
  if (canonicalPath(path) === "/pricing") out.push(...softwareApplications());
  if (guide) out.push(article(guide));
  return out;
}

// Everything that goes in <head> after <title>. locals: the page's render locals (title, seoPath, guide, noindex).
function tags(locals) {
  const path = canonicalPath(locals.seoPath);
  const url = abs(path);
  const title = locals.title || SITE_NAME;
  const desc = description({ path, guide: locals.guide });
  const type = locals.guide ? "article" : "website";
  const lines = [
    `<meta name="description" content="${esc(desc)}" />`,
    locals.noindex ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(abs(OG_IMAGE.path))}" />`,
    `<meta property="og:image:width" content="${OG_IMAGE.width}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE.height}" />`,
    `<meta property="og:image:alt" content="${esc(OG_IMAGE.alt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="@TheROOTsystems" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    `<meta name="twitter:image" content="${esc(abs(OG_IMAGE.path))}" />`,
    `<meta name="twitter:image:alt" content="${esc(OG_IMAGE.alt)}" />`,
    ...jsonLd({ path, guide: locals.guide }).map((obj) => `<script type="application/ld+json">${ldJson(obj)}</script>`),
  ];
  return lines.join("\n");
}

module.exports = { SITE_ORIGIN, OG_IMAGE, DESCRIPTIONS, canonicalPath, description, organization, softwareApplications, article, jsonLd, parsePrice, tags };
