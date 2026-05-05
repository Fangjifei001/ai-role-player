# Definition of done (manual)

Use before merging non-trivial work. Skip items that do not apply to the change.

## Quality gates

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Changed flows manually smoke-tested (see below).

## Flow smoke (pick what you touched)

- [ ] **Landing `/`** — navigation to learner/admin still works.
- [ ] **Dashboard** — scenario/persona selection and start → `/session` with expected query/state.
- [ ] **Session** — record/send turn, streaming transcript, TTS or mute path, pause/end/restart where relevant; mic permission denial not a dead end.
- [ ] **Feedback** — end session → data present (e.g. from session handoff); export if you changed feedback UI.
- [ ] **Admin** — CRUD still reflects on dashboard without rebuild (runtime store).

## Regression targets for session work

- [ ] Session states remain consistent with `SessionMachineState` and visible where the UI exposes them.
- [ ] Errors from chat/stream/TTS show a clear message and recoverable next step.

## Docs / env

- [ ] If APIs or env vars change, README or `docs/` updated in the same change when users must act.
