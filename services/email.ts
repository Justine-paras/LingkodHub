import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Email Service] EMAIL_USER or EMAIL_PASS not set. Logging email instead:');
    console.log(`[Email] To: ${to}\nSubject: ${subject}\nContent: ${html}`);
    return;
  }

  const mailOptions = {
    from: `"LingkodHub Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Email sent to ${to}`);
  } catch (error: any) {
    console.error('[Email Service] Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
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
