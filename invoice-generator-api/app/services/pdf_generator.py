import os
from decimal import Decimal
from typing import BinaryIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
)

from app.config import settings
from app.models.schemas import InvoiceRequest

STYLES = getSampleStyleSheet()

PAGE_W = A4[0]
PAGE_H = A4[1]
MARGIN = 20 * mm
USABLE = PAGE_W - 2 * MARGIN


def _build_header(items: list) -> None:
    styles = STYLES
    items.append(Paragraph("<b>INVOICE</b>", styles["Heading1"]))
    items.append(Spacer(1, 6 * mm))


def _build_business_info(items: list, info: dict, label: str) -> None:
    styles = STYLES
    t = Table(
        [
            [Paragraph(f"<b>{label}</b>", styles["Heading6"])],
            [Paragraph(info["name"], styles["Normal"])],
            [Paragraph(info["address"], styles["Normal"])],
            [Paragraph(info["phone"], styles["Normal"])],
            [Paragraph(info["email"], styles["Normal"])],
        ],
        colWidths=[USABLE / 2],
    )
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ]))
    items.append(t)


def _build_addresses(items: list, invoice: InvoiceRequest) -> None:
    left = []
    _build_business_info(left, invoice.from_info.model_dump(), "From")
    right = []
    _build_business_info(right, invoice.to_info.model_dump(), "To")

    t = Table([[left, right]], colWidths=[USABLE / 2, USABLE / 2])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    items.append(t)
    items.append(Spacer(1, 4 * mm))


def _build_meta(items: list, invoice: InvoiceRequest) -> None:
    styles = STYLES
    data = [
        ["Invoice #:", invoice.invoice_number],
        ["Issue Date:", invoice.issue_date.isoformat()],
        ["Due Date:", invoice.due_date.isoformat()],
    ]
    t = Table(data, colWidths=[30 * mm, 50 * mm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ]))
    items.append(t)
    items.append(Spacer(1, 6 * mm))


def _build_line_items(items: list, invoice: InvoiceRequest) -> None:
    styles = STYLES
    header = ["#", "Description", "Qty", "Unit Price", "Amount"]
    data = [header]

    for i, line in enumerate(invoice.items, 1):
        qty = line.quantity
        up = float(line.unit_price)
        amt = qty * up
        data.append([
            str(i),
            Paragraph(line.description, styles["Normal"]),
            str(qty),
            f"{invoice.currency} {up:,.2f}",
            f"{invoice.currency} {amt:,.2f}",
        ])

    subtotal = float(sum(it.quantity * float(it.unit_price) for it in invoice.items))
    tax_amount = subtotal * float(invoice.tax_rate) / 100
    discount_amount = float(invoice.discount)
    grand_total = subtotal + tax_amount - discount_amount

    data.append(["", "", "", "", ""])
    data.append(["", "", "", "Subtotal:", f"{invoice.currency} {subtotal:,.2f}"])
    if float(invoice.tax_rate) > 0:
        data.append(["", "", "", f"Tax ({invoice.tax_rate}%):", f"{invoice.currency} {tax_amount:,.2f}"])
    if discount_amount > 0:
        data.append(["", "", "", "Discount:", f"- {invoice.currency} {discount_amount:,.2f}"])
    data.append(["", "", "", "Total:", f"{invoice.currency} {grand_total:,.2f}"])

    col_w = [10 * mm, USABLE - 130 * mm, 20 * mm, 40 * mm, 40 * mm]
    t = Table(data, colWidths=col_w)
    style_cmds = [
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563eb")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
        ("FONTNAME", (-2, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (-2, -1), (-1, -1), 12),
        ("LINEBELOW", (0, 0), (-1, 0), 1, colors.HexColor("#2563eb")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -4), 0.5, colors.HexColor("#d1d5db")),
    ]
    t.setStyle(TableStyle(style_cmds))
    items.append(t)
    items.append(Spacer(1, 4 * mm))


def _build_notes(items: list, invoice: InvoiceRequest) -> None:
    if not invoice.notes:
        return
    styles = STYLES
    items.append(Paragraph("<b>Notes:</b>", styles["Heading6"]))
    items.append(Paragraph(invoice.notes, styles["Normal"]))


def generate_invoice(invoice: InvoiceRequest) -> str:
    filename = f"{invoice.invoice_number}.pdf"
    filepath = os.path.join(settings.output_dir, filename)
    os.makedirs(settings.output_dir, exist_ok=True)

    doc = SimpleDocTemplate(filepath, pagesize=A4,
                            leftMargin=MARGIN, rightMargin=MARGIN,
                            topMargin=MARGIN, bottomMargin=MARGIN)
    story = []
    _build_header(story)
    _build_meta(story, invoice)
    _build_addresses(story, invoice)
    _build_line_items(story, invoice)
    _build_notes(story, invoice)
    doc.build(story)
    return filepath
