"use strict";
// AD-078 uptime monitor (knock-out 2026-11-17). Run by .github/workflows/uptime.yml every ~15 minutes on GitHub's
// free runners; no paid service, no email code. It GETs each target in src/data/statusTargets.js and appends one
// compact entry to a JSON history kept on the `status-data` branch (never main, so the site does not redeploy).
//
//   up    - answered 2xx/3xx within SLOW_MS on the first try
//   slow  - answered 2xx/3xx, but only after SLOW_MS or on the retry (a free Render server waking from sleep)
//   down  - no 2xx/3xx answer on the first try nor on the retry (timeout, network error or 4xx/5xx)
//
// History format: see src/utils/statusHistory.js (bounded to 90 days and MAX_ENTRIES runs).
// Usage: node scripts/uptime-check.js <history.json> [<alert-out.json>]
const fs = require("fs");
const path = require("path");
const TARGETS = require("../src/data/statusTargets");
const { emptyHistory, isHistory, appendRun, downTwice, stateAt, KEEP_SECONDS, MAX_ENTRIES } = require("../src/utils/statusHistory");

const TIMEOUT_MS = 100 * 1000; // a cold start on Render's free plan can take 60-90 s
const SLOW_MS = 20 * 1000;
const RETRY_DELAY_MS = 10 * 1000;

async function attempt(url, { fetchImpl = fetch, timeoutMs = TIMEOUT_MS, now = Date.now } = {}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  const started = now();
  try {
    const r = await fetchImpl(url, { redirect: "manual", signal: ctl.signal, headers: { "user-agent": "rootsystems-uptime-check (+https://rootsystems.app/status)" } });
    try { if (r.body && r.body.cancel) await r.body.cancel(); } catch { /* ignore */ }
    return { ok: r.status >= 200 && r.status < 400, status: r.status, ms: now() - started };
  } catch (err) {
    return { ok: false, status: null, ms: now() - started, error: err && err.name === "AbortError" ? "timeout" : "network error" };
  } finally { clearTimeout(timer); }
}

// One target: first try; on failure, wait and retry once (the first request may have woken the server).
async function probe(url, opts = {}) {
  const { slowMs = SLOW_MS, retryDelayMs = RETRY_DELAY_MS, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = opts;
  const first = await attempt(url, opts);
  if (first.ok) return { state: first.ms >= slowMs ? "slow" : "up", status: first.status, ms: first.ms };
  await sleep(retryDelayMs);
  const second = await attempt(url, opts);
  if (second.ok) return { state: "slow", status: second.status, ms: first.ms + second.ms };
  return { state: "down", status: second.status, ms: second.ms, error: second.error || first.error || null };
}

function readHistory(file) {
  try {
    const h = JSON.parse(fs.readFileSync(file, "utf8"));
    if (isHistory(h)) return { latest: {}, ...h };
  } catch { /* missing or unreadable: start fresh */ }
  return emptyHistory(TARGETS.map((t) => t.key));
}

function issueBody(history, keys) {
  const names = keys.map((k) => { const t = TARGETS.find((x) => x.key === k); return "- " + (t ? t.name + " (" + t.url + ")" : k); });
  return "Down in the last two uptime checks (about 15 minutes apart):\n\n" + names.join("\n") +
    "\n\nThis issue is kept up to date by .github/workflows/uptime.yml and closes itself when every product answers again. Status page: https://rootsystems.app/status";
}

async function main() {
  const [file, alertOut] = process.argv.slice(2);
  if (!file) { console.error("usage: node scripts/uptime-check.js <history.json> [<alert-out.json>]"); process.exit(2); }
  const results = {};
  await Promise.all(TARGETS.map(async (t) => { results[t.key] = await probe(t.url); }));
  const h = appendRun(readHistory(file), results, Math.floor(Date.now() / 1000));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(h));
  const down = downTwice(h);
  if (alertOut) fs.writeFileSync(alertOut, JSON.stringify({ down, body: down.length ? issueBody(h, down) : "" }));
  for (const t of TARGETS) console.log(`${results[t.key].state.padEnd(5)} ${String(results[t.key].status).padEnd(4)} ${String(results[t.key].ms).padStart(6)} ms  ${t.name}`);
  console.log(`history: ${h.entries.length} runs; down twice: ${down.join(", ") || "none"}`);
}

module.exports = { attempt, probe, emptyHistory, readHistory, appendRun, downTwice, issueBody, stateAt, SLOW_MS, KEEP_SECONDS, MAX_ENTRIES };
if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
