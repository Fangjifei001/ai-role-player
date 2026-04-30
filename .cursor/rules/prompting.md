# Prompting Rules

## Implementation Behavior
When generating code:
- Implement incrementally by feature slice (dashboard -> session -> feedback -> admin).
- Keep responses and code decisions aligned to explicit acceptance criteria.
- Prefer concrete, minimal designs that satisfy requirements end to end.

## Requirement Alignment Checks
Before finalizing any feature:
- Verify voice-first behavior is preserved.
- Verify explicit session state handling is visible in UI.
- Verify loading/error/retry paths are implemented.
- Verify learner and admin flows remain connected at runtime.

## Technical Decision Heuristics
When unsure:
- Choose the simplest working approach that does not violate requirements.
- Prefer frontend improvements over backend expansion unless backend is required.
- Use mocked services first if they accelerate validating UX and latency behavior.

## Output Quality
Always:
- Keep latency perception low via immediate status feedback and progressive rendering.
- Keep UX clear about "what is happening now" and "what user can do next".
- Keep code readable, modular, and easy to extend.