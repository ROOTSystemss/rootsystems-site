"use strict";

// Public "verify an agent certificate" page. The server asks Authority Atlas directly, so the
// certificate never goes into a URL and Atlas needs no browser CORS allowance for this site.

const ATLAS_URL = (() => {
  try {
    return new URL(process.env.ATLAS_URL || "https://authority-atlas.onrender.com").origin;
  } catch {
    return "https://authority-atlas.onrender.com";
  }
})();
const TIMEOUT_MS = 20000; // Atlas runs on an instance that can take a while to wake up.
const MAX_LENGTH = 8000;

const REASONS = {
  bad_signature: "The signature does not match. Authority Atlas did not issue this certificate, or it was changed after it was issued.",
  malformed: "This is not a readable certificate. Check that you pasted all of it, with nothing added.",
  not_an_agent_certificate: "This is a token from Authority Atlas, but not an agent certificate.",
  unknown_certificate: "Authority Atlas has no record of this certificate.",
  revoked: "The issuer revoked this certificate.",
  expired: "This certificate has expired.",
  invalid_certificate: "Authority Atlas did not accept this certificate.",
};

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

function expiryText(expiresAt) {
  const end = Date.parse(expiresAt);
  if (!Number.isFinite(end)) return null;
  const days = Math.floor((end - Date.now()) / 86400000);
  if (days < 0) return "Expired " + formatDate(expiresAt);
  if (days === 0) return "Expires today (" + formatDate(expiresAt) + ")";
  return "Expires in " + days + (days === 1 ? " day" : " days") + " (" + formatDate(expiresAt) + ")";
}

function limitLines(limits) {
  const lines = [];
  if (limits && typeof limits.maxAmountUsd === "number") lines.push("Up to USD " + limits.maxAmountUsd.toLocaleString("en-US") + " per action");
  if (limits && typeof limits.maxActionsPerDay === "number") lines.push(limits.maxActionsPerDay.toLocaleString("en-US") + " actions per day");
  return lines;
}

function view(certificate) {
  if (!certificate || typeof certificate !== "object") return null;
  return {
    agentId: String(certificate.agentId || ""),
    agentName: String(certificate.agentName || certificate.agentId || "Unnamed agent"),
    organization: String(certificate.organization || ""),
    permissions: Array.isArray(certificate.permissions) ? certificate.permissions.map(String) : [],
    limits: limitLines(certificate.limits),
    issued: formatDate(certificate.issuedAt),
    expiry: expiryText(certificate.expiresAt),
  };
}

async function askAtlas(certificate, fetchImpl = fetch) {
  let response;
  try {
    response = await fetchImpl(ATLAS_URL + "/agents/verify?certificate=" + encodeURIComponent(certificate), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return { unavailable: true };
  }
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!body || typeof body.valid !== "boolean") return { unavailable: true };
  if (body.valid) return { valid: true, certificate: view(body.certificate) };
  const reason = typeof body.reason === "string" ? body.reason : "invalid_certificate";
  let message = REASONS[reason] || REASONS.invalid_certificate;
  const revokedAt = formatDate(body.revokedAt || (body.certificate && body.certificate.revokedAt));
  if (reason === "revoked" && revokedAt) message = "The issuer revoked this certificate on " + revokedAt + ".";
  return { valid: false, reason, message, certificate: view(body.certificate) };
}

function render(res, status, locals) {
  res.status(status).render("pages/verify-agent", {
    title: "Verify an agent certificate — RootSystems",
    value: "",
    error: null,
    result: null,
    ...locals,
  });
}

function verifyAgentPage(req, res) {
  render(res, 200, {});
}

async function verifyAgentSubmit(req, res, next) {
  try {
    const value = String((req.body && req.body.certificate) || "").trim();
    if (!value) return render(res, 400, { error: "Paste a certificate to check." });
    if (value.length > MAX_LENGTH) return render(res, 400, { error: "That is longer than any agent certificate. Check what you pasted." });
    res.set("Cache-Control", "no-store");
    const result = await askAtlas(value);
    if (result.unavailable) {
      return render(res, 503, { value, error: "We could not reach Authority Atlas just now. It may be waking up; try again in a minute." });
    }
    return render(res, 200, { value, result });
  } catch (error) {
    return next(error);
  }
}

module.exports = { verifyAgentPage, verifyAgentSubmit, askAtlas };
