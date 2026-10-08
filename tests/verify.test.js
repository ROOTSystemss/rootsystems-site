// /verify (Evidence Notary): runs the page's own browser script (public/js/verify.js and the bundled
// ML-DSA verifier) against reports sealed exactly the way the products seal them, and checks the
// results match rootsystems-core. Run with: npm test
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");

const CORE = path.resolve(__dirname, "..", "..", "..", "rootsystems-core");
const core = fs.existsSync(path.join(CORE, "index.js")) ? require(CORE) : null;
const skip = core ? false : "rootsystems-core is not next to this repo";

// Load the two browser files into a fake window, the way the page loads them.
function loadPage(publishedKeys) {
  const window = {};
  const context = vm.createContext({
    // Only the browser APIs; the sandbox keeps its own built-ins (Object, Uint8Array...), as a page would.
    window, crypto: globalThis.crypto, TextEncoder, TextDecoder, atob,
    document: { getElementById: (id) => (id === "verify-form" ? { addEventListener() {} } : {}) },
    fetch: async () => ({ ok: true, json: async () => ({ keys: publishedKeys }) }),
  });
  context.self = window; context.globalThis = context;
  const pub = path.join(__dirname, "..", "public");
  vm.runInContext(fs.readFileSync(path.join(pub, "vendor", "ml-dsa65.min.js"), "utf8"), context);
  window.RSMlDsa65 = window.RSMlDsa65 || context.RSMlDsa65;
  vm.runInContext(fs.readFileSync(path.join(pub, "js", "verify.js"), "utf8"), context);
  return window.RSVerify;
}

function makeReport(signer, { csv = true } = {}) {
  const pdf = Buffer.from("%PDF-1.7 access review " + crypto.randomBytes(24).toString("hex"));
  const csvBuf = csv ? Buffer.from("email,status\nleaver@example.com,disabled\n") : null;
  const prev = core.genesisHash(7, "reports");
  const contentHash = core.computeContentHash(csv ? [pdf, csvBuf] : [pdf]);
  const manifest = signer.seal({
    manifestVersion: 1, system: "Offboarding Proof", recordType: "access-review", recordId: 3,
    files: { pdf: "r.pdf", csv: csv ? "r.csv" : null }, hashAlgorithm: "sha256",
    contentHash, previousChainHash: prev, chainHash: core.computeChainHash(contentHash, prev),
  });
  return { manifest: JSON.parse(JSON.stringify(manifest)), pdf, csv: csvBuf };
}
const ab = (buf) => (buf ? buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) : null);
const published = (signer) => [{ product: "offboarding-proof", name: "Offboarding Proof", key: { algorithm: "ML-DSA-65", keyId: signer.keyId, publicKey: signer.publicKey } }];

test("an untouched report verifies, and every check names what it proved", { skip }, async () => {
  const signer = core.createSigner(crypto.randomBytes(32).toString("base64"));
  const r = makeReport(signer);
  const page = loadPage(published(signer));
  const result = await page.verify(r.manifest, ab(r.pdf), ab(r.csv), null);
  assert.equal(result.valid, true, JSON.stringify(result.checks));
  assert.deepEqual(Array.from(result.checks, (c) => c.name), ["Signature", "Signed by RootSystems", "File contents", "Chain link"]);
  assert.match(result.checks[1].detail, /Offboarding Proof/);
  // The same report passes rootsystems-core's own verifier.
  assert.equal(core.verifyReport({ manifest: r.manifest, files: { pdf: r.pdf, csv: r.csv }, trustedPublicKey: signer.publicKey }).valid, true);
});

test("changing one byte of the PDF fails the file check, and only that check", { skip }, async () => {
  const signer = core.createSigner(crypto.randomBytes(32).toString("base64"));
  const r = makeReport(signer, { csv: false });
  const edited = Buffer.from(r.pdf); edited[10] ^= 1;
  const result = await loadPage(published(signer)).verify(r.manifest, ab(edited), null, null);
  assert.equal(result.valid, false);
  assert.deepEqual(Array.from(result.checks.filter((c) => !c.ok), (c) => c.name), ["File contents"]);
});

test("an edited manifest fails the signature", { skip }, async () => {
  const signer = core.createSigner(crypto.randomBytes(32).toString("base64"));
  const r = makeReport(signer);
  r.manifest.recordId = 4;
  const result = await loadPage(published(signer)).verify(r.manifest, ab(r.pdf), ab(r.csv), null);
  assert.equal(result.checks[0].ok, false);
  assert.match(result.checks[0].detail, /changed after it was signed/);
});

test("a valid signature from a key RootSystems does not publish is not trusted", { skip }, async () => {
  const ours = core.createSigner(crypto.randomBytes(32).toString("base64"));
  const theirs = core.createSigner(crypto.randomBytes(32).toString("base64"));
  const r = makeReport(theirs);
  const result = await loadPage(published(ours)).verify(r.manifest, ab(r.pdf), ab(r.csv), null);
  assert.equal(result.checks[0].ok, true, "the signature itself is fine");
  assert.equal(result.checks[1].ok, false);
  assert.match(result.checks[1].detail, /not one RootSystems publishes/);
  assert.equal(result.valid, false);
});

test("missing files are reported, never passed", { skip }, async () => {
  const signer = core.createSigner(crypto.randomBytes(32).toString("base64"));
  const r = makeReport(signer);
  const page = loadPage(published(signer));
  assert.equal((await page.verify(r.manifest, null, null, null)).valid, false);
  const noCsv = await page.verify(r.manifest, ab(r.pdf), null, null);
  assert.match(noCsv.checks.find((c) => c.name === "File contents").detail, /also has a CSV/);
});

test("a real OpenTimestamps file is matched to its report", { skip }, async () => {
  const OpenTimestamps = require(path.join(CORE, "node_modules", "opentimestamps"));
  const signer = core.createSigner(crypto.randomBytes(32).toString("base64"));
  const r = makeReport(signer);
  const detached = OpenTimestamps.DetachedTimestampFile.fromHash(new OpenTimestamps.Ops.OpSHA256(), Buffer.from(r.manifest.chainHash, "hex"));
  // A real proof always carries an attestation; a fresh one is "pending" at a public calendar.
  detached.timestamp.attestations.push(new OpenTimestamps.Notary.PendingAttestation("https://alice.btc.calendar.opentimestamps.org"));
  const ots = Buffer.from(detached.serializeToBytes());
  assert.equal(core.proofCommitsTo(ots.toString("base64"), r.manifest.chainHash), true, "core agrees the proof is for this report");
  const page = loadPage(published(signer));
  const ok = await page.verify(r.manifest, ab(r.pdf), ab(r.csv), ab(ots));
  assert.equal(ok.valid, true, JSON.stringify(ok.checks));
  const other = makeReport(signer);
  const bad = await page.verify(other.manifest, ab(other.pdf), ab(other.csv), ab(ots));
  assert.equal(bad.checks.find((c) => c.name === "Timestamp proof").ok, false);
});

test("canonical JSON is byte-for-byte the same as rootsystems-core", { skip }, () => {
  const page = loadPage([]);
  const samples = [{ b: 1, a: [3, { z: null, y: "x" }], c: undefined }, [1, "two", { k: true }], "plain", 42, null, { "é": { deep: [2, 1] } }];
  for (const s of samples) assert.equal(page.canonicalJson(s), core.canonicalJson(s));
});

test("/api/keys keeps only well-formed ML-DSA keys", () => {
  const { cleanKey } = require("../src/controllers/verifyController");
  const good = { configured: true, algorithm: "ML-DSA-65", keyId: "a".repeat(32), publicKey: "QUJD".repeat(40) };
  assert.ok(cleanKey(good));
  assert.equal(cleanKey({ ...good, configured: false }), null);
  assert.equal(cleanKey({ ...good, algorithm: "RSA" }), null);
  assert.equal(cleanKey({ ...good, publicKey: "<script>" }), null);
  assert.equal(cleanKey({ ...good, keyId: "zz" }), null);
});
