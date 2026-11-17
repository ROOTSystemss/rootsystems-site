"use strict";
// AD-078: the uptime history format, shared by scripts/uptime-check.js (writer, in GitHub Actions) and
// src/services/statusService.js (reader, on rootsystems.app).
//   { "version": 1, "keys": ["site", ...], "entries": [ { "t": <unix seconds>, "s": "uuds..." } ],
//     "latest": { "<key>": { "state": "up", "ms": 420, "status": 200, "at": <unix seconds> } } }
// `s` holds one letter per key in `keys` order: u = up, s = slow start, d = down, "-" = not checked in that run.
const CODE = { up: "u", slow: "s", down: "d" };
const STATE = { u: "up", s: "slow", d: "down" };
const KEEP_SECONDS = 90 * 24 * 3600;
const MAX_ENTRIES = 9000; // ~93 days at one run per 15 minutes

function emptyHistory(keys) { return { version: 1, keys: [...keys], entries: [], latest: {} }; }

function isHistory(h) { return !!(h && h.version === 1 && Array.isArray(h.keys) && Array.isArray(h.entries)); }

// Adds one run. New keys are appended to `keys`; older entries simply have no letter for them.
function appendRun(history, results, nowSeconds) {
  const h = { ...history, keys: [...history.keys], entries: [...history.entries], latest: { ...(history.latest || {}) } };
  for (const key of Object.keys(results)) if (!h.keys.includes(key)) h.keys.push(key);
  const s = h.keys.map((k) => (results[k] ? CODE[results[k].state] : "-")).join("");
  h.entries.push({ t: nowSeconds, s });
  for (const [k, r] of Object.entries(results)) h.latest[k] = { state: r.state, ms: r.ms, status: r.status, at: nowSeconds };
  const cutoff = nowSeconds - KEEP_SECONDS;
  h.entries = h.entries.filter((e) => e.t >= cutoff).slice(-MAX_ENTRIES);
  return h;
}

function stateAt(history, entry, key) {
  const i = history.keys.indexOf(key);
  const c = i >= 0 && typeof entry.s === "string" ? entry.s[i] : undefined;
  return STATE[c] || null;
}

// Keys that were down in each of the last two runs.
function downTwice(history) {
  const [a, b] = history.entries.slice(-2);
  if (!a || !b) return [];
  return history.keys.filter((k) => stateAt(history, a, k) === "down" && stateAt(history, b, k) === "down");
}

module.exports = { CODE, STATE, KEEP_SECONDS, MAX_ENTRIES, emptyHistory, isHistory, appendRun, stateAt, downTwice };
