# AI Role Player
### Voice-first Sales Training Simulator

A **low-latency, voice-driven** AI simulator that recreates realistic sales conversations with dynamic customer personas — powered by streaming LLMs.

Designed for **high interactivity, real-time feedback, and configurable training scenarios**.

---

## Overview
This application simulates real-world sales conversations by allowing users to:
- Speak to an AI-powered customer persona
- Receive real-time AI responses (text + voice)
- Get structured coaching feedback after each session
- Switch between different AI models (DeepSeek / OpenAI)
- Configure scenarios and personas via an admin console

---

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing page with navigation into learner or admin flows. |
| `/dashboard` | Learner hub: choose scenario and persona from runtime data, preview, then start a session. |
| `/session` | Voice session: mic input, streaming chat, transcript, TTS, and low-latency interaction (you can interrupt AI speech). Scenario and persona selection are passed via query parameters. |
| `/feedback` | After each session, the AI analyzes the conversation and shows an overall score (0–100), strengths and improvement areas, coaching tips, highlighted moments, and an export action for the transcript (copy to clipboard). |
| `/history` | Placeholder in the shell menu (no dedicated page yet). |
| `/admin` | Admin: create/edit scenarios and personas and related behavior; data is persisted through the runtime store. |

Server APIs (not App Router pages):

| Path | Purpose |
|------|---------|
| `POST /api/session/chat` | Session chat: streams model text for the posted message list. |
| `POST /api/feedback` | Builds sales-coach-style structured feedback JSON from a session snapshot. |

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Prerequisites:** Node.js 20+ (matches `@types/node` in the repo).

For real model calls (session and feedback), add `.env.local` at the project root with keys and models as needed—for example:

- `LLM_PROVIDER`, `DEEPSEEK_API_KEY` / `OPENAI_API_KEY`, etc. The full env list is in the comment block at the top of [`app/api/session/chat/route.ts`](app/api/session/chat/route.ts); [`app/api/feedback/route.ts`](app/api/feedback/route.ts) uses the same model resolution. See also [`docs/setup-feedback.md`](docs/setup-feedback.md) and other files under [`docs/`](docs/) for setup notes.

Production build and start:

```bash
npm run build
npm run start
```

Quality checks:

```bash
npm run lint
npm run build
```

---

## Tech stack

| Area | Stack |
|------|--------|
| Framework | **Next.js 16** (App Router), **React 19** |
| Language | **TypeScript** |
| UI | **Ant Design**, **Tailwind CSS 4** |
| State | **Zustand** (session); runtime config via a custom store and `useSyncExternalStore` |
| AI | **Vercel AI SDK** (`ai`), `@ai-sdk/deepseek` / `@ai-sdk/openai` |
| Voice | STT (Speech-to-Text), TTS (Text-to-Speech) |
| Other | **lucide-react**, **cmdk**; **cross-env** on dev/start scripts for stable local DNS |

---

## Architecture

```text
Browser
  ├─ App Router pages: /, dashboard, session, feedback, admin
  ├─ Runtime config: lib/runtime/store (shared with admin + dashboard)
  ├─ Session UI state: lib/session/session-store (Zustand)
  └─ Feedback snapshot: written to sessionStorage on end session → read on /feedback

Server (Route Handlers)
  ├─ /api/session/chat  → streaming LLM replies
  └─ /api/feedback      → structured feedback generation

External
  └─ DeepSeek / OpenAI APIs (resolved from env, optional proxy)
```

**Data flow:** Admin maintains scenarios and personas; the dashboard subscribes to the same runtime data; the session page encodes the learner’s choice in the URL and drives the chat loop; ending a session writes a summary snapshot to **sessionStorage**; the feedback page loads it and calls the feedback API.

### Architecture Highlights
- Streaming-first design
- Progressive AI response rendering
- Prompt-driven AI behavior
- Scenario + Persona injection
- State machine-driven UI
- Clear session lifecycle
- Modular component architecture
- Pluggable AI provider layer
- Brand-aligned UI (shared tokens in `app/globals.css`, Ant Design `ConfigProvider` in `app/antd-theme-provider.tsx`)

### Performance & UX goals
- Aim for responsive feedback after user input (not a hard SLA in this repo)
- Streaming AI responses where supported
- Non-blocking UI patterns
- Interruptible audio playback
- Progressive transcript rendering

---

## Directory layout (main areas)

```text
ai-role-player/
├── app/
│   ├── page.tsx                 # Landing (brand-themed home)
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Tailwind + brand CSS variables
│   ├── antd-theme-provider.tsx  # Ant Design ConfigProvider + App (theme, message context)
│   ├── runtime-bootstrap.tsx    # Init runtime config on client mount (e.g. localStorage)
│   ├── admin/                   # Admin page + form components
│   ├── dashboard/               # Learner selection page
│   ├── session/                 # Session page + voice/transcript components
│   ├── feedback/                # Feedback page + components (summary, export, skeletons)
│   └── api/
│       ├── session/chat/        # Session chat API
│       └── feedback/            # Feedback API
├── components/                  # Shared UI (e.g. AppBrandLogo for shell headers)
├── hooks/                       # Shared React hooks (e.g. input level meter)
├── lib/
│   ├── runtime/store.ts         # Runtime scenario/persona storage + subscriptions
│   ├── session/                 # Message building, streaming, TTS, Web Speech, etc.
│   ├── feedback/                # Feedback prompts, parsing, snapshot I/O
│   ├── llm/                     # Model resolution, streaming helpers, proxy fetch
│   ├── types/                   # Domain + feedback result types
│   └── mock/                    # Optional demo mock data
├── public/                      # Static assets
├── docs/                        # Extra notes (e.g. setup-session, setup-feedback)
├── package.json
└── README.md
```
