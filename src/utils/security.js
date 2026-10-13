"use strict";

// Small single-process safeguards. Use a gateway/shared limiter for a scaled deployment.
//
// Cross-site request check (CSRF). It applies ONLY to state-changing methods (POST, PUT, PATCH,
// DELETE). Reading a page (GET, HEAD, OPTIONS) is never blocked: visitors arriving from Instagram,
// Facebook or any other site carry `Sec-Fetch-Site: cross-site` and a foreign Referer on a normal
// page load, and used to get "Cross-site form submissions are not allowed" here (fixed 2026-10-12).
//
// For a state-changing request: the Origin header is checked first, then the Referer when Origin is
// absent (or the literal "null"), then the browser-set Sec-Fetch-Site. The allowed origins come from
// SITE_URL (default https://rootsystems.app, plus its www. twin), never from the request's Host
// header. Outside production, without SITE_URL, the request's own host is accepted so local
// development works.

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const DEFAULT_SITE_URL = "https://rootsystems.app";

function allowedOrigins(req) {
  const configured = process.env.SITE_URL || (process.env.NODE_ENV === "production" ? DEFAULT_SITE_URL : "");
  const origins = new Set();
  if (configured) {
    const u = new URL(configured);
    origins.add(u.origin);
    const twin = new URL(u.origin);
    twin.hostname = u.hostname.startsWith("www.") ? u.hostname.slice(4) : "www." + u.hostname;
    origins.add(twin.origin);
  } else {
    origins.add(req.protocol + "://" + req.get("host"));
  }
  return origins;
}

// Returns null when the request may proceed, or the message to refuse it with.
function crossSiteRefusal(req) {
  if (SAFE_METHODS.has(req.method)) return null;
  const secFetchSite = req.get("sec-fetch-site");
  if (secFetchSite === "cross-site") return "Cross-site form submissions are not allowed.";
  const rawOrigin = req.get("origin");
  const candidate = (rawOrigin && rawOrigin !== "null" ? rawOrigin : null) || req.get("referer");
  let allowed;
  try {
    allowed = allowedOrigins(req);
  } catch {
    return "Request origin could not be verified. Reload this page and try again.";
  }
  if (candidate) {
    let source;
    try {
      source = new URL(candidate);
    } catch {
      return "Request origin could not be verified. Reload this page and try again.";
    }
    return allowed.has(source.origin) ? null : "Cross-site form submissions are not allowed.";
  }
  // No Origin and no Referer (privacy settings can strip both): accept only when the browser itself
  // says the request came from this site. Without any signal, refuse.
  if (secFetchSite === "same-origin" || secFetchSite === "same-site" || secFetchSite === "none") return null;
  return "Request origin could not be verified. Reload this page and try again.";
}

function installSecurity(app, { sessions = true } = {}) {
  if (sessions && process.env.NODE_ENV === "production") {
    const secret = process.env.SESSION_SECRET || "";
    if (secret.length < 32 || /dev-secret|change.this|replace|your.secret/i.test(secret)) {
      console.warn("[SECURITY WARNING] SESSION_SECRET is missing or weak in production.");
    }
  }

  const attempts = new Map();

  app.use((req, res, next) => {
    // Sends only the origin (not the path) to other sites, and keeps same-site Origin/Referer intact
    // for the check above.
    res.set("Referrer-Policy", "strict-origin-when-cross-origin");

    const refusal = crossSiteRefusal(req);
    if (refusal) return res.status(403).type("text").send(refusal);

    if (req.method === "POST" && /^\/(login|signup|forgot-password|reset-password|contact|verify-agent)$/.test(req.path)) {
      const now = Date.now();
      for (const [key, value] of attempts) {
        if (value.until <= now) attempts.delete(key);
      }

      const key = (req.ip || "unknown") + ":" + req.path;
      if (!attempts.has(key) && attempts.size >= 10000) {
        return res.status(429).set("Retry-After", "60").type("text").send("Please try again shortly.");
      }

      const record = attempts.get(key) || { count: 0, until: now + 15 * 60 * 1000 };
      attempts.set(key, record);

      if (++record.count > 30) {
        return res.status(429)
          .set("Retry-After", String(Math.ceil((record.until - now) / 1000)))
          .type("text")
          .send("Too many attempts. Please wait before trying again.");
      }
    }

    next();
  });
}

module.exports = { installSecurity, crossSiteRefusal };
