# Colon Byte — Lead Generation Tool (Phase 1)

A premium lead generation tool that scrapes business leads from Google Maps, extracts emails from business websites, and manages them in a dark-themed dashboard.

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally or a remote MongoDB URI

### Server

```bash
cd server
cp .env.example .env
# Edit .env if needed (default: port 5000, local MongoDB)
npm install
npx playwright install chromium
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:3000` and proxies `/api` requests to the server on port 5000.

## How to Use

1. Open the Dashboard.
2. Click **Start New Scrape**.
3. Enter a keyword like `restaurants in Dubai` or `plumbers in London`.
4. Watch live progress as leads are scraped.
5. View all leads on the **Leads** page.
6. Filter by country or status, search by name/keyword.
7. Change lead status (contacted/converted) or delete leads.
8. Export all leads as CSV from the Leads page.

## Adding Keywords

Simply enter any Google Maps search term in the Scrape Modal. Examples:
- `cafes in Paris`
- `dentists in New York`
- `real estate agents in Dubai`
- `fitness centers in London`

## Project Structure

```
server/
  index.js                 — Express server entry point
  routes/
    scrape.js              — POST /api/scrape/start + SSE
    leads.js               — GET/PATCH/DELETE /api/leads
  services/
    googleMapsScraper.js   — Playwright headless scraper
    emailExtractor.js      — Axios + Cheerio email extraction
  models/
    Lead.js                — Mongoose schema

client/
  src/
    App.jsx                — Router + layout
    pages/
      Dashboard.jsx         — Stats + recent leads + scrape trigger
      Leads.jsx             — Full table + filters + export
    components/
      Sidebar.jsx           — Fixed nav with DA monogram
      StatCard.jsx          — Animated count-up card
      StatusBadge.jsx       — Pill badge (new/contacted/converted)
      ScrapeModal.jsx       — Keyword input + live progress
      ProgressFeed.jsx      — Animated progress bar + status
      LeadsTable.jsx        — Staggered table with actions
    index.css               — Tailwind + custom scrollbar + focus ring
```

## Tech Stack

- **Backend:** Node.js, Express, MongoDB/Mongoose, Playwright, Cheerio, Axios, json2csv
- **Frontend:** React, React Router, Tailwind CSS, Framer Motion
- **Font:** Inter (Google Fonts)
