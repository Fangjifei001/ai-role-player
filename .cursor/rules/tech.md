# Tech Stack & Rules

## Baseline Stack
- Frontend: Next.js App Router + TypeScript + React.
- Styling: Tailwind CSS (or equivalent utility-first styling).
- Backend: Next.js route handlers / API routes with lightweight service layer.

## Frontend-First Implementation Rule
- Prioritize implementing complete learner/admin flows in frontend before adding backend complexity.
- Backend should only provide what is needed for session orchestration, configuration CRUD, and feedback payloads.

## Voice Technology Rule
- Input: browser microphone capture via MediaRecorder/Web Audio/Web Speech where applicable.
- Output: AI responses must play as speech audio (browser TTS or external TTS service).
- Voice interfaces must support recording indicators, level visualization, cancel flow, and playback controls.

## AI Integration Rule
- Accept mocked STT/LLM/TTS during MVP build, but keep provider integration boundaries explicit.
- Streaming/incremental updates should be implemented where feasible (mocked or real).
- Do not lock core UI flow to one provider-specific SDK API.

## Data and Persistence Rule
- For MVP, local JSON/local storage/in-memory API is acceptable.
- If persistence is added, keep schema minimal and aligned to scenarios, personas, sessions, turns, and feedback.
- Admin changes must propagate to learner dashboard immediately at runtime.

## State Management Rule
- Use lightweight state patterns (`useState`, `useReducer`, context, or similarly light libraries).
- State model must explicitly represent session lifecycle and error states.

## Performance and Reliability Rule
- Enforce perceived-latency UX targets in UI states and loading behavior.
- UI must remain responsive; long tasks cannot block interaction loop.
- Always implement retry/error handling for service failures, timeout, malformed payloads, and playback errors.

## Simplicity Rule
- Prefer simplest solution that still satisfies acceptance criteria.
- Avoid unnecessary heavy infrastructure unless a requirement cannot be met otherwise.