const nodemailer = require("nodemailer");

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransport() {
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

  return nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  family: 4
});
}

async function sendOtpEmail({ to, code }) {

  try {
  if (!smtpConfigured()) {
    // eslint-disable-next-line no-console
    console.log(`[DEV OTP] Email to ${to}: ${code}`);
    return;
  }

  const transport = getTransport();
  const from = process.env.SMTP_FROM || "no-reply@hirehelper.local";

  const info = await transport.sendMail({
    from,
    to,
    subject: "Your HireHelper verification code",
    text: `Your verification code is: ${code}`,
  });
    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.log("❌ EMAIL ERROR:", err);
    throw err; 
  }
}

module.exports = { sendOtpEmail };

