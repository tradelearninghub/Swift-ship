import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
}

/**
 * Retrieve SMTP configuration from database settings or environment variables
 */
export async function getSmtpConfig(): Promise<SmtpConfig> {
  let dbSmtp: any = null;
  try {
    const setting = await prisma.setting.findFirst({
      where: { key: "smtp" },
    });
    if (setting?.value && typeof setting.value === "object") {
      dbSmtp = setting.value;
    }
  } catch (err) {
    // Database might be unavailable
  }

  const host =
    dbSmtp?.host ||
    dbSmtp?.smtp_host ||
    process.env.SMTP_HOST ||
    "smtp.hostinger.com";

  const port = Number(
    dbSmtp?.port ||
    dbSmtp?.smtp_port ||
    process.env.SMTP_PORT ||
    465
  );

  const secure = port === 465;

  const user =
    dbSmtp?.user ||
    dbSmtp?.username ||
    dbSmtp?.smtp_user ||
    process.env.SMTP_USER ||
    process.env.SMTP_USERNAME ||
    "support@sscourierservice.in";

  const pass =
    dbSmtp?.pass ||
    dbSmtp?.password ||
    dbSmtp?.smtp_password ||
    process.env.SMTP_PASSWORD ||
    "";

  const fromEmail =
    dbSmtp?.from_email ||
    dbSmtp?.fromEmail ||
    process.env.SMTP_FROM ||
    user ||
    "support@sscourierservice.in";

  const fromName =
    dbSmtp?.from_name ||
    dbSmtp?.fromName ||
    process.env.SMTP_FROM_NAME ||
    "SS Courier service";

  return {
    host,
    port,
    secure,
    user,
    pass,
    fromEmail,
    fromName,
  };
}

/**
 * Create a configured nodemailer transporter
 */
export async function createMailTransporter() {
  const config = await getSmtpConfig();

  return {
    transporter: nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false, // Prevents self-signed cert blocks on custom mail hosts
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    }),
    config,
  };
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

/**
 * Dispatch real email via Nodemailer (§38)
 */
export async function sendRealEmail(options: SendEmailOptions) {
  try {
    const { transporter, config } = await createMailTransporter();

    const fromAddress = options.from || `"${config.fromName}" <${config.fromEmail}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      text: options.text || (options.html ? options.html.replace(/<[^>]+>/g, " ") : ""),
      html: options.html || `<p>${options.text || ""}</p>`,
    });

    console.log(`[SMTP-DISPATCH] Sent email to ${options.to}. MessageId: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error: any) {
    console.error(`[SMTP-ERROR] Failed to send email to ${options.to}:`, error.message);
    return {
      success: false,
      error: error.message || "Unknown SMTP dispatch error",
    };
  }
}

/**
 * Test SMTP sending to an admin-specified recipient address (§38 + New Feature)
 */
export async function sendTestEmail(recipientEmail: string) {
  const { transporter, config } = await createMailTransporter();

  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1e3a8a; padding: 20px; color: #ffffff; text-align: center;">
        <h1 style="margin: 0; font-size: 20px;">SS Courier service</h1>
        <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.85;">SMTP Integration & Mailer Test (§38)</p>
      </div>
      <div style="padding: 24px; color: #1e293b; line-height: 1.5;">
        <p style="font-size: 15px; font-weight: bold; color: #0f172a;">Hello,</p>
        <p>This is a real test email dispatched from your <strong>SS Courier service Management Console</strong>.</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 20px 0; font-size: 13px;">
          <p style="margin: 0 0 6px;"><strong>SMTP Host:</strong> ${config.host}:${config.port}</p>
          <p style="margin: 0 0 6px;"><strong>From Header:</strong> ${config.fromName} &lt;${config.fromEmail}&gt;</p>
          <p style="margin: 0 0 6px;"><strong>Target Recipient:</strong> ${recipientEmail}</p>
          <p style="margin: 0;"><strong>Timestamp:</strong> ${timestamp} (IST)</p>
        </div>

        <p style="color: #15803d; font-weight: bold;">
          ✅ If you received this email, your outgoing mail server configuration is fully functional.
        </p>
      </div>
      <div style="background-color: #f1f5f9; padding: 12px 20px; text-align: center; font-size: 11px; color: #64748b;">
        SS Courier service • Johri Bazar, Jaipur, Rajasthan 302003
      </div>
    </div>
  `;

  return sendRealEmail({
    to: recipientEmail,
    subject: `SMTP Test Verification — SS Courier service [${new Date().toLocaleTimeString()}]`,
    html,
  });
}
