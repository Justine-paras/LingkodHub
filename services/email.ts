import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Email Service] EMAIL_USER or EMAIL_PASS not set. Logging email instead:');
    console.log(`[Email] To: ${to}\nSubject: ${subject}\nContent: ${html}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  const mailOptions = {
    from: `"LingkodHub Support" <${process.env.EMAIL_USER.trim()}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Email sent to ${to}`);
  } catch (error: any) {
    console.error('[Email Service] Error sending email:', error);
    console.warn(`[Email Service] FALLBACK: OTP for ${to} is being logged because email failed.`);
    console.log(`[OTP FALLBACK] To: ${to}\nSubject: ${subject}\nContent: ${html}`);
    // Don't re-throw here so the user can still proceed if they see the logs/db
  }
}

export async function sendOTPEmail(to: string, otp: string) {
  const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10b981; text-align: center;">LingkodHub</h2>
        <p>Hello,</p>
        <p>Your verification code for LingkodHub is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937; border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          &copy; 2024 LingkodHub. All rights reserved.
        </p>
      </div>
    `;

  await sendEmail({ to, subject: 'Your LingkodHub Verification Code', html });
}
