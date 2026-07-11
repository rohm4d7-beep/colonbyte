# DevsAura — Invoice Generator API + UI

A full-stack invoice generator built with **Node.js + Express** (backend) and **React + Vite + Tailwind CSS** (frontend). Generate professional PDF invoices and send them via email.

---

## Project Structure

```
invoice-generator/
├── server/                # Express REST API
│   └── src/
│       ├── index.js           # App entry, CORS, middleware
│       ├── routes/invoice.js  # /generate, /send, /preview/:id
│       ├── services/
│       │   ├── pdfGenerator.js  # pdfkit — professional invoice PDF
│       │   └── emailService.js  # nodemailer — HTML email + PDF attachment
│       └── middleware/errorHandler.js
├── client/                # React SPA
│   └── src/
│       ├── App.jsx              # Layout (form + preview)
│       ├── components/
│       │   ├── InvoiceForm.jsx     # All invoice fields, dynamic items
│       │   ├── InvoicePreview.jsx  # Live preview card
│       │   ├── LineItems.jsx       # Add/remove line items
│       │   ├── EmailModal.jsx      # Email recipient input
│       │   ├── ThemeToggle.jsx     # Dark / Light / Default
│       │   └── Header.jsx
│       ├── context/ThemeContext.jsx
│       └── hooks/useInvoice.js     # Form state + real-time totals
└── README.md
```

---

## Setup

### Prerequisites

- **Node.js >= 18**
- **npm >= 9**

### 1. Server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Server starts on **http://localhost:5000**.

### 2. Client

```bash
cd client
npm install
npm run dev
```

Client starts on **http://localhost:3000** and proxies `/api` requests to the server.

---

## Environment Variables

Edit `server/.env`:

| Variable      | Description                        | Default              |
| ------------- | ---------------------------------- | -------------------- |
| `PORT`        | Server port                        | `5000`               |
| `SMTP_HOST`   | SMTP server host                   | `smtp.gmail.com`     |
| `SMTP_PORT`   | SMTP server port                   | `587`                |
| `SMTP_USER`   | SMTP username / email              | —                    |
| `SMTP_PASS`   | SMTP password / app password       | —                    |
| `FROM_EMAIL`  | Sender email address               | —                    |
| `FROM_NAME`   | Sender display name                | `DevsAura Billing`   |

> For Gmail, generate an [App Password](https://support.google.com/accounts/answer/185833) and use it as `SMTP_PASS`.

---

## API Reference

### POST /api/invoice/generate

Generate a PDF invoice and return it as base64.

**Request body:**

```json
{
  "invoiceNumber": "INV-001",
  "date": "2026-06-05",
  "dueDate": "2026-07-05",
  "currency": "USD",
  "from": {
    "name": "DevsAura",
    "email": "hello@devsaura.com",
    "address": "123 AI Street, Tech City",
    "phone": "+1-555-0001"
  },
  "to": {
    "name": "Client Inc.",
    "email": "client@example.com",
    "address": "456 Client Ave",
    "phone": "+1-555-0002"
  },
  "items": [
    { "description": "AI Chatbot", "quantity": 1, "unitPrice": 5000 },
    { "description": "Website",     "quantity": 1, "unitPrice": 3000 }
  ],
  "tax": 10,
  "discount": 5,
  "notes": "Payment due within 30 days."
}
```

**Response (200):**

```json
{
  "success": true,
  "id": "uuid",
  "invoiceNumber": "INV-001",
  "pdf": "<base64-encoded-pdf>",
  "message": "Invoice generated successfully"
}
```

### POST /api/invoice/send

Generate a PDF invoice and email it as an attachment.

Accepts the same body as `/generate` plus:

| Field            | Type   | Description                |
| ---------------- | ------ | -------------------------- |
| `recipientEmail` | string | Recipient email address    |

**Response (200):**

```json
{
  "success": true,
  "id": "uuid",
  "invoiceNumber": "INV-001",
  "message": "Invoice sent successfully"
}
```

### GET /api/invoice/preview/:id

Retrieve a previously generated invoice (last 10 stored in memory).

**Response (200):**

```json
{
  "success": true,
  "data": { ... },
  "pdf": "<base64-encoded-pdf>"
}
```

### GET /health

Health check.

```json
{ "status": "ok" }
```

---

## Themes

Toggle between three themes using the button in the top-right corner:

- **🎨 Default** — indigo/violet gradient background with purple accents
- **☀️ Light** — clean white background
- **🌑 Dark** — dark gray background with light text

Theme preference is persisted in `localStorage`.

---

## Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Backend  | Node.js, Express, pdfkit, nodemailer    |
| Frontend | React 18, Vite, Tailwind CSS 3          |
| Other    | Axios, react-hot-toast                  |
