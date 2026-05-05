# AI Role Player — agent rules

Voice-first sales training simulator. Treat **AGENTS.md** (repo root) as mandatory for Next.js 16 — read `node_modules/next/dist/docs/` when APIs differ from older Next.

## Stack (facts)

- Next.js 16 App Router, React 19, TypeScript, ESLint (`eslint-config-next`).
- UI: Ant Design + Tailwind CSS 4.
- Session UI state: Zustand (`lib/session/session-store.ts`).
- Runtime scenarios/personas: `lib/runtime/store` (shared by dashboard + admin).
- AI: Vercel AI SDK (`ai`), `@ai-sdk/deepseek` / `@ai-sdk/openai`; streaming chat in `lib/session/stream-chat.ts`.
- Voice: browser STT/TTS in session components; keep adapters and error surfaces consistent with existing patterns.

## Routes and APIs

| Page / API | Role |
|------------|------|
| `/`, `/dashboard`, `/session`, `/feedback`, `/admin` | Main UX; `/history` is shell placeholder only. |
| `POST /api/session/chat` | Streams model text for the message list. |
| `POST /api/feedback` | Structured coaching JSON from a session snapshot. |

Env for models: comment block at top of `app/api/session/chat/route.ts` (feedback route uses the same resolution). Local setup: README + `docs/`.

## Session lifecycle (code)

Typed states in `SessionMachineState`: `idle` | `listening` | `processing` | `speaking` | `paused` | `ended`. Failures are handled with user-visible messages and return to a safe state (e.g. `idle` after stream errors)—do not assume a separate `error` enum unless you add it.

## How to work in this repo

- Prefer small, reviewable diffs; match file layout, naming, and patterns already in the tree.
- Keep API routes thin; put logic in `lib/` and reuse helpers.
- Preserve perceived responsiveness: prompt processing state soon after submit; streaming partials where the pipeline already supports them.
- Every async path should have a sensible loading, empty, or error outcome (toast, inline message, or UI state)—no silent failures.
- Do not expand scope with unrelated features; voice loop + dashboard + feedback + admin stay coherent.
- Before finishing: `npm run lint` and `npm run build` (and manual smoke of touched flows when behavior changes).

## Product priorities (when tradeoffs matter)

1. Voice UX and session reliability over decorative UI.
2. Correctness of scenario/persona wiring and feedback quality over extra surface area.
3. Simple architecture: no new services or infra unless the task explicitly requires it.
