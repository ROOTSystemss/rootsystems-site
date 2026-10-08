"use strict";

// Evidence Notary: the public /verify page. Every check runs in the visitor's browser (public/js/verify.js);
// the report files are never uploaded. The only server part is /api/keys, which fetches each product's
// published signing key server-side (the products send no CORS headers) and caches it for an hour.

const PRODUCTS = [
  { id: "offboarding-proof", name: "Offboarding Proof", origin: "https://offboarding-proof.onrender.com" },
  { id: "tpra", name: "Vendor Risk", origin: "https://tpra.onrender.com" },
  { id: "hipaa", name: "HIPAA", origin: "https://hipaa-g37n.onrender.com" },
  { id: "compliance-readiness", name: "Standards Readiness", origin: "https://ai-compliance-readiness.onrender.com" },
  { id: "agent-governance", name: "AI Agent Trust", origin: "https://agent-contract-gap.onrender.com" }
];
const KEY_PATH = "/.well-known/rootsystems-signing-key.json";
const CACHE_MS = 60 * 60 * 1000;
const TIMEOUT_MS = 20000; // the products run on instances that can take a while to wake up

const cache = new Map(); // id -> { at, key }

function cleanKey(body) {
  if (!body || body.configured !== true || body.algorithm !== "ML-DSA-65") return null;
  if (typeof body.publicKey !== "string" || !/^[A-Za-z0-9+/=]{100,4000}$/.test(body.publicKey)) return null;
  if (typeof body.keyId !== "string" || !/^[0-9a-f]{32}$/.test(body.keyId)) return null;
  return { algorithm: body.algorithm, keyId: body.keyId, publicKey: body.publicKey };
}

async function productKey(product, fetchImpl = fetch) {
  const hit = cache.get(product.id);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.key;
  try {
    const res = await fetchImpl(product.origin + KEY_PATH, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    const key = res.ok ? cleanKey(await res.json()) : null;
    if (key) cache.set(product.id, { at: Date.now(), key });
    return key || (hit ? hit.key : null);
  } catch {
    return hit ? hit.key : null;
  }
}

async function keysApi(req, res, next) {
  try {
    const keys = await Promise.all(PRODUCTS.map(async (p) => ({ product: p.id, name: p.name, source: p.origin + KEY_PATH, key: await productKey(p) })));
    res.set("Cache-Control", "public, max-age=600");
    res.json({ keys });
  } catch (error) {
    next(error);
  }
}

function verifyPage(req, res) {
  res.render("pages/verify", { title: "Verify a report — RootSystems", products: PRODUCTS });
}

module.exports = { verifyPage, keysApi, productKey, cleanKey, PRODUCTS };
