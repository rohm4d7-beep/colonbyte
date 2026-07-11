from fastapi import FastAPI
from app.routers.invoices import router as invoice_router

app = FastAPI(
    title="DevsAura Invoice Generator",
    description="Generate PDF invoices from JSON data and send via email",
    version="1.0.0",
)

app.include_router(invoice_router)


@app.get("/health")
def health():
    return {"status": "ok"}
