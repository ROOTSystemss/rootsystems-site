"use strict";

// Small single-process safeguards. Use a gateway/shared limiter for a scaled deployment.
function installSecurity(app, { sessions = true } = {}) {
  if (sessions && process.env.NODE_ENV === "production") {
    const secret = process.env.SESSION_SECRET || "";
    if (secret.length < 32 || /dev-secret|change.this|replace|your.secret/i.test(secret)) {
      console.warn("[SECURITY WARNING] SESSION_SECRET is missing or weak in production.");
    }
  }

  const attempts = new Map();

  app.use((req, res, next) => {
    const secFetchSite = req.get ? req.get("sec-fetch-site") : "";
    if (secFetchSite === "cross-site") {
      return res.status(403).type("text").send("Cross-site form submissions are not allowed.");
    }

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

module.exports = { installSecurity };
