import nodemailer from "nodemailer";

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function buildHtmlBody(data) {
  const total = data.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxAmt = total * (data.tax / 100);
  const discAmt = total * (data.discount / 100);
  const grandTotal = total + taxAmt - discAmt;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;padding:40px;">
  <div style="max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.08);">
    <div style="background:#2563eb;padding:24px;color:#fff;">
      <h2 style="margin:0;">Invoice ${data.invoiceNumber}</h2>
      <p style="margin:4px 0 0;opacity:.85;">${data.date}</p>
    </div>
    <div style="padding:24px;">
      <p style="color:#374151;">Hi <strong>${data.to.name}</strong>,</p>
      <p style="color:#374151;">Please find your invoice attached. Here's a quick summary:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr style="background:#f3f4f6;">
          <th style="text-align:left;padding:8px;font-size:12px;">Description</th>
          <th style="text-align:center;padding:8px;font-size:12px;">Qty</th>
          <th style="text-align:right;padding:8px;font-size:12px;">Amount</th>
        </tr>
        ${data.items.map(i => `
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px;font-size:13px;">${i.description}</td>
            <td style="text-align:center;padding:8px;font-size:13px;">${i.quantity}</td>
            <td style="text-align:right;padding:8px;font-size:13px;">${data.currency} ${(i.quantity * i.unitPrice).toFixed(2)}</td>
          </tr>
        `).join("")}
      </table>
      <div style="text-align:right;border-top:2px solid #2563eb;padding-top:8px;">
        <p style="margin:2px;"><strong>Total:</strong> ${data.currency} ${grandTotal.toFixed(2)}</p>
      </div>
      <p style="color:#6b7280;font-size:12px;margin-top:16px;">Due: ${data.dueDate}</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendInvoiceEmail(data, pdfBuffer) {
  const transporter = createTransport();
  const fromName = process.env.FROM_NAME || "DevsAura Billing";
  const fromEmail = process.env.FROM_EMAIL;

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: data.recipientEmail,
    subject: `Invoice ${data.invoiceNumber} from ${fromName}`,
    html: buildHtmlBody(data),
    attachments: [
      {
        filename: `invoice-${data.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  return info;
}
