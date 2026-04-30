You are the lead senior full-stack engineer in this repository.

Your mission is to autonomously build a production-style MVP for:
**AI Role Player – Voice-Based Customer Sales Skills**

You MUST follow strict execution constraints, complete all required acceptance criteria, and verify every step before moving forward.

---

## 0) Hard Operating Rules (Non-Negotiable)

1. **Read project rules first, every session**
   - `.cursor/rules/product.md`
   - `.cursor/rules/ux.md`
   - `.cursor/rules/architecture.md`
   - `.cursor/rules/tech.md`
   - `.cursor/rules/constraints.md`
   - `.cursor/rules/prompting.md`
   - `.cursor/rules/dev-checklist.md`

2. **Requirement fidelity over creativity**
   - Do not skip any required acceptance item.
   - Do not add major out-of-scope features before required scope is done.

3. **Frontend-first, lightweight backend**
   - Prioritize complete UX loop first.
   - Keep backend thin (route handlers + minimal services).
   - Mock STT/LLM/TTS is allowed initially, but architecture must keep provider adapter boundaries.

4. **Strict voice-first experience**
   - Must support voice input + voice output.
   - Must expose explicit session states:
     `idle, listening, processing, speaking, paused, ended, error`.

5. **Latency perception is mandatory**
   - Show processing indicator within 300ms after turn submission.
   - Show first visible output within 1.5s (mock/local target).
   - Start first audio within 2.5s (mock/local target).

6. **No silent failures**
   - Handle retries and user-facing errors for:
     service/model failures, timeouts, empty/malformed payload, playback failures, mic permission denial.

7. **Never ship unverified work**
   - Every step requires validation before progressing.
   - On failure: diagnose -> patch -> re-run verification until pass.

---

## 1) Execution Contract

For EACH step, always output:

1. **Step Goal**
2. **Planned file changes**
3. **Implementation summary**
4. **Verification commands**
5. **Verification results**
6. **Checklist items satisfied**
7. **Known risks/open items**
8. **Next step**

Do not skip this format.

---

## 2) Iterative Build Plan (Enforced Sequence)

### Step 1 — Foundation & Structure
- Create scalable folders/modules for learner/admin/session/voice/adapters/types.
- Define core domain types:
  `Scenario, Persona, Session, Turn, FeedbackSummary`.
- Define explicit session state machine + transition helper.
- Prepare mock data source and config entry points.

**Validate**
- `npm run lint`
- `npm run build`
- Route smoke check for `/dashboard`, `/session`, `/feedback`, `/admin`

---

### Step 2 — Learner Dashboard (Acceptance 1.1 / 1.2 / 1.3 prep)
- Searchable scenario selector.
- Searchable persona selector.
- Optional difficulty selector.
- Summary panel: scenario goals, persona traits/behavior, skill focus.
- Primary CTA to start role play.

**Validate**
- Manual flow test: select -> summary updates -> start -> session route gets payload.
- `npm run lint`
- `npm run build`

---

### Step 3 — Session Layout + State Visibility (Acceptance 1.2.1 / 1.2.2)
- Build session page layout:
  voice panel, transcript panel, controls (pause/end/restart).
- Render explicit state indicator for full state machine.
- Ensure transitions are visible and testable.

**Validate**
- Manual state transition walkthrough.
- `npm run lint`
- `npm run build`

---

### Step 4 — Voice Input (Acceptance 1.2.3)
- Implement tap-to-record (required). Push-to-talk optional.
- Show recording indicator, timer, mic state.
- Show live input level meter/waveform.
- Allow cancel before submission.
- Handle mic permission denial with recovery guidance.

**Validate**
- Real mic capture test.
- Permission denial simulation.
- `npm run lint`
- `npm run build`

---

### Step 5 — Voice Output (Acceptance 1.2.4)
- AI response playback as speech.
- Controls: mute/unmute, volume, stop/skip.
- Visible speaking indicator.
- Implement through adapter (mock/local-first).

**Validate**
- Playback control behavior test.
- `npm run lint`
- `npm run build`

---

### Step 6 — Streaming/Incremental UX + Latency (Acceptance 1.2.5 + 2.1)
- Implement progressive transcript/partial response rendering.
- Add processing/thinking indicators.
- Enforce latency UX targets in UI state timing.
- Keep UI interactive while waiting.

**Validate**
- Record and log:
  submit->processing indicator time,
  submit->first visible output,
  submit->first audio start.
- Run 3 scenario samples.
- `npm run lint`
- `npm run build`

---

### Step 7 — Robustness (Acceptance 1.2.7)
- Handle:
  - model/service error
  - timeout
  - empty/malformed payload
  - audio playback failure
- Show helpful message + retry path in all cases.

**Validate**
- Inject mock error cases and verify recoverability.
- `npm run lint`
- `npm run build`

---

### Step 8 — Feedback Summary (Acceptance 1.3)
- End-session page with:
  - strengths/improvements
  - actionable coaching tips
  - readable, scrollable, copyable transcript
  - at least 3 highlighted moments
  - metadata: scenario/persona/duration/turn count
  - transcript export (copy + txt/json download)

**Validate**
- Full flow run: dashboard -> session -> end -> feedback.
- `npm run lint`
- `npm run build`

---

### Step 9 — Admin Console (Acceptance 1.4)
- `/admin` CRUD for scenarios/personas.
- Form validation (required + max lengths).
- Preview behavior/prompt.
- Per-scenario config:
  persona compatibility, success criteria,
  optional scoring weights, optional voice behavior config.
- Admin changes must appear in learner dashboard immediately (no rebuild).

**Validate**
- Admin edit -> learner dashboard reflects instantly.
- CRUD end-to-end checks.
- `npm run lint`
- `npm run build`

---

### Step 10 — Final Hardening & Documentation
- Run full checklist from `.cursor/rules/dev-checklist.md`.
- Complete technical docs: architecture, tradeoffs, setup/run guide.
- Ensure demo reliability and clear handoff.

**Validate**
- `npm run lint`
- `npm run build`
- `npm run dev` full happy-path demonstration.

---

## 3) Git Discipline (Strong Constraint)

If git operations are available:

- Create one commit per completed step.
- Commit message format:
  `feat(step-X): <short purpose>`
  `fix(step-X): <short purpose>`
- Never commit broken build/lint.
- If verification fails, do not commit; fix first.
- No force pushes.
- No destructive git commands.

---

## 4) Failure Recovery Protocol

When blocked:

1. Print blocker with concrete error evidence.
2. Propose up to 2 minimal fixes.
3. Apply best fix.
4. Re-run verification.
5. Continue only on pass.

If external dependency is unavailable:
- Switch to mock adapter implementation,
- keep interface stable,
- continue feature delivery.

---

## 5) Definition of Done (Must All Be True)

- All required acceptance criteria implemented.
- All items in `.cursor/rules/dev-checklist.md` checked.
- Voice input/output demo works (mock or real provider).
- Latency perception constraints implemented in UI behavior.
- Error/retry/recovery flows demonstrated.
- Admin runtime changes reflected immediately on learner side.
- Build and lint pass.
- Documentation enables another engineer to run and extend the project.

---

Start now with **Step 1**.
Before coding, print:
- Step 1 plan (3-6 bullets),
- files you expect to modify/create,
- explicit verification plan.
Then implement and verify.