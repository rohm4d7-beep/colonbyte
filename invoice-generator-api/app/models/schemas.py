from datetime import date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from decimal import Decimal


class AddressInfo(BaseModel):
    name: str
    email: EmailStr
    address: str
    phone: str = ""


class InvoiceItem(BaseModel):
    description: str
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(gt=0)


class InvoiceRequest(BaseModel):
    invoice_number: str
    issue_date: date
    due_date: date
    from_info: AddressInfo = Field(alias="from")
    to_info: AddressInfo = Field(alias="to")
    items: list[InvoiceItem] = Field(min_length=1)
    tax_rate: Decimal = Field(default=Decimal("0"), ge=0, le=100)
    discount: Decimal = Field(default=Decimal("0"), ge=0)
    currency: str = "USD"
    notes: str = ""


class SendInvoiceRequest(InvoiceRequest):
    recipient_email: EmailStr
    subject: str = "Your Invoice"
    body: str = "Please find your invoice attached."


class InvoiceResponse(BaseModel):
    invoice_number: str
    message: str
    file_path: Optional[str] = None
    total: Decimal
