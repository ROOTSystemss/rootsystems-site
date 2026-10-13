"use strict";
// rootsystems.app cross-site check: page loads from Instagram / Facebook are never blocked; form
// posts must come from rootsystems.app (Origin first, then Referer, then Sec-Fetch-Site).
// Runs the real app in production mode on a random port. No email is sent (no SMTP configured).
process.env.NODE_ENV = "production";
delete process.env.SITE_URL;
delete process.env.SMTP_HOST;
const app = require("../src/app");

let passed = 0, failed = 0;
const check = (label, ok, detail) => { ok ? passed++ : failed++; console.log((ok ? "PASS  " : "FAIL  ") + label + (ok || detail === undefined ? "" : "  -> " + detail)); };

const server = app.listen(0, async () => {
  const B = "http://127.0.0.1:" + server.address().port;
  const get = (p, headers) => fetch(B + p, { headers, redirect: "manual" });
  const post = (p, headers) => fetch(B + p, { method: "POST", redirect: "manual", headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers }, body: "name=Test&email=t%40example.com&message=hello" });
  try {
    for (const [label, ref] of [["Instagram", "https://l.instagram.com/"], ["Facebook", "https://www.facebook.com/"]]) {
      const r = await get("/pricing", { "Sec-Fetch-Site": "cross-site", Referer: ref });
      check("GET /pricing arriving from " + label + " returns 200", r.status === 200, r.status);
    }
    check("GET / arriving from Instagram returns 200", (await get("/", { "Sec-Fetch-Site": "cross-site", Referer: "https://l.instagram.com/" })).status === 200);
    check("HEAD from a foreign site passes", (await fetch(B + "/pricing", { method: "HEAD", headers: { "Sec-Fetch-Site": "cross-site", Referer: "https://l.instagram.com/" } })).status === 200);
    const r1 = await get("/pricing", {});
    check("pages send Referrer-Policy strict-origin-when-cross-origin", r1.headers.get("referrer-policy") === "strict-origin-when-cross-origin", r1.headers.get("referrer-policy"));

    const foreign = await post("/contact", { Origin: "https://evil.example" });
    check("POST /contact with a foreign Origin is rejected (403)", foreign.status === 403, foreign.status);
    const foreignRef = await post("/contact", { Referer: "https://l.instagram.com/x" });
    check("POST /contact with a foreign Referer and no Origin is rejected", foreignRef.status === 403, foreignRef.status);
    const crossSite = await post("/contact", { "Sec-Fetch-Site": "cross-site", Origin: "https://rootsystems.app" });
    check("POST marked cross-site by the browser is rejected even with a forged Origin", crossSite.status === 403, crossSite.status);
    for (const origin of ["https://rootsystems.app", "https://www.rootsystems.app"]) {
      const ok = await post("/contact", { Origin: origin, "Sec-Fetch-Site": "same-origin" });
      check("POST /contact from " + origin + " is not blocked by the check", ok.status !== 403, ok.status);
    }
    const ownRef = await post("/contact", { Referer: "https://rootsystems.app/contact" });
    check("POST with only our own Referer is not blocked", ownRef.status !== 403, ownRef.status);
    const nullOrigin = await post("/contact", { Origin: "null", "Sec-Fetch-Site": "same-origin" });
    check("POST with Origin 'null' but browser-confirmed same-origin passes", nullOrigin.status !== 403, nullOrigin.status);
    const none = await post("/contact", {});
    check("POST with no Origin, no Referer and no browser signal is refused", none.status === 403, none.status);
    const hostSpoof = await post("/contact", { Origin: "https://evil.example", Host: "evil.example" });
    check("a forged Host header does not make a foreign Origin acceptable", hostSpoof.status === 403, hostSpoof.status);
  } catch (e) {
    check("run", false, e.stack || e.message);
  } finally {
    server.close();
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
  }
});
