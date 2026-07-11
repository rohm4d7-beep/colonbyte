import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = join(__dirname, "logo.png");

const primary = "#2563eb";
const grayLight = "#f3f4f6";
const grayBorder = "#d1d5db";
const grayText = "#6b7280";

export function generateInvoicePDF(data) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const buffers = [];
  doc.on("data", (chunk) => buffers.push(chunk));

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const pageW = doc.page.width - 100;
    let y = 50;

    // --- Logo ---
    doc.image(LOGO_PATH, 50, y, { width: 60, height: 60 });

    // --- Invoice title ---
    doc.fill(primary).fontSize(28).font("Helvetica-Bold")
      .text("INVOICE", pageW - 150, y, { width: 150, align: "right" });
    y += 70;

    // --- Invoice meta ---
    const meta = [
      { label: "Invoice #", value: data.invoiceNumber },
      { label: "Date", value: data.date },
      { label: "Due Date", value: data.dueDate },
    ];
    doc.fontSize(9).font("Helvetica-Bold");
    let mx = pageW - 150;
    meta.forEach((m) => {
      doc.fill(grayText).font("Helvetica").text(m.label, mx, y, { width: 60 });
      doc.fill("#111827").font("Helvetica-Bold").text(m.value, mx + 55, y, { width: 95 });
      y += 14;
    });
    y += 10;

    // --- Divider ---
    doc.moveTo(50, y).lineTo(545, y).stroke(grayBorder);
    y += 20;

    // --- From / To ---
    const colW = (pageW - 20) / 2;
    const renderAddr = (x, label, addr, color = primary) => {
      doc.fill(color).fontSize(11).font("Helvetica-Bold").text(label, x, y);
      doc.fill("#111827").fontSize(9).font("Helvetica");
      [addr.name, addr.address, addr.phone, addr.email].forEach((line) => {
        doc.text(line, x, doc.y + 4);
      });
    };
    renderAddr(50, "FROM", data.from);
    renderAddr(50 + colW + 20, "TO", data.to);
    y = Math.max(doc.y, y + 80) + 10;

    // --- Divider ---
    doc.moveTo(50, y).lineTo(545, y).stroke(grayBorder);
    y += 15;

    // --- Items table header ---
    const cols = [
      { x: 50, w: 20, label: "#", align: "left" },
      { x: 70, w: 220, label: "DESCRIPTION", align: "left" },
      { x: 290, w: 60, label: "QTY", align: "center" },
      { x: 350, w: 80, label: "UNIT PRICE", align: "right" },
      { x: 430, w: 115, label: "AMOUNT", align: "right" },
    ];
    doc.rect(50, y, 495, 22).fill(primary);
    cols.forEach((c) => {
      doc.fill("#fff").fontSize(9).font("Helvetica-Bold")
        .text(c.label, c.x, y + 5, { width: c.w, align: c.align });
    });
    y += 22;

    // --- Items ---
    let total = 0;
    data.items.forEach((item, i) => {
      const amt = item.quantity * item.unitPrice;
      total += amt;
      if (i % 2 === 0) doc.rect(50, y, 495, 20).fill(grayLight);
      const vals = [
        { x: 50, w: 20, v: String(i + 1), align: "left" },
        { x: 70, w: 220, v: item.description, align: "left" },
        { x: 290, w: 60, v: String(item.quantity), align: "center" },
        { x: 350, w: 80, v: `${data.currency} ${item.unitPrice.toFixed(2)}`, align: "right" },
        { x: 430, w: 115, v: `${data.currency} ${amt.toFixed(2)}`, align: "right" },
      ];
      vals.forEach((c) => {
        doc.fill("#111827").fontSize(9).font("Helvetica")
          .text(c.v, c.x, y + 5, { width: c.w, align: c.align });
      });
      y += 20;
    });

    // --- Totals ---
    y += 5;
    const taxAmt = total * (data.tax / 100);
    const discAmt = total * (data.discount / 100);
    const grandTotal = total + taxAmt - discAmt;

    const totals = [
      { label: "Subtotal", value: total },
    ];
    if (data.tax > 0) totals.push({ label: `Tax (${data.tax}%)`, value: taxAmt });
    if (data.discount > 0) totals.push({ label: `Discount (${data.discount}%)`, value: -discAmt });
    totals.push({ label: "Total", value: grandTotal, bold: true });

    const tx = 430;
    const tw = 115;
    totals.forEach((t) => {
      doc.fill(t.bold ? primary : "#111827")
        .fontSize(t.bold ? 12 : 10)
        .font(t.bold ? "Helvetica-Bold" : "Helvetica")
        .text(t.label, tx - 60, y, { width: 70, align: "right" });
      doc.fill(t.bold ? primary : "#111827")
        .fontSize(t.bold ? 12 : 10)
        .font(t.bold ? "Helvetica-Bold" : "Helvetica")
        .text(`${data.currency} ${Math.abs(t.value).toFixed(2)}`, tx, y, { width: tw, align: "right" });
      y += t.bold ? 22 : 16;
    });
    y += 10;

    // --- Notes ---
    if (data.notes) {
      doc.moveTo(50, y).lineTo(545, y).stroke(grayBorder);
      y += 12;
      doc.fill(primary).fontSize(10).font("Helvetica-Bold").text("NOTES", 50, y);
      doc.fill(grayText).fontSize(9).font("Helvetica").text(data.notes, 50, y + 14, {
        width: pageW,
      });
    }

    doc.end();
  });
}
