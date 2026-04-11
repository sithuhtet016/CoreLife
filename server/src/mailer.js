import dotenv from "dotenv";

dotenv.config();

const MAILTRAP_API_URL = "https://send.api.mailtrap.io/api/send";

const mailtrapToken = process.env.MAILTRAP_TOKEN?.trim();
const mailtrapFromEmail = process.env.MAILTRAP_FROM_EMAIL?.trim();
const mailtrapFromName = process.env.MAILTRAP_FROM_NAME?.trim() || "CoreLife";

const appBaseUrl = (
  process.env.APP_BASE_URL?.trim() || "http://localhost:5173"
).replace(/\/+$/, "");

export const isMailtrapConfigured = Boolean(mailtrapToken && mailtrapFromEmail);

function normalizeEmail(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!normalized.includes("@")) return null;
  return normalized;
}

export async function sendMailtrapEmail({ to, subject, text, html, category }) {
  if (!isMailtrapConfigured) {
    throw new Error(
      "Mailtrap is not configured. Set MAILTRAP_TOKEN and MAILTRAP_FROM_EMAIL.",
    );
  }

  const recipients = (Array.isArray(to) ? to : [to])
    .map((recipient) => normalizeEmail(recipient))
    .filter(Boolean)
    .map((email) => ({ email }));

  if (recipients.length === 0) {
    throw new Error("At least one valid recipient email is required");
  }

  const normalizedSubject = String(subject ?? "").trim();
  if (!normalizedSubject) {
    throw new Error("Email subject is required");
  }

  const normalizedText = String(text ?? "").trim();
  const normalizedHtml = String(html ?? "").trim();

  if (!normalizedText && !normalizedHtml) {
    throw new Error("Email body requires text or html content");
  }

  const payload = {
    from: {
      email: mailtrapFromEmail,
      name: mailtrapFromName,
    },
    to: recipients,
    subject: normalizedSubject,
    ...(normalizedText ? { text: normalizedText } : {}),
    ...(normalizedHtml ? { html: normalizedHtml } : {}),
    ...(category ? { category: String(category) } : {}),
  };

  const response = await fetch(MAILTRAP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mailtrapToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(
      `Mailtrap request failed (${response.status}): ${responseBody || response.statusText}`,
    );
  }
}

export async function sendWelcomeEmail({ toEmail, fullName }) {
  const safeName = String(fullName ?? "").trim() || "there";
  const dashboardUrl = `${appBaseUrl}/dashboard`;
  const assessmentUrl = `${appBaseUrl}/assessment`;

  return sendMailtrapEmail({
    to: toEmail,
    subject: "Welcome to CoreLife",
    text: [
      `Hi ${safeName},`,
      "",
      "Welcome to CoreLife. Your account is ready.",
      "",
      `Start here: ${assessmentUrl}`,
      `Dashboard: ${dashboardUrl}`,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h2 style="margin-bottom: 8px;">Welcome to CoreLife</h2>
        <p>Hi ${safeName},</p>
        <p>Your account is ready. Start with your first assessment and begin tracking your progress.</p>
        <p>
          <a href="${assessmentUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:999px;">Start Assessment</a>
        </p>
        <p>Or open your <a href="${dashboardUrl}">dashboard</a>.</p>
      </div>
    `,
    category: "welcome-email",
  });
}
