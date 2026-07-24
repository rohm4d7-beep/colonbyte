import nodemailer from "nodemailer";

export async function sendAutoReplyEmail(
  toEmail: string,
  toName: string,
  service: string
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thanks for contacting DevsAura!</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);border-radius:16px;overflow:hidden;border:1px solid rgba(99,102,241,0.2);">
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 30px;text-align:center;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.15));">
              <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px;font-weight:800;letter-spacing:-0.5px;">DevsAura</div>
              <p style="color:#94a3b8;margin:8px 0 0;font-size:14px;letter-spacing:2px;text-transform:uppercase;">Digital Excellence</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="color:#f1f5f9;font-size:24px;font-weight:700;margin:0 0 16px;">Hey ${toName}! 👋</h1>
              <p style="color:#94a3b8;font-size:16px;line-height:1.7;margin:0 0 20px;">
                Thank you for reaching out to <strong style="color:#a5b4fc;">DevsAura</strong>. We've received your request and our team is excited to connect with you!
              </p>
              <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:20px;margin:24px 0;">
                <p style="color:#94a3b8;font-size:14px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Your Inquiry</p>
                <p style="color:#e2e8f0;font-size:18px;font-weight:600;margin:0;">🚀 ${service}</p>
              </div>
              <p style="color:#94a3b8;font-size:16px;line-height:1.7;margin:0 0 20px;">
                Our team will review your requirements carefully and get back to you within <strong style="color:#a5b4fc;">24 hours</strong>. We're committed to providing you with the best digital solutions tailored to your needs.
              </p>
              <p style="color:#94a3b8;font-size:16px;line-height:1.7;margin:0 0 32px;">
                In the meantime, feel free to explore our work and learn more about how we've helped businesses like yours grow digitally.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);border-radius:8px;padding:14px 32px;">
                  <span style="color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">We'll be in touch soon! ✨</span>
                </div>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(99,102,241,0.15);text-align:center;">
              <p style="color:#475569;font-size:13px;margin:0 0 8px;">
                This is an automated response. Please do not reply to this email.
              </p>
              <p style="color:#334155;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} DevsAura. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"DevsAura" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Thanks for contacting DevsAura! 🚀",
    html,
  });
}
