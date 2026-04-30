# Development Constraints

## Scope Constraint
- This project is a full-stack MVP with frontend priority.
- Do not add features outside acceptance criteria until all required criteria are satisfied.

## Backend Complexity Constraint
DO NOT over-engineer backend:
- No unnecessary microservices/event-driven architecture.
- No heavy infrastructure unless required by a specific acceptance criterion.
- Keep server logic thin and focused on session flow, config CRUD, and feedback generation.

## Allowed MVP Shortcuts
- Mock STT responses.
- Mock/fake streaming behavior.
- Use browser speech synthesis or lightweight TTS integration.
- Use static/local runtime data if admin runtime updates are still supported.

## Non-Negotiable Requirements
- Voice-first session UX and audio playback are mandatory.
- Admin CRUD for scenarios and personas is mandatory.
- Per-scenario configuration support is mandatory (persona compatibility, success criteria, optional scoring weights, optional voice behavior).
- Feedback page must include assessment, tips, transcript, metadata, and at least 3 highlights.
- Robust failure handling is mandatory.

## UX and Latency Constraints
- Show processing state within 300ms after user submits a turn.
- Deliver first visible output quickly (target 1.5s for mocked/local setup).
- Start first audio quickly (target 2.5s for mocked/local setup).
- Never block UI interactions while waiting.

## Engineering Constraints
- Keep code modular and readable.
- Keep dependency footprint minimal.
- Always include loading, empty, and error states for async paths.
- Validate admin form inputs (required fields and length constraints).