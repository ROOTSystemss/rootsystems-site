"use strict";
// AD-078 (knock-out 2026-11-17): the uptime monitor's classification, the bounded history, the two-in-a-row alert
// rule, the uptime % maths, and /status rendered from fixture data (no data, unreachable data, up / slow / down).
// No network: the monitor and the page both get an injected fetch.
process.env.NODE_ENV = "production";
delete process.env.SITE_URL;
delete process.env.SMTP_HOST;
const fs = require("fs");
const os = require("os");
const path = require("path");
const mon = require("../scripts/uptime-check");
const H = require("../src/utils/statusHistory");
const TARGETS = require("../src/data/statusTargets");
const status = require("../src/services/statusService");
const app = require("../src/app");

let passed = 0, failed = 0;
const check = (label, ok, detail) => { ok ? passed++ : failed++; console.log((ok ? "PASS  " : "FAIL  ") + label + (ok || detail === undefined ? "" : "  -> " + String(detail).slice(0, 300))); };
const vis = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");

(async () => {
  // ---- probe classification (fake clock + fake fetch) ----
  let clock = 0;
  const now = () => clock;
  const sleep = async (ms) => { clock += ms; };
  const answer = (status, takes) => async () => { clock += takes; return { status, body: null }; };
  const sequence = (...fns) => { let i = 0; return (...a) => fns[Math.min(i++, fns.length - 1)](...a); };
  const throwing = (name) => async () => { clock += 100; const e = new Error("x"); e.name = name; throw e; };
  const opt = (fetchImpl) => ({ fetchImpl, now, sleep, slowMs: 20000, retryDelayMs: 10000 });
  check("fast 200 is up", (await mon.probe("u", opt(answer(200, 300)))).state === "up");
  check("a redirect (302 to /login) counts as answering", (await mon.probe("u", opt(answer(302, 300)))).state === "up");
  check("200 after 45 s (cold start) is slow start", (await mon.probe("u", opt(answer(200, 45000)))).state === "slow");
  check("timeout then 200 on the retry is slow start, not down", (await mon.probe("u", opt(sequence(throwing("AbortError"), answer(200, 2000))))).state === "slow");
  const d = await mon.probe("u", opt(sequence(answer(503, 500), answer(503, 500))));
  check("503 twice is down", d.state === "down" && d.status === 503);
  const n = await mon.probe("u", opt(throwing("TypeError")));
  check("network error on both tries is down", n.state === "down" && n.error === "network error");

  // ---- history: append, bounds, new keys ----
  const keys = TARGETS.map((t) => t.key);
  let h = H.emptyHistory(keys);
  const all = (state) => Object.fromEntries(keys.map((k) => [k, { state, ms: 1, status: 200 }]));
  const t0 = 1_800_000_000;
  h = H.appendRun(h, all("up"), t0);
  check("one run = one compact entry with a letter per product", h.entries.length === 1 && h.entries[0].s === "u".repeat(keys.length));
  h = H.appendRun(h, { ...all("up"), "new-product": { state: "slow", ms: 1, status: 200 } }, t0 + 900);
  check("a new product key is appended; older entries just lack its letter", h.keys[h.keys.length - 1] === "new-product" && H.stateAt(h, h.entries[0], "new-product") === null && H.stateAt(h, h.entries[1], "new-product") === "slow");
  let big = H.emptyHistory(["a"]);
  for (let i = 0; i < 9500; i++) big = H.appendRun(big, { a: { state: "up", ms: 1, status: 200 } }, t0 + i * 900);
  check("history is bounded (<= MAX_ENTRIES runs, nothing older than 90 days)", big.entries.length <= H.MAX_ENTRIES && big.entries[0].t >= big.entries[big.entries.length - 1].t - H.KEEP_SECONDS, big.entries.length);
  let full = H.emptyHistory(keys);
  for (let i = 0; i < 9000; i++) full = H.appendRun(full, all(i % 50 ? "up" : "slow"), t0 + i * 900);
  check("a full 90-day file with every product stays small (< 400 KB)", Buffer.byteLength(JSON.stringify(full)) < 400 * 1024, Buffer.byteLength(JSON.stringify(full)));

  // ---- alert rule ----
  let a = H.emptyHistory(["x", "y"]);
  a = H.appendRun(a, { x: { state: "down" }, y: { state: "up" } }, t0);
  check("down once: no alert", H.downTwice(a).length === 0);
  a = H.appendRun(a, { x: { state: "down" }, y: { state: "slow" } }, t0 + 900);
  check("down twice in a row: alert for that product only", JSON.stringify(H.downTwice(a)) === '["x"]');
  check("issue body names the product and the status page", /Down in the last two uptime checks/.test(mon.issueBody(a, ["offboarding"])) && /Offboarding Proof/.test(mon.issueBody(a, ["offboarding"])) && /rootsystems\.app\/status/.test(mon.issueBody(a, ["offboarding"])));
  a = H.appendRun(a, { x: { state: "up" }, y: { state: "up" } }, t0 + 1800);
  check("recovered: alert list empty (the workflow closes the issue)", H.downTwice(a).length === 0);

  // ---- monitor end to end on a temp file (fetch injected through the global) ----
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "uptime-")), "status", "history.json");
  const hist = mon.readHistory(tmp);
  check("missing history file starts empty", hist.entries.length === 0 && hist.keys.length === TARGETS.length);

  // ---- uptime maths ----
  let u = H.emptyHistory(["p"]);
  const nowS = t0 + 100 * 24 * 3600;
  u = H.appendRun(u, { p: { state: "down" } }, nowS - 80 * 24 * 3600); // inside 90 days, outside 7
  for (const s of ["up", "slow", "down", "up"]) u = H.appendRun(u, { p: { state: s } }, nowS - 3600);
  const wk = status.uptime(u, "p", nowS - 7 * 24 * 3600), q = status.uptime(u, "p", nowS - 90 * 24 * 3600);
  check("7-day uptime: up + slow start count as answering (3 of 4 = 75%)", wk.pct === 75 && wk.checks === 4, JSON.stringify(wk));
  check("90-day uptime includes the older down run (3 of 5 = 60%)", q.pct === 60 && q.checks === 5, JSON.stringify(q));
  check("no checks in a window -> null, never a made-up 100%", status.uptime(H.emptyHistory(["p"]), "p", 0).pct === null);

  // ---- /status page ----
  const server = app.listen(0);
  await new Promise((r) => server.once("listening", r));
  const base = "http://127.0.0.1:" + server.address().port;
  const page = async () => { const r = await fetch(base + "/status"); return { status: r.status, html: await r.text() }; };
  try {
    status._setFetch(async () => ({ ok: false, status: 404, json: async () => ({}) }));
    let p = await page();
    check("/status 200 with no data yet, says so, invents nothing", p.status === 200 && /id="status-no-data"/.test(p.html) && !/\d+(\.\d+)?%/.test(vis(p.html).replace(/up to a minute/, "")), p.status);
    status._setFetch(async () => { throw new Error("offline"); });
    p = await page();
    check("/status 200 when GitHub cannot be reached (no data shown, no error page)", p.status === 200 && /id="status-no-data"/.test(p.html));
    let fx = H.emptyHistory(keys);
    const tNow = Math.floor(Date.now() / 1000);
    fx = H.appendRun(fx, all("up"), tNow - 1800);
    fx = H.appendRun(fx, { ...all("up"), hipaa: { state: "slow", ms: 48000, status: 200 }, pqc: { state: "down", ms: 100000, status: null } }, tNow - 900);
    status._setFetch(async () => ({ ok: true, status: 200, json: async () => fx }));
    p = await page();
    const text = vis(p.html);
    check("/status shows each product", TARGETS.every((t) => p.html.includes('data-product="' + t.key + '"')));
    check("up / slow start / down rendered per product", /data-product="site" data-state="up"/.test(p.html) && /data-product="hipaa" data-state="slow"/.test(p.html) && /data-product="pqc" data-state="down"/.test(p.html) && /Slow start/.test(text) && /Down/.test(text));
    check("7-day and 90-day uptime shown from the data (PQC 1 of 2 = 50%)", /data-product="pqc"[\s\S]*?50%[\s\S]*?50%/.test(p.html));
    check("last check time shown", /id="status-last-check"/.test(p.html));
    check("honest wording about the check interval and waking servers", /checked every ~15 minutes from GitHub/i.test(text) && /up to a minute to wake/.test(text));
    check("footer links /status on every page", /href="\/status"/.test((await (await fetch(base + "/")).text())));
    check("/security links the status page", /href="\/status"/.test(await (await fetch(base + "/security")).text()));
  } finally { server.close(); }

  const yml = fs.readFileSync(path.join(__dirname, "..", ".github", "workflows", "uptime.yml"), "utf8");
  check("workflow: every 15 minutes, writes only to status-data, one labelled issue", /cron: "\*\/15 \* \* \* \*"/.test(yml) && /push --quiet origin status-data/.test(yml) && !/push[^\n]*\bmain\b/.test(yml) && /--label uptime/.test(yml) && /gh issue close/.test(yml));
  check("workflow sends no email (no mail tool or service; git user.email is only the commit author)", !/smtp|resend|sendmail|nodemailer|mailgun|sendgrid/i.test(yml));

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
