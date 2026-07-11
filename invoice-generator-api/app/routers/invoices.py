from decimal import Decimal

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    InvoiceRequest, InvoiceResponse, SendInvoiceRequest,
)
from app.services.pdf_generator import generate_invoice
from app.services.email_sender import send_invoice_email

router = APIRouter(prefix="/api/invoices", tags=["invoices"])


def _compute_total(invoice: InvoiceRequest) -> Decimal:
    subtotal = sum(
        Decimal(str(it.quantity)) * it.unit_price
        for it in invoice.items
    )
    tax = subtotal * invoice.tax_rate / Decimal("100")
    return subtotal + tax - invoice.discount


@router.post("/generate", response_model=InvoiceResponse)
def generate(invoice: InvoiceRequest):
    try:
        path = generate_invoice(invoice)
    except Exception as e:
        raise HTTPException(500, f"PDF generation failed: {e}")
    return InvoiceResponse(
        invoice_number=invoice.invoice_number,
        message="Invoice generated successfully",
        file_path=path,
        total=_compute_total(invoice),
    )


@router.post("/send", response_model=InvoiceResponse)
def generate_and_send(req: SendInvoiceRequest):
    try:
        path = generate_invoice(req)
    except Exception as e:
        raise HTTPException(500, f"PDF generation failed: {e}")

    try:
        send_invoice_email(req.recipient_email, req.subject, req.body, path)
    except Exception as e:
        raise HTTPException(500, f"Email sending failed: {e}")

    return InvoiceResponse(
        invoice_number=req.invoice_number,
        message="Invoice generated and sent successfully",
        file_path=path,
        total=_compute_total(req),
    )
