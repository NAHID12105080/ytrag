# 🎥 YouTube Summarizer (ytrag)

A powerful AI-driven application that extracts transcripts from YouTube videos, translates them to English if necessary, generates concise structured notes with key topics, and allows you to interactively chat with the video's content using Retrieval-Augmented Generation (RAG). The UI is a Next.js app talking to a FastAPI backend.

---

## 🚀 Key Features

* **Automated Transcript Extraction:** Fetch transcripts in any supported language using the YouTube Transcript API.
* **Auto-Translation to English:** Automatically translates transcripts in foreign languages to English using the advanced **Gemini 2.5 Flash** model.
* **Smart Topic & Notes Extraction:** Extracts the 5 most important topics and produces concise, bulleted study notes.
* **RAG-based Chatbot:** Create a semantic vector store from the transcript chunks and ask any question about the video, with streamed (token-by-token) responses.

---

## 🛠️ Tech Stack

* **Frontend UI:** [Next.js](https://nextjs.org/) (App Router, TypeScript, Tailwind, shadcn/ui) — see `frontend/`.
* **Backend API:** [FastAPI](https://fastapi.tiangolo.com/) (`api/`) — a thin HTTP layer over `core/`, the
  original business logic module. No RAG/AI logic lives in the API layer itself.
* **AI Models:**
  * LLM: Google Gemini (`gemini-2.5-flash`)
  * Embeddings: Google Generative AI Embeddings (`models/gemini-embedding-001`)
* **Orchestration & Vector Store:**
  * [LangChain](https://www.langchain.com/) (Prompts, Chains, Text Splitter)
  * [Chroma](https://github.com/chroma-core/chroma) (Vector database, in-memory)
* **Data Sources:** [YouTube Transcript API](https://github.com/jakecreps/youtube-transcript-api)

---

## 📂 Project Structure

```
├── core/                    # Business logic: transcript ingestion, translation, notes, RAG — no UI deps
├── api/                     # FastAPI app exposing core/ over HTTP for the Next.js frontend
├── frontend/                 # Next.js app (App Router) — presentation only, talks to api/ over HTTP
├── requirements.txt          # Python dependencies (FastAPI + core/ deps)
├── .env                     # Local environment secrets (API Keys)
├── .env.example              # Documents required env vars
└── .vscode/settings.json    # Workspace interpreter settings
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
Python 3.10+ (this project uses [uv](https://github.com/astral-sh/uv) or a standard virtual environment)
and Node.js 20+ with [pnpm](https://pnpm.io/) for the frontend.

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add your Google API key:

```env
GOOGLE_API_KEY="your-gemini-api-key-here"
```

### 3. Install Python Dependencies
Using **`uv`** (recommended):
```bash
uv pip install -r requirements.txt
```

Or using standard **`pip`** (after activating your venv):
```bash
source .venv/bin/activate
pip install -r requirements.txt
```

### 4. Install Frontend Dependencies
```bash
cd frontend
pnpm install
cp .env.example .env.local   # points the frontend at http://localhost:8000 by default
```

---

## 🖥️ Running the Application

Run both processes in separate terminals from the repository root:

```bash
# Terminal 1 — backend API (http://localhost:8000)
uv run uvicorn api.main:app --reload --port 8000
# or: ./.venv/bin/uvicorn api.main:app --reload --port 8000

# Terminal 2 — frontend (http://localhost:3000)
cd frontend
pnpm dev
```

Open `http://localhost:3000` in your browser.

---

## ☁️ Deployment (free tier)

Backend on [Render](https://render.com/), frontend on [Vercel](https://vercel.com/) —
both have no-credit-card-required free tiers and deploy straight from this repo.

**Order matters**: deploy the backend first (the frontend needs its URL at build
time), then come back and point the backend's CORS at the frontend's URL.

1. **Render** → New → Blueprint → connect this repo. Render detects `render.yaml`
   at the repo root and provisions the `ytrag-api` web service. When prompted, set
   `GOOGLE_API_KEY`; leave `FRONTEND_ORIGIN` blank for now. Deploy, then note the
   generated URL (e.g. `https://ytrag-api.onrender.com`).
2. **Vercel** → Add New → Project → import this repo → set **Root Directory** to
   `frontend` (required, since this is a monorepo) → add env var
   `NEXT_PUBLIC_API_BASE_URL` = the Render URL from step 1 → Deploy. Note the
   generated URL (e.g. `https://ytrag.vercel.app`).
3. Back in **Render** → `ytrag-api` → Environment → set `FRONTEND_ORIGIN` = the
   Vercel URL from step 2 (no trailing slash) → save, which redeploys the backend
   with CORS now allowing the live frontend.

**Trade-off to know**: chat sessions and the vector store are in-memory only (see
`api/store.py`) — Render's free tier sleeps after 15 minutes of inactivity, and the
next request cold-starts the service (~30–50s) with all prior sessions gone. Fine
for personal/demo use; would need a database + persistent vector store to survive
restarts in production.
