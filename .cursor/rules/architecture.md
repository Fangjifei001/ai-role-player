# Architecture Overview

## Frontend-First Full-Stack Shape
- Use a single Next.js app with App Router for pages and lightweight API routes.
- Keep backend thin and focused on role-play/session orchestration, not heavy distributed systems.
- Prefer mock-friendly interfaces so STT/LLM/TTS providers can be swapped later.

## Required Routes
- `/dashboard`: learner start flow (scenario/persona/difficulty + summary + start CTA).
- `/session`: voice-first conversation UI.
- `/feedback`: end-session coaching summary and transcript export.
- `/admin`: scenario/persona management and configuration.

## Core Frontend Modules
1. Dashboard module
   - Searchable selectors and pre-session context summary.
2. Session module
   - Voice capture, turn pipeline, playback controls, transcript timeline, session controls.
3. Feedback module
   - Assessment, tips, highlights, metadata, export.
4. Admin module
   - Scenario/persona CRUD, validation, preview, per-scenario config.

## Session State Machine (mandatory)
- `idle`
- `listening`
- `processing`
- `speaking`
- `paused`
- `ended`
- `error`

All transitions must be explicit in UI; do not hide state changes in silent async flows.

## Data Flow (logical)
Learner audio input -> STT (or mock STT) -> user transcript turn -> response generation -> AI text stream -> TTS (or browser speech) -> audio playback -> transcript + metadata persistence -> feedback generation.

## Admin-to-Learner Consistency Rule
- Admin updates to scenarios/personas/config must be reflected in learner dashboard immediately at runtime, without rebuild.

## Design Principles
- Keep UI responsive during all async operations.
- Keep modules loosely coupled through typed interfaces.
- Isolate provider-specific code (STT/LLM/TTS) behind adapter boundaries.