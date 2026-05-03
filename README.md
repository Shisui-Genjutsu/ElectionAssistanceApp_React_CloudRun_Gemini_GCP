# स Saksham — Your Election, Explained Simply

> An AI-powered election assistant for Indian voters — persona-aware, state-specific, and built to demystify the entire voting process end-to-end.

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

India's election process is genuinely complex — Form 6, Form 8, NOTA, VVPAT, ETPBS, ERO, BLO. Most guides either oversimplify or bury the reader in bureaucracy.

**Saksham** is a conversational election assistant that:
- Tailors every answer to **who you are** (first-time voter, NRI, journalist, person with disability…)
- Knows **which state** you're in and answers state-specific procedures
- Cites **official ECI sources** in every response — no hallucinated advice
- Explains complex concepts with an **ELI5 mode** (built for a 12-year-old's reading level)
- Keeps your **API key server-side** — it never reaches your browser

<br />

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React Router v7](https://reactrouter.com) (Framework mode — SSR + file-based routing) |
| **Runtime** | Node.js via `@react-router/serve` |
| **AI** | [Google Gemini 2.5 Flash](https://ai.google.dev/) via `@google/generative-ai` |
| **Knowledge Base** | Firebase Firestore (vector search via `firebase-admin`) |
| **Language** | TypeScript 5.9, React 19 |
| **Build** | Vite 8 + `@react-router/dev` |
| **Styling** | Vanilla CSS design system (no Tailwind, no CSS-in-JS) |
| **Deployment target** | Google Cloud Run |

<br />

## Architecture

```
Browser                     Server (Node.js / Cloud Run)
───────                     ────────────────────────────
React Router Client  ←────→  React Router SSR
useFetcher (POST)    ──────→  /api/chat  action()
                                  │
                                  ├──→ Firebase Admin  (Firestore vector search)
                                  │       knowledgeBase collection
                                  │       → relevant context chunks
                                  │
                                  └──→ Gemini 2.5 Flash
                                          grounded prompt
                                          → streamed text + sources
```

### Key design decisions

**1. SSR as a security proxy**  
React Router v7's framework mode runs real server-side code. The `GOOGLE_GEMINI_API_KEY` environment variable has **no `VITE_` prefix** — it is loaded exclusively in `app/lib/gemini.server.ts` inside a server `action()`. The browser bundle never contains or requests this key.

**2. File-based routing with persistent state**  
Each sidebar tab is a real URL (`/`, `/timeline`, `/chat`, `/rescue`, `/booth`, `/dates`). State (persona, selected state, pin) is kept in `localStorage` and read in the shell layout, propagated down via `useOutletContext`. Navigating between tabs doesn't lose your context.

**3. Persona-aware prompting**  
The selected persona (e.g., "NRI / Overseas") is injected into the system prompt sent to Gemini. An NRI gets ETPBS and FPCA answers; a person with disability gets Form 12D and companion voting guidance — without any manual routing logic.

**4. Cross-tab prompt injection**  
Any page can navigate to `/chat` with a pre-filled question via React Router's `location.state`. A `useRef` guard ensures the prompt fires **exactly once** regardless of React StrictMode's double-effect invocations in development.

<br />

## Edge Cases Solved

| Problem | Solution |
|---|---|
| **Gemini API key leaked to browser** | Server-only file (`*.server.ts`) + no `VITE_` prefix — key stays in `process.env` |
| **Old API key with HTTP referrer restriction** | Replaced with an unrestricted Google AI Studio key; model updated to `gemini-2.5-flash` |
| **`gemini-2.0-flash` deprecated for new keys** | Detected via ListModels API; updated to `gemini-2.5-flash` |
| **Seeded chat prompt fires twice** | `useRef(false)` guard + navigate-before-send + `setTimeout(..., 0)` defer |
| **State lost on tab switch** | `localStorage` persistence in shell layout; all routes read from outlet context |
| **Firebase Admin breaks client bundle** | `firebase.server.ts` suffix — Vite/RR7 excludes `.server.ts` from browser bundling |
| **Election jargon (NOTA, VVPAT, EVM…)** | Inline glossary tooltips; ELI5 mode flag sent to Gemini for plain-language rewrites |

<br />

## Project Structure

```
app/
├── root.tsx                 # HTML shell, Inter font, global CSS
├── routes.ts                # All routes declared here (RR7 file-based)
├── app.css                  # Design system — tokens, themes, components
├── types.ts                 # Persona, AppContext, RouteId
│
├── lib/
│   ├── gemini.server.ts     # Server-only: Gemini client + generateAnswer()
│   └── firebase.server.ts   # Server-only: Firebase Admin + Firestore vector search
│
└── routes/
    ├── _shell.tsx            # Sidebar + topbar layout (wraps all pages)
    ├── onboarding.tsx        # 3-step onboarding (full-screen, no shell)
    ├── home.tsx              # Overview dashboard with countdown + quick prompts
    ├── timeline.tsx          # 8-stage election journey with ELI12 toggle
    ├── chat.tsx              # Saksham AI chat (useFetcher → /api/chat)
    ├── rescue.tsx            # "I missed something" — fallback guide
    ├── booth.tsx             # Booth locator + registration status
    ├── dates.tsx             # Key dates calendar
    └── api.chat.tsx          # POST /api/chat — Gemini proxy action
```

<br />

## Getting Started

### Prerequisites
- Node.js 20+
- A [Google AI Studio](https://aistudio.google.com/apikey) API key (unrestricted, free tier works)

### Install & run

```bash
git clone <this-repo>
cd election-assistance-app
npm install
```

Create `.env`:

```env
GOOGLE_GEMINI_API_KEY=your_key_here
```

```bash
npm run dev
# → http://localhost:5177
```

### Build for production

```bash
npm run build
npm start
```

<br />

## Deployment (Google Cloud Run)

```bash
# Build container
docker build -t saksham .

# Deploy
gcloud run deploy saksham \
  --image saksham \
  --set-env-vars GOOGLE_GEMINI_API_KEY=your_key \
  --allow-unauthenticated \
  --region asia-south1
```

Or use the Cloud Run MCP integration directly from your IDE.

<br />

## Roadmap

- [ ] Firestore knowledge base population (election forms, ECI circulars)
- [ ] Hindi / Telugu response mode
- [ ] Aadhaar auto-registration status checker
- [ ] Booth locator via Bhuvan / NVSP API integration
- [ ] Voice input (Web Speech API)
- [ ] PWA / offline mode for low-connectivity areas

<br />

## Built at Prompt Wars Hackathon

**Saksham** was built for the Prompt Wars hackathon. The goal: make India's election process legible to every voter — not just those who can navigate government portals.

> *"Saksham" (सक्षम) means capable / empowered in Hindi.*

---

MIT License · Made with ♥ in India
