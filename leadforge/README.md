# Colon Byte — AI Website Agency Platform

Scrapes business leads from Google Maps with multi-signal country verification and dedup, detects website quality/opportunity, runs an AI business analysis on high-priority leads, and manages everything in a light/dark dashboard.

This is the frontend (`leadforge/`). The backend lives in the sibling directory `../server`.

## Setup

The whole stack (Mongo + server + this client) is defined in `../docker-compose.yml` and is the recommended way to run it:

```bash
cd ..                     # repo root, where docker-compose.yml lives
cp server/.env.example server/.env
# fill in server/.env — see "Environment variables" below
docker compose up -d --build
```

The client is served at `http://localhost:3002`, proxying `/api` to the server container.

### Running without Docker

```bash
# Server
cd ../server
cp .env.example .env      # fill in values, see below
npm install
npx playwright install chromium
npm run dev                # http://localhost:5000

# Client (separate terminal)
cd ../leadforge
npm install
npm run dev                # http://localhost:3002, proxies /api to :5000
```

### Environment variables (`server/.env`)

| Variable | Purpose |
|---|---|
| `PORT` | Server port (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_ORIGIN` | Allowed CORS origin for the frontend |
| `GROQ_API_KEY` | Groq API key — powers AI business analysis. Leave blank to disable (leads stay "pending") |
| `GROQ_MODEL` | Model for analysis, default `openai/gpt-oss-20b` (strict JSON schema support required) |

## How to Use

1. Open the **Dashboard**, pick a target country, enter a keyword (e.g. `restaurants in Dubai`), and start a scrape.
2. Watch live progress — found/processed counts, plus rejected (wrong-country) and merged (duplicate) counts.
3. High-priority leads (no/broken/social-only website) automatically get an AI business report.
4. On the **Leads** page, filter by country, website status, minimum rating, or lead status; search by name/keyword.
5. Click a business name to open its detail drawer — full record, website status, and the AI report (with an Analyze/Retry button for leads that weren't auto-analyzed).
6. Export everything as CSV.

## Project Structure

```
leadforge/
  src/
    App.jsx                        — Router + layout
    config.js                      — API_BASE for fetch calls
    constants/
      countries.js                 — ISO country list (mirrors server's country-verification lookup)
    pages/
      Dashboard.jsx                — Stats tiles + pipeline overview + scrape composer
      Leads.jsx                    — Filterable table + export + detail drawer
    components/
      TopBar.jsx                   — Nav + logo + theme toggle
      ThemeToggle.jsx               — Light/dark toggle
      ScrapeComposer.jsx           — Keyword + country input, live SSE progress
      PipelineOverview.jsx         — Total/emails/pipeline stat card
      RecentActivity.jsx           — Latest leads feed
      LeadsTable.jsx               — Sortable table with status/website badges
      LeadDetailDrawer.jsx         — Full lead record + AI report slide-over
      StatusBadge.jsx              — Pill badge (new/contacted/converted)
      WebsiteStatusBadge.jsx       — Website quality/status badge

server/                            (sibling directory, see ../server)
  index.js                         — Express entry point, security middleware
  routes/
    scrape.js                      — POST /api/scrape/start + SSE progress
    leads.js                       — GET/PATCH/DELETE /api/leads, analyze endpoint
  services/
    googleMapsScraper.js           — Playwright headless scraper
    countryVerification.js         — Coordinate/phone/address multi-signal country check
    leadDedup.js                   — placeId/phone/domain/geo+name dedup
    websiteAnalyzer.js             — Rule-based website quality scoring
    aiAnalysis.js                  — Groq structured-output business analysis
    emailExtractor.js              — Axios + Cheerio email extraction
  models/
    Lead.js                        — Mongoose schema
```

## Tech Stack

- **Backend:** Node.js, Express, MongoDB/Mongoose, Playwright, Cheerio, Axios, json2csv, Groq API (fetch, no SDK)
- **Frontend:** React, React Router, Tailwind CSS, Framer Motion
- **Font:** Inter + JetBrains Mono (Google Fonts)
