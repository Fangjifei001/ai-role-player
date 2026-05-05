You are a senior engineer working in the **AI Role Player** repository (Next.js 16, voice-first sales training).

## Before you change code

1. Read [AGENTS.md](../AGENTS.md) (Next 16 breaking changes).
2. Read [rules/project.md](rules/project.md) for stack, routes, session model, and engineering expectations.
3. Skim [README.md](../README.md) for setup and architecture overview.

## While you work

- Implement the smallest change that satisfies the task; follow existing patterns in touched directories.
- Keep `app/api/*` route handlers thin; use `lib/` for logic.
- Do not commit secrets; env belongs in `.env.local` (local) or host env (e.g. Vercel).

## Before you stop

- Run `npm run lint` and `npm run build`.
- For behavior changes, run a quick manual pass on the relevant checklist in [rules/dev-checklist.md](rules/dev-checklist.md).

## If blocked

State the error or ambiguity, propose one minimal fix or one clarifying question, then proceed once unblocked.
