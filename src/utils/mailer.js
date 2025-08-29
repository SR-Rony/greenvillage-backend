import nodemailer from "nodemailer";

export async function sendMail({ to, subject, text, html }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.log("\n[DEV-EMAIL] Subject:", subject);
    console.log("[DEV-EMAIL] To:", to);
    console.log("[DEV-EMAIL] Text:", text);
    if (html) console.log("[DEV-EMAIL] HTML:", html);
    return { mocked: true };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  const info = await transporter.sendMail({
    from: `Greenvillage <${SMTP_USER}>`,
    to,
    subject,
    text,
    html
  });

  return info;
}