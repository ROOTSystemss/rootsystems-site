// Evidence Notary: checks a RootSystems report entirely in this browser. The files never leave the
// page; the only request is /api/keys, for the products' published signing keys. The checks are the
// same as rs-verify in @rootsystems/core (src/verify.js, seal.js, chain.js, hash.js), ported exactly.
(function () {
  "use strict";

  var form = document.getElementById("verify-form");
  if (!form) return;
  var out = document.getElementById("verify-result");
  var enc = new TextEncoder();

  // Object keys sorted at every level, no whitespace, undefined dropped (array holes become null).
  function canonicalJson(value) {
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return "[" + value.map(function (v) { return v === undefined ? "null" : canonicalJson(v); }).join(",") + "]";
    var keys = Object.keys(value).filter(function (k) { return value[k] !== undefined; }).sort();
    return "{" + keys.map(function (k) { return JSON.stringify(k) + ":" + canonicalJson(value[k]); }).join(",") + "}";
  }
  function withoutSignature(doc) {
    var copy = {};
    Object.keys(doc).forEach(function (k) { if (k !== "signature") copy[k] = doc[k]; });
    return JSON.parse(JSON.stringify(copy));
  }
  function hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }
  function digest(alg, bytes) { return crypto.subtle.digest(alg, bytes).then(hex); }
  function b64(s) {
    var bin = atob(String(s || ""));
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function concat(parts) {
    var len = parts.reduce(function (n, p) { return n + p.byteLength; }, 0);
    var out = new Uint8Array(len), off = 0;
    parts.forEach(function (p) { out.set(new Uint8Array(p), off); off += p.byteLength; });
    return out;
  }
  function readFile(input) {
    var f = input.files && input.files[0];
    return f ? f.arrayBuffer() : Promise.resolve(null);
  }

  // An .ots file starts with a fixed 31-byte header, a version byte (1) and the hash operation
  // (0x08 = SHA-256); the next 32 bytes are the digest it timestamps.
  var OTS_MAGIC = [0x00, 0x4f, 0x70, 0x65, 0x6e, 0x54, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d, 0x70, 0x73, 0x00, 0x00, 0x50, 0x72, 0x6f, 0x6f, 0x66, 0x00, 0xbf, 0x89, 0xe2, 0xe8, 0x84, 0xe8, 0x92, 0x94];
  function otsDigest(buf) {
    var b = new Uint8Array(buf);
    if (b.length < 65) return null;
    for (var i = 0; i < OTS_MAGIC.length; i++) if (b[i] !== OTS_MAGIC[i]) return null;
    if (b[31] !== 0x01 || b[32] !== 0x08) return null;
    return hex(b.slice(33, 65));
  }

  var keysPromise = null;
  function loadKeys() {
    if (!keysPromise) {
      keysPromise = fetch("/api/keys", { headers: { Accept: "application/json" } })
        .then(function (r) { return r.ok ? r.json() : { keys: [] }; })
        .then(function (j) { return j.keys || []; })
        .catch(function () { return []; });
    }
    return keysPromise;
  }

  async function verify(manifest, pdf, csv, ots) {
    var checks = [];
    function add(name, ok, detail) { checks.push({ name: name, ok: ok, detail: detail }); }
    var sig = manifest && manifest.signature;

    // 1. The signature over the manifest.
    var sealOk = false;
    if (!sig || sig.status !== "signed") add("Signature", false, "This manifest is not signed.");
    else if (sig.algorithm !== "ML-DSA-65") add("Signature", false, "Unsupported algorithm: " + sig.algorithm);
    else {
      var pub = b64(sig.publicKey);
      var keyId = (await digest("SHA-512", pub)).slice(0, 32);
      var bytes = enc.encode(canonicalJson(withoutSignature(manifest)));
      if (keyId !== sig.keyId) add("Signature", false, "The key ID does not belong to the key in the signature.");
      else if ((await digest("SHA-512", bytes)) !== sig.sha512) add("Signature", false, "The manifest was changed after it was signed.");
      else {
        var good = false;
        try { good = window.RSMlDsa65.verify(b64(sig.value), bytes, pub); } catch (e) { good = false; }
        sealOk = good;
        add("Signature", good, good ? "ML-DSA-65 (FIPS 204) signature is valid. Key " + sig.keyId + "." : "The signature does not match the manifest.");
      }
    }

    // 2. Who signed it: the key must be one a RootSystems product publishes.
    if (sealOk) {
      var keys = await loadKeys();
      var match = keys.filter(function (k) { return k.key && k.key.keyId === sig.keyId && k.key.publicKey === sig.publicKey; })[0];
      if (match) add("Signed by RootSystems", true, "This is the published signing key of " + match.name + ".");
      else if (!keys.some(function (k) { return k.key; })) add("Signed by RootSystems", false, "The product keys could not be fetched right now, so the signer could not be confirmed. Try again in a minute.");
      else add("Signed by RootSystems", false, "The signature is valid, but the key is not one RootSystems publishes. Someone else signed this.");
    }

    // 3. The files match the signed fingerprint (PDF, then CSV when the report has one).
    var hasCsv = !!(manifest.files && manifest.files.csv);
    if (!pdf) add("File contents", false, "Add the report PDF to check its contents. Only the manifest was checked.");
    else if (hasCsv && !csv) add("File contents", false, "This report also has a CSV file. Add it too.");
    else {
      var contentHash = await digest("SHA-256", concat(hasCsv ? [pdf, csv] : [pdf]));
      var same = contentHash === manifest.contentHash;
      add("File contents", same, same ? "The file" + (hasCsv ? "s match" : " matches") + " the signed fingerprint, byte for byte." : "The file" + (hasCsv ? "s differ" : " differs") + " from what was signed. Even one changed byte shows here.");
    }

    // 4. The chain link: chainHash = SHA-256(contentHash + previousChainHash) as text.
    if (manifest.contentHash && manifest.previousChainHash && manifest.chainHash) {
      var chain = await digest("SHA-256", enc.encode(manifest.contentHash + manifest.previousChainHash));
      add("Chain link", chain === manifest.chainHash, chain === manifest.chainHash ? "The report is linked to the one before it, so it cannot be removed or reordered unnoticed." : "The chain hash does not follow from the content hash.");
    }

    // 5. Optional timestamp proof.
    if (ots) {
      var d = otsDigest(ots);
      if (!d) add("Timestamp proof", false, "This is not a readable OpenTimestamps (.ots) file.");
      else add("Timestamp proof", d === String(manifest.chainHash).toLowerCase(), d === String(manifest.chainHash).toLowerCase() ? "The .ots proof is for this exact report. Confirm its Bitcoin anchoring at opentimestamps.org." : "The .ots proof is for a different report.");
    }

    return { valid: checks.length > 0 && checks.every(function (c) { return c.ok; }), checks: checks };
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function show(result, manifest) {
    out.innerHTML = "";
    var card = el("article", "agent-result agent-result--" + (result.valid ? "valid" : "invalid"));
    card.setAttribute("aria-live", "polite");
    var head = el("header", "agent-result__head");
    head.appendChild(el("span", "agent-result__mark", result.valid ? "✓" : "!"));
    var t = el("div");
    var failed = result.checks.filter(function (c) { return !c.ok; })[0];
    t.appendChild(el("p", "agent-result__state", result.valid ? "Verified" : "Not verified"));
    t.appendChild(el("p", "agent-result__sub", result.valid ? "Every check passed, in this browser." : failed.name + ": " + failed.detail));
    head.appendChild(t);
    card.appendChild(head);

    if (manifest) {
      var facts = el("dl", "agent-result__facts");
      [["Product", manifest.system], ["Record", [manifest.recordType, manifest.recordId].filter(function (x) { return x != null; }).join(" #")], ["Sealed", manifest.sealedAt || (manifest.generatedAt || null)]].forEach(function (f) {
        if (!f[1]) return;
        var row = el("div"); row.appendChild(el("dt", null, f[0])); row.appendChild(el("dd", null, String(f[1]))); facts.appendChild(row);
      });
      card.appendChild(facts);
    }

    var list = el("ul", "verify-checks");
    result.checks.forEach(function (c) {
      var li = el("li", "verify-check verify-check--" + (c.ok ? "ok" : "bad"));
      li.appendChild(el("span", "verify-check__mark", c.ok ? "✓" : "✗"));
      var body = el("div");
      body.appendChild(el("strong", null, c.name));
      body.appendChild(el("p", null, c.detail));
      li.appendChild(body);
      list.appendChild(li);
    });
    card.appendChild(list);
    card.appendChild(el("p", "agent-result__note", "A valid seal proves the report has not changed since RootSystems signed it, and which product signed it. It does not prove that a control works. ML-DSA-65 is the algorithm standardized in NIST FIPS 204; this page is not a FIPS 140-validated module."));
    out.appendChild(card);
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    var button = form.querySelector("button[type=submit]");
    button.disabled = true;
    out.innerHTML = "";
    try {
      var manifestBuf = await readFile(form.manifest);
      if (!manifestBuf) throw new Error("Add the manifest (.json) from the product's Reports page.");
      var manifest;
      try { manifest = JSON.parse(new TextDecoder().decode(manifestBuf)); } catch (e) { throw new Error("The manifest is not valid JSON."); }
      var files = await Promise.all([readFile(form.pdf), readFile(form.csv), readFile(form.ots)]);
      show(await verify(manifest, files[0], files[1], files[2]), manifest);
    } catch (error) {
      out.appendChild(el("div", "form-alert", error.message));
    } finally {
      button.disabled = false;
    }
  });

  loadKeys(); // warm the key fetch while the visitor picks files
  window.RSVerify = { verify: verify, canonicalJson: canonicalJson, otsDigest: otsDigest };
})();
