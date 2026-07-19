import nodemailer from "nodemailer";
import { Resend } from "resend";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (host) {
    return nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "");
}

const fromName = "Lumiere Jewelry";

interface SendOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail(options: SendOptions) {
  const smtp = getTransporter();
  if (smtp) {
    const from = process.env.SMTP_FROM || "noreply@lumiere-jewelry.com";
    await smtp.sendMail({
      from: `"${fromName}" <${from}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } else {
    const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    await getResend().emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}
