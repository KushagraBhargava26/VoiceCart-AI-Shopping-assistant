import nodemailer from "nodemailer";

/**
 * Create SMTP Transporter.
 * Uses environment variables EMAIL_USER and EMAIL_PASS (or Gmail App Password),
 * with fallback to Ethereal / test SMTP.
 */
async function getTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback Ethereal Transporter for instant real testing without extra setup
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

/**
 * Send Password Reset OTP Email
 */
export async function sendPasswordResetEmail({ toEmail, otp, name }) {
  try {
    const transporter = await getTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .card { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
          .logo { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: bold; color: #2dd4bf; margin-bottom: 24px; }
          .otp-badge { background: linear-gradient(135deg, #14b8a6, #a855f7); color: #0f172a; font-size: 32px; font-weight: 800; letter-spacing: 6px; padding: 16px; text-align: center; border-radius: 12px; margin: 24px 0; }
          .footer { font-size: 11px; color: #94a3b8; margin-top: 32px; text-align: center; border-top: 1px solid #334155; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">🛒 VoiceCart AI</div>
          <h2 style="margin-top:0; color:#f8fafc;">Reset Your Password</h2>
          <p style="color:#cbd5e1; font-size:14px; line-height:1.6;">
            Hello <strong>${name || "VoiceCart User"}</strong>,<br>
            You requested a password reset for your VoiceCart account (${toEmail}). Use the 6-digit verification code below to reset your password:
          </p>
          
          <div class="otp-badge">${otp}</div>

          <p style="color:#94a3b8; font-size:12px;">
            This verification code is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email.
          </p>

          <div class="footer">
            © 2026 VoiceCart AI Shopping Assistant. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"VoiceCart AI" <${process.env.EMAIL_USER || "noreply@voicecart.ai"}>`,
      to: toEmail,
      subject: `🔐 VoiceCart Password Reset Verification Code: ${otp}`,
      html: htmlContent,
    });

    console.log(`[EMAIL SENT] Password reset code sent to ${toEmail}: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[EMAIL PREVIEW LINK] View sent email online: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send email to ${toEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}
