const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

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
  submissions.push({
    id: crypto.randomUUID(),
    name: values.name,
    email: values.email,
    requestType: values.requestType,
    message: values.message,
    createdAt: new Date().toISOString()
  });

  const temporaryFile = submissionsFile + ".tmp";
  await fs.writeFile(temporaryFile, JSON.stringify(submissions, null, 2) + "\n", "utf8");
  await fs.rename(temporaryFile, submissionsFile);
}

module.exports = { saveContactSubmission };
