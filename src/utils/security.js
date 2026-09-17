"use strict";

// Small single-process safeguards. Use a gateway/shared limiter for a scaled deployment.
function installSecurity(app, { sessions = true } = {}) {
  if (sessions && process.env.NODE_ENV === "production") {
    const secret = process.env.SESSION_SECRET || "";
    if (secret.length < 32 || /dev-secret|change.this|replace|your.secret/i.test(secret)) {
      throw new Error("Production requires a non-placeholder SESSION_SECRET of at least 32 characters.");
    }
  }
  app.disable("x-powered-by");
  const attempts = new Map();
  app.use((req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    });
    if (!/\.(css|js|svg|png|jpg|webp|woff2?)$/i.test(req.path)) res.set("Cache-Control", "no-store");
    const unsafe = !["GET", "HEAD", "OPTIONS"].includes(req.method);
    // Payment callbacks authenticate their own raw body with the provider signature.
    if (unsafe && req.path !== "/billing/webhook") {
      let source, target;
      try {
        source = new URL(req.get("origin") || req.get("referer") || "");
        target = new URL(process.env.APP_URL || req.protocol + "://" + req.get("host"));
      } catch {
        return res.status(403).type("text").send("Request origin could not be verified. Reload this page and try again.");
      }
      if (source.origin !== target.origin || req.get("sec-fetch-site") === "cross-site") {
        return res.status(403).type("text").send("Cross-site form submissions are not allowed.");
      }
    }
    if (req.method === "POST" && /^\/(login|signup|forgot-password|reset-password|contact)$/.test(req.path)) {
      const now = Date.now();
      for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
      const key = req.ip + ":" + req.path;
      if (!attempts.has(key) && attempts.size >= 10000) {
        return res.status(429).set("Retry-After", "60").type("text").send("Please try again shortly.");
      }
      const record = attempts.get(key) || { count: 0, until: now + 15 * 60 * 1000 };
      attempts.set(key, record);
      if (++record.count > 30) {
        return res.status(429).set("Retry-After", String(Math.ceil((record.until - now) / 1000)))
          .type("text").send("Too many attempts. Please wait before trying again.");
      }
    }
    next();
  });
}

module.exports = { installSecurity };
