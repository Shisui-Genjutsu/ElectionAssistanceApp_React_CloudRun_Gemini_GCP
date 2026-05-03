# स Saksham — Your Election, Explained Simply

> An AI-powered election assistant for Indian voters — persona-aware, state-specific, source-cited, and built to demystify the entire voting process end-to-end.

**Built at Prompt Wars Hackathon · Continuing active development →**

<br />

## Screenshots

<table>
  <tr>
    <td align="center" width="25%">
      <img src="public/assets/demo/home page.png" alt="Onboarding — Who are you?" /><br/>
      <sub><b>Onboarding</b></sub>
    </td>
    <td align="center" width="25%">
      <img src="public/assets/demo/overview page.png" alt="Overview dashboard" /><br/>
      <sub><b>Overview Dashboard</b></sub>
    </td>
    <td align="center" width="25%">
      <img src="public/assets/demo/assistant page.png" alt="AI Chat assistant" /><br/>
      <sub><b>Saksham Assistant</b></sub>
    </td>
    <td align="center" width="25%">
      <img src="public/assets/demo/election titmeline page.png" alt="Election journey timeline" /><br/>
      <sub><b>Election Journey</b></sub>
    </td>
  </tr>
</table>

<br />

## What is Saksham?

India's election process is genuinely complex — Form 6, Form 8, NOTA, VVPAT, ETPBS, ERO, BLO, MCC. Most guides either oversimplify or bury the reader in bureaucratic jargon.

**Saksham** (सक्षम — *empowered*) is a conversational election assistant that:

- 🎯 Tailors every answer to **who you are** — first-time voter, NRI, journalist, candidate, person with disability
- 🗺️ Knows **which state** you're in and answers state-specific procedures (not just generic national info)
- 📎 Cites **official ECI sources** in every response — no hallucinated or outdated advice
- 🧠 Uses **RAG (Retrieval-Augmented Generation)** over an ECI knowledge base — exact answers from real forms & rules
- 🔒 Keeps your **API key server-side** — it never reaches your browser
- 👶 Explains complex concepts in **ELI5 / ELI12 mode** for younger or first-time voters
- 📰 Surfaces **election-relevant news** alongside AI answers

<br />

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | React Router v7 (SSR mode) | Full-stack, file-based routing, server actions |
| **Runtime** | Node.js via `@react-router/serve` | SSR + API endpoints |
| **AI — Chat** | Google Gemini 2.5 Flash | Conversational reasoning, ELI5 rewrites |
| **AI — Embeddings** | `gemini-embedding-001` | Query & document vector encoding |
| **Vector Store** | Firebase Firestore (native vector search) | Knowledge base retrieval, no extra infra |
| **Auth / Admin** | Firebase Admin SDK | Server-only Firestore access |
| **Language** | TypeScript 5.9 + React 19 | Type-safe, modern stack |
| **Build** | Vite 8 + `@react-router/dev` | Fast HMR dev, optimized production bundle |
| **Styling** | Vanilla CSS design system | Custom tokens, themes, no Tailwind overhead |
| **Deployment** | Google Cloud Run | Serverless, auto-scales to zero |

<br />

## Architecture

### Current Architecture (v1 — Hackathon)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BROWSER (Client)                           │
│                                                                     │
│   React Router SPA                                                  │
│   ├── /                  Overview + countdown                       │
│   ├── /timeline          8-stage election journey                   │
│   ├── /chat              useFetcher → POST /api/chat                │
│   ├── /rescue            Missed deadlines guide                     │
│   ├── /booth             Booth locator                              │
│   └── /dates             Key dates calendar                         │
│                                                                     │
│   State: persona + state + lang stored in localStorage              │
└────────────────────────────┬────────────────────────────────────────┘
                             │  HTTP (Single Fetch / RR7)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVER  (Node.js / Cloud Run)                 │
│                                                                     │
│   React Router SSR + Server Actions                                 │
│   └── POST /api/chat  (action in api.chat.tsx)                      │
│         │                                                           │
│         ├── 1. embedText(query)  ──→ gemini-embedding-001           │
│         │        768-dim vector                                     │
│         │                                                           │
│         ├── 2. Firestore vector search                              │
│         │        knowledgeBase collection                           │
│         │        top-K nearest chunks (cosine distance)             │
│         │        → context string (ECI rules, form text)            │
│         │                                                           │
│         └── 3. generateAnswer(context + history + query)            │
│                  gemini-2.5-flash                                   │
│                  → streamed text + source citations                  │
│                                                                     │
│   Secrets: GOOGLE_GEMINI_API_KEY, FIREBASE_SERVICE_ACCOUNT_JSON     │
│   (never sent to browser — no VITE_ prefix)                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Planned Architecture (v2 — Active Development)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              DATA INGESTION PIPELINE                             │
│                              (offline / cron job)                                │
│                                                                                  │
│   Sources:                                                                       │
│   ├── ECI Forms (PDF)      Form 6, 7, 8, 8A, 12D, 26 — voter registration,     │
│   │                        nomination, postal ballot, NOTA, disability voting    │
│   ├── ECI Rules (PDF)      RP Act 1950, RP Act 1951, Conduct of Election        │
│   │                        Rules 1961, MCC guidelines                            │
│   ├── State ERO circulars  State-specific deadline notices                       │
│   └── News API             Google News / NewsData.io — election-tagged articles  │
│                                                                                  │
│   Pipeline steps per document:                                                   │
│   1. PDF parse            pdfjs-dist / pdf-parse → raw text                     │
│   2. Chunk                Split into 300–500 token overlapping chunks            │
│   3. Embed                gemini-embedding-001 → 768-dim float vector            │
│   4. Store                Firestore:                                             │
│                             knowledgeBase/{docId}                                │
│                             ├── text: string                                     │
│                             ├── embedding: VectorValue (768 floats)             │
│                             ├── source: { label, url, formCode }                │
│                             ├── state?: string   (null = national)              │
│                             ├── type: "form" | "rule" | "news"                  │
│                             └── ingestedAt: Timestamp                            │
└──────────────────────────────────────────────────────────────────────────────────┘

                    ▼  stored embeddings
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        FIRESTORE VECTOR DATABASE                                 │
│                                                                                  │
│   Collection: knowledgeBase                                                      │
│   Index: vector index on `embedding` field (Firestore native vector search)     │
│                                                                                  │
│   Benefits vs. Pinecone / Weaviate:                                              │
│   ✓ No extra infra — already using Firestore                                    │
│   ✓ Filter by state + doc type before vector search                              │
│   ✓ Exact answers from real text → fewer hallucinations                         │
│   ✓ Lower Gemini API cost (less reliance on model's parametric memory)          │
└──────────────────────────────────────────────────────────────────────────────────┘

                    ▼  at query time
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           RAG QUERY PIPELINE  (/api/chat action)                │
│                                                                                  │
│   1. embed query          gemini-embedding-001(userQuery) → q_vec               │
│                                                                                  │
│   2. pre-filter           WHERE state == ctx.state OR state == null             │
│                           WHERE type IN ["form","rule"]   (exclude old news)    │
│                                                                                  │
│   3. vector search        findNearest(q_vec, limit=5, distanceMeasure=COSINE)   │
│                           → top-5 chunks                                        │
│                                                                                  │
│   4. re-rank (planned)    Cross-encoder score against query                     │
│                           Ensures top chunk is actually relevant                 │
│                                                                                  │
│   5. build grounded prompt                                                       │
│      ┌─────────────────────────────────────────────────────┐                    │
│      │ System: You are Saksham...                          │                    │
│      │         State: {ctx.state}  Persona: {ctx.persona}  │                    │
│      │         ELI5: {eli5}                                │                    │
│      │                                                      │                    │
│      │ Context (from ECI documents):                       │                    │
│      │ [chunk 1 text]  source: Form 6, Section 3           │                    │
│      │ [chunk 2 text]  source: RP Act 1950, Section 22     │                    │
│      │ ...                                                  │                    │
│      │                                                      │                    │
│      │ Conversation history: [last 6 turns]                │                    │
│      │ User: {query}                                        │                    │
│      └─────────────────────────────────────────────────────┘                    │
│                                                                                  │
│   6. generateAnswer       gemini-2.5-flash → text + extracted source labels    │
│                                                                                  │
│   7. news side-panel      Parallel fetch from News collection                   │
│                           Filter: state + recent (< 7 days)                    │
│                           Return: headline, url, publishedAt                    │
└──────────────────────────────────────────────────────────────────────────────────┘

                    ▼  response
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER (Client)                                   │
│                                                                                  │
│   Chat message + source chips (¶ Form 6, ¶ RP Act 1950)                        │
│   News sidebar: "Related news from Andhra Pradesh"                               │
│   ELI5 toggle: re-sends same question with eli5:true flag                       │
└──────────────────────────────────────────────────────────────────────────────────┘
```

<br />

## Project Structure

```
election-assistance-app/
├── app/
│   ├── root.tsx                   # HTML shell, Inter font, global CSS
│   ├── routes.ts                  # All routes declared (RR7 file-based)
│   ├── app.css                    # Design system — tokens, themes, components
│   ├── types.ts                   # Persona, AppContext, RouteId
│   │
│   ├── lib/
│   │   ├── gemini.server.ts       # Server-only: embedText() + generateAnswer()
│   │   └── firebase.server.ts     # Server-only: Firestore vector search
│   │
│   └── routes/
│       ├── _shell.tsx             # Sidebar + topbar layout
│       ├── onboarding.tsx         # 3-step onboarding (full-screen)
│       ├── home.tsx               # Overview: countdown + quick prompts
│       ├── timeline.tsx           # 8-stage election journey + ELI12 toggle
│       ├── chat.tsx               # Saksham AI chat (useFetcher → /api/chat)
│       ├── rescue.tsx             # Missed deadlines fallback guide
│       ├── booth.tsx              # Booth locator + registration status
│       ├── dates.tsx              # Key dates calendar
│       └── api.chat.tsx           # POST /api/chat — Gemini proxy server action
│
├── scripts/
│   └── ingest.js                  # [WIP] PDF → chunk → embed → Firestore pipeline
│
└── public/
    └── assets/demo/               # Screenshots for README
```

<br />

## Edge Cases Solved

| Problem | Solution |
|---|---|
| **Calling Gemini from the browser exposes the API key in DevTools / network tab** | React Router v7 SSR acts as a **server-side proxy** — the browser posts to `/api/chat` (same origin), the server action calls Gemini, and only the text reply is returned. The key never crosses the network to the client. |
| API key leaked to browser via env | `gemini.server.ts` + no `VITE_` prefix — Vite only inlines `VITE_*` vars; `GOOGLE_GEMINI_API_KEY` stays in `process.env` on the server |
| Old GCP-console key had HTTP referrer restriction | Replaced with an unrestricted Google AI Studio key; server-side calls have no `Referer` header, so GCP's referrer whitelist always blocked them |
| `gemini-2.0-flash` deprecated for new keys | Updated to `gemini-2.5-flash` |
| `text-embedding-004` not found on AI Studio keys | Updated to `gemini-embedding-001` |
| Seeded chat prompt fires twice (React StrictMode) | `useRef(false)` guard + navigate-before-send + `setTimeout(..., 0)` defer |
| State lost on tab switch | `localStorage` persistence + outlet context in shell layout |
| Firebase Admin breaks client bundle | `.server.ts` suffix — Vite/RR7 excludes these files from the browser bundle entirely |
| Chrome DevTools probe causes RR7 500 in console | Cosmetic — `.well-known/appspecific/com.chrome.devtools.json` is a Chrome internal probe, not a real app request |
| RAG failure shouldn't break the chat | `try/catch` around vector search — Gemini still answers from parametric knowledge if Firestore search fails, with a soft warning to the user |

<br />

## Planned Features (Roadmap)

### RAG Knowledge Base (v2 priority)
- [ ] **PDF ingestion pipeline** — `scripts/ingest.js` → parse ECI forms (Form 6, 7, 8, 8A, 12D, 26) + RP Act 1950/1951 + MCC guidelines
- [ ] **Chunking strategy** — 400-token overlapping chunks with form section metadata
- [ ] **Firestore vector index** — create composite index on `(state, type, embedding)` for filtered vector search
- [ ] **Re-ranking** — cross-encoder pass after retrieval to pick the most relevant chunk
- [ ] **Incremental ingestion** — only re-embed changed/new documents (hash-based diff)

### Election News (v2)
- [ ] **News ingestion** — Google News RSS / NewsData.io API → election-tagged articles → stored in `news/` Firestore collection
- [ ] **News sidebar** — `/chat` shows 3 relevant recent headlines alongside AI answer
- [ ] **News relevance filter** — only surface news matching the user's state + query topic

### UX & Reach
- [ ] Hindi / Telugu response mode (`lang` flag in context already wired)
- [ ] Voice input via Web Speech API (button already in UI)
- [ ] PWA / offline mode for low-connectivity regions
- [ ] Aadhaar auto-registration live status via NVSP API
- [ ] Booth locator via Bhuvan / NVSP API (constituency + booth number lookup)

### Infrastructure
- [ ] Cloud Run deployment with Secret Manager for env vars
- [ ] Scheduled Cloud Run Job for daily news ingestion
- [ ] Firebase App Check to prevent abuse of `/api/chat` endpoint

<br />

## Knowledge Base — Documents to Ingest

| Document | Source | Type |
|---|---|---|
| Form 6 — New voter registration | voters.eci.gov.in | `form` |
| Form 7 — Objection to inclusion | voters.eci.gov.in | `form` |
| Form 8 — Address / name correction | voters.eci.gov.in | `form` |
| Form 8A — Transposition of entry | voters.eci.gov.in | `form` |
| Form 12D — Declaration for absentee voter | voters.eci.gov.in | `form` |
| Form 26 — Nomination paper | eci.gov.in | `form` |
| Representation of the People Act, 1950 | eci.gov.in | `rule` |
| Representation of the People Act, 1951 | eci.gov.in | `rule` |
| Conduct of Election Rules, 1961 | eci.gov.in | `rule` |
| Model Code of Conduct | eci.gov.in | `rule` |
| State ERO circulars (AP, Maharashtra, etc.) | State CEOs | `rule` |

<br />

## Getting Started

### Prerequisites
- Node.js 20+
- A [Google AI Studio](https://aistudio.google.com/apikey) API key (**unrestricted**, free tier works)
- Firebase project with Firestore enabled (for RAG — optional in v1, gracefully skipped)

### Install & run

```bash
git clone <this-repo>
cd election-assistance-app
npm install
```

Create `.env` (never committed — in `.gitignore`):

```env
# Required
GOOGLE_GEMINI_API_KEY=your_key_here

# Optional — RAG won't activate without this
FIREBASE_PROJECT_ID=your-project-id
# For local dev: gcloud auth application-default login
# For production: set full JSON below
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

```bash
npm run dev
# → http://localhost:5173
```

> **Note:** If Firebase is not configured, the RAG step is skipped gracefully — Gemini still answers from its training data.

### Build for production

```bash
npm run build
npm start
```

<br />

## Deployment (Google Cloud Run)

```bash
# Authenticate
gcloud auth login

# Build & push container
gcloud builds submit --tag gcr.io/YOUR_PROJECT/saksham

# Deploy
gcloud run deploy saksham \
  --image gcr.io/YOUR_PROJECT/saksham \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-secrets GOOGLE_GEMINI_API_KEY=gemini-key:latest \
  --set-secrets FIREBASE_SERVICE_ACCOUNT_JSON=firebase-sa:latest
```

Secrets are injected via **Secret Manager** — never hardcoded in the container or source.

<br />

## Why Firestore for Vector Search?

Most RAG tutorials default to Pinecone, Weaviate, or Qdrant. Saksham uses **Firestore native vector search** instead:

| | Firestore | Pinecone |
|---|---|---|
| Extra infra | ❌ None (already using Firestore) | ✅ New service to manage |
| Filtered search | ✅ `WHERE state = "AP"` before vector match | Metadata filters (paid tier) |
| Cost | ✅ Pay-per-read, free tier generous | Starts at $0.08/1M vectors |
| Latency | ~50–100ms (same region) | ~20–50ms |
| Data freshness | ✅ Real-time writes | Batch upsert |

For this use case — a few thousand ECI document chunks, filtered by state — Firestore is the right call.

<br />

## Contributing

This is an active project post-hackathon. PRs welcome especially for:

- Adding more ECI forms/rules to `scripts/ingest.js`
- Regional language support (Hindi, Telugu, Tamil, Malayalam…)
- NVSP / Bhuvan API integration for real booth data
- Accessibility improvements

<br />

---

*Built with ♥ for 970 million Indian voters · Prompt Wars Hackathon 2026*

> *"Saksham" (सक्षम) means capable / empowered in Hindi.*
