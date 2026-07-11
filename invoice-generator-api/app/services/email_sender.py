import smtplib
from email.message import EmailMessage
from email.utils import formataddr

from app.config import settings


def send_invoice_email(
    recipient_email: str,
    subject: str,
    body: str,
    pdf_path: str,
) -> None:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = formataddr((settings.smtp_from_name, settings.smtp_from_email))
    msg["To"] = recipient_email
    msg.set_content(body)

    with open(pdf_path, "rb") as f:
        pdf_data = f.read()
    msg.add_attachment(pdf_data, maintype="application", subtype="pdf",
                       filename=pdf_path.split("/")[-1])

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
