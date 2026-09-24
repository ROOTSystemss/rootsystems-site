const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const { encrypt, isEnabled } = require("../utils/piiCrypto");

// Contact messages only need to exist until someone replies. Records older than
// this are dropped whenever a new submission is saved.
const RETENTION_DAYS = 90;

const dataDirectory = path.join(__dirname, "..", "..", "data");
const submissionsFile = path.join(dataDirectory, "contact-submissions.json");

async function readSubmissions() {
  try {
    const contents = await fs.readFile(submissionsFile, "utf8");
    const parsed = JSON.parse(contents);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function saveContactSubmission(values) {
  await fs.mkdir(dataDirectory, { recursive: true });
  const submissions = await readSubmissions();
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const kept = submissions.filter((entry) => !(Date.parse(entry.createdAt) < cutoff));
  submissions.length = 0;
  submissions.push(...kept);

  const record = { id: crypto.randomUUID(), requestType: values.requestType, createdAt: new Date().toISOString() };
  if (isEnabled()) {
    record.encrypted = encrypt(JSON.stringify({ name: values.name, email: values.email, message: values.message }));
  } else if (process.env.NODE_ENV === "production") {
    // Never write personal data unencrypted in production.
    throw new Error("PII_ENCRYPTION_KEY is required to store contact submissions in production.");
  } else {
    console.warn("[contact] PII_ENCRYPTION_KEY not set; storing this submission unencrypted (non-production only).");
    Object.assign(record, { name: values.name, email: values.email, message: values.message });
  }
  submissions.push(record);

  const temporaryFile = submissionsFile + ".tmp";
  await fs.writeFile(temporaryFile, JSON.stringify(submissions, null, 2) + "\n", "utf8");
  await fs.rename(temporaryFile, submissionsFile);
}

// Drop submissions past the retention window. Also runs at startup and daily (see server.js),
// so old messages are removed even when nobody submits a new one. Returns how many were removed.
async function purgeExpiredSubmissions() {
  const submissions = await readSubmissions();
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const kept = submissions.filter((entry) => !(Date.parse(entry.createdAt) < cutoff));
  const removed = submissions.length - kept.length;
  if (removed > 0) {
    const temporaryFile = submissionsFile + ".tmp";
    await fs.writeFile(temporaryFile, JSON.stringify(kept, null, 2) + "\n", "utf8");
    await fs.rename(temporaryFile, submissionsFile);
  }
  return removed;
}

module.exports = { saveContactSubmission, purgeExpiredSubmissions };
