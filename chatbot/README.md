# AI Chatbot

A full-stack AI chatbot with streaming responses, persistent chat history, and a dark ChatGPT-style UI.

**Stack:** React + Tailwind (frontend) · Node.js + Express (backend) · OpenAI API

---

## Setup

### 1. Clone & install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set your OpenAI API key:

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini   # or gpt-4o, gpt-3.5-turbo
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

### 3. Run

Open two terminals:

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

Visit **http://localhost:5173**

---

## Features

- **Streaming responses** — text streams in token by token via SSE
- **Blinking cursor** — visible while AI is generating
- **Chat history** — persisted in localStorage, survives page refresh
- **Multiple conversations** — sidebar with collapsible panel
- **Stop button** — cancel generation mid-stream
- **Markdown rendering** — code blocks with syntax labels and copy button
- **Suggested prompts** — clickable starters on empty chat
- **Error handling** — inline dismissible error banner
- **Rate limiting** — 30 req/min per IP
- **Dark theme** — fully dark, accessible design

## Production build

```bash
# Build frontend
cd frontend && npm run build

# Serve built files via Express (add static middleware)
# or deploy frontend to Vercel/Netlify and backend to Railway/Render
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | — | Required. Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model to use |
| `PORT` | `3001` | Backend port |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
