// AES-256-GCM encryption for personal data stored at rest, keyed by the
// PII_ENCRYPTION_KEY environment variable. Applies to newly written records
// only; existing plaintext records are left as they are and decrypt() passes
// them through unchanged.
const crypto = require("crypto");

const PREFIX = "enc:v1:";

function loadKey() {
  const raw = process.env.PII_ENCRYPTION_KEY;
  if (!raw) return null;
  const asHex = /^[0-9a-fA-F]{64}$/.test(raw) ? Buffer.from(raw, "hex") : null;
  if (asHex) return asHex;
  const asBase64 = Buffer.from(raw, "base64");
  if (asBase64.length === 32) return asBase64;
  // Any other string: derive a 32-byte key so a differently formatted secret still works.
  return crypto.createHash("sha256").update(raw, "utf8").digest();
}

function isEnabled() {
  return loadKey() !== null;
}

function encrypt(plaintext) {
  const key = loadKey();
  if (!key) throw new Error("PII_ENCRYPTION_KEY is not set.");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(String(plaintext), "utf8"), cipher.final()]);
  return PREFIX + [iv, cipher.getAuthTag(), body].map((part) => part.toString("base64")).join(".");
}

function decrypt(value) {
  if (typeof value !== "string" || !value.startsWith(PREFIX)) return value;
  const key = loadKey();
  if (!key) throw new Error("PII_ENCRYPTION_KEY is not set.");
  const [iv, tag, body] = value.slice(PREFIX.length).split(".").map((part) => Buffer.from(part, "base64"));
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
}

module.exports = { encrypt, decrypt, isEnabled };
