import nodemailer from 'nodemailer';

const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER);

const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string }) {
  if (!transporter) {
    // Dev fallback — log to console instead of sending
    console.log(`[EMAIL] To: ${opts.to} | Subject: ${opts.subject}`);
    return;
  }
  return transporter.sendMail({
    from: process.env.EMAIL_FROM ?? 'noreply@utthunga.com',
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}
