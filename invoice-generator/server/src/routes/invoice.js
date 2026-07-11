import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { generateInvoicePDF } from "../services/pdfGenerator.js";
import { sendInvoiceEmail } from "../services/emailService.js";

const router = Router();

// In-memory store for last 10 invoices
const invoiceCache = new Map();
const CACHE_LIMIT = 10;

function validateInvoice(body) {
  const errors = [];
  if (!body.invoiceNumber) errors.push("invoiceNumber is required");
  if (!body.date) errors.push("date is required");
  if (!body.dueDate) errors.push("dueDate is required");
  if (!body.from?.name) errors.push("from.name is required");
  if (!body.from?.email) errors.push("from.email is required");
  if (!body.to?.name) errors.push("to.name is required");
  if (!body.to?.email) errors.push("to.email is required");
  if (!body.items?.length) errors.push("At least one item is required");
  return errors;
}

function storeInvoice(id, data) {
  if (invoiceCache.size >= CACHE_LIMIT) {
    const firstKey = invoiceCache.keys().next().value;
    invoiceCache.delete(firstKey);
  }
  invoiceCache.set(id, data);
}

// POST /api/invoice/generate
router.post("/generate", async (req, res, next) => {
  try {
    const errors = validateInvoice(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });

    const pdfBuffer = await generateInvoicePDF(req.body);
    const id = uuidv4();
    storeInvoice(id, { data: req.body, pdf: pdfBuffer });

    res.json({
      success: true,
      id,
      invoiceNumber: req.body.invoiceNumber,
      pdf: pdfBuffer.toString("base64"),
      message: "Invoice generated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/invoice/send
router.post("/send", async (req, res, next) => {
  try {
    const errors = validateInvoice(req.body);
    if (!req.body.recipientEmail) errors.push("recipientEmail is required");
    if (errors.length) return res.status(400).json({ success: false, errors });

    const pdfBuffer = await generateInvoicePDF(req.body);
    const id = uuidv4();
    storeInvoice(id, { data: req.body, pdf: pdfBuffer });

    await sendInvoiceEmail(req.body, pdfBuffer);

    res.json({
      success: true,
      id,
      invoiceNumber: req.body.invoiceNumber,
      message: "Invoice sent successfully",
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/invoice/preview/:id
router.get("/preview/:id", (req, res, next) => {
  try {
    const record = invoiceCache.get(req.params.id);
    if (!record) return res.status(404).json({ success: false, error: "Invoice not found" });
    res.json({
      success: true,
      data: record.data,
      pdf: record.pdf.toString("base64"),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
