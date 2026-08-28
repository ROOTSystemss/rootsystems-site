const nodemailer = require("nodemailer");

const messageTypeLabels = {
  suggestion: "Product suggestion",
  recommendation: "Recommendation",
  "product-question": "Product question",
  other: "Other"
};

let transporter;

function requireEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for contact email delivery.`);
  return value;
}

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true").toLowerCase() === "true",
    auth: {
      user: requireEnvironment("SMTP_USER"),
      pass: requireEnvironment("SMTP_APP_PASSWORD")
    }
  });

  return transporter;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendContactEmail(values) {
  const smtpUser = requireEnvironment("SMTP_USER");
  const destination = process.env.CONTACT_TO_EMAIL || "therootsystems.ops@gmail.com";
  const sender = process.env.CONTACT_FROM_EMAIL || smtpUser;
  const typeLabel = messageTypeLabels[values.requestType] || "Contact message";
  const safeSubjectName = values.name.replace(/[\r\n]/g, " ");

  return getTransporter().sendMail({
    from: { name: "RootSystems website", address: sender },
    to: destination,
    replyTo: { name: values.name, address: values.email },
    subject: `[RootSystems] ${typeLabel} from ${safeSubjectName}`,
    text: [
      `New ${typeLabel.toLowerCase()} from the RootSystems website`,
      "",
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Type: ${typeLabel}`,
      "",
      values.message
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;color:#102340;line-height:1.6">
        <div style="border-top:6px solid #ff9933;padding:24px 0 8px">
          <p style="margin:0;color:#a75a08;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em">RootSystems website</p>
          <h1 style="margin:8px 0 20px;font-size:24px">New ${escapeHtml(typeLabel.toLowerCase())}</h1>
        </div>
        <table style="border-collapse:collapse;width:100%;margin-bottom:24px">
          <tr><td style="padding:8px 12px;background:#f5f7fa;font-weight:700;width:90px">Name</td><td style="padding:8px 12px;background:#f5f7fa">${escapeHtml(values.name)}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:700">Email</td><td style="padding:8px 12px"><a href="mailto:${escapeHtml(values.email)}">${escapeHtml(values.email)}</a></td></tr>
          <tr><td style="padding:8px 12px;background:#f5f7fa;font-weight:700">Type</td><td style="padding:8px 12px;background:#f5f7fa">${escapeHtml(typeLabel)}</td></tr>
        </table>
        <div style="white-space:pre-wrap;border-left:4px solid #ff9933;padding:4px 0 4px 18px">${escapeHtml(values.message)}</div>
        <p style="margin-top:28px;color:#65758b;font-size:12px">Reply to this email to respond directly to ${escapeHtml(values.name)}.</p>
      </div>
    `
  });
}

module.exports = { sendContactEmail };
