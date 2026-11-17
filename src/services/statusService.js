"use strict";
// AD-078 /status: reads the uptime history that .github/workflows/uptime.yml keeps on the `status-data` branch
// (public repo, raw.githubusercontent.com), at request time with a short cache. Never invents numbers: when the
// file cannot be read or has no runs yet, the page says so.
const TARGETS = require("../data/statusTargets");
const { stateAt, isHistory } = require("../utils/statusHistory");

const HISTORY_URL = process.env.STATUS_HISTORY_URL || "https://raw.githubusercontent.com/ROOTSystemss/rootsystems-site/status-data/status/history.json";
const CACHE_MS = 60 * 1000;
const FETCH_TIMEOUT_MS = 4000;
let cache = null; // { at, history }
let fetchImpl = (...a) => fetch(...a);

async function loadHistory({ now = Date.now() } = {}) {
  if (cache && now - cache.at < CACHE_MS) return cache.history;
  let history = null;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetchImpl(HISTORY_URL, { signal: ctl.signal, headers: { accept: "application/json" } });
    if (r.ok) {
      const h = await r.json();
      if (isHistory(h)) history = h;
    }
  } catch { history = null; } finally { clearTimeout(timer); }
  cache = { at: now, history };
  return history;
}

const pct = (ok, n) => (n ? Math.round((ok / n) * 1000) / 10 : null);

// Uptime % over a window = runs where the product answered (up or slow start) / runs that checked it.
function uptime(history, key, sinceSeconds) {
  let n = 0, ok = 0;
  for (const e of history.entries) {
    if (e.t < sinceSeconds) continue;
    const s = stateAt(history, e, key);
    if (!s) continue;
    n++; if (s === "up" || s === "slow") ok++;
  }
  return { pct: pct(ok, n), checks: n };
}

function summarize(history, nowSeconds) {
  if (!history || !history.entries.length) return { available: false, products: TARGETS.map((t) => ({ ...t, state: null })) };
  const last = history.entries[history.entries.length - 1];
  return {
    available: true,
    lastCheckAt: new Date(last.t * 1000).toISOString(),
    runs: history.entries.length,
    products: TARGETS.map((t) => {
      const latest = history.latest && history.latest[t.key];
      return {
        ...t,
        state: stateAt(history, last, t.key),
        checkedAt: latest ? new Date(latest.at * 1000).toISOString() : null,
        ms: latest ? latest.ms : null,
        week: uptime(history, t.key, nowSeconds - 7 * 24 * 3600),
        quarter: uptime(history, t.key, nowSeconds - 90 * 24 * 3600),
      };
    }),
  };
}

module.exports = { loadHistory, summarize, uptime, HISTORY_URL, _setFetch: (f) => { fetchImpl = f; cache = null; }, _clearCache: () => { cache = null; } };
