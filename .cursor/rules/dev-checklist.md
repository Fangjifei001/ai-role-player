# AI Role Player Development Checklist

Use this checklist as the Definition of Done for the MVP. Do not mark complete unless the behavior is visible and testable in UI.

## 0. Project Guardrails
- [ ] Frontend-first full-stack approach is preserved (thin backend, complete UX loop).
- [ ] No major feature outside acceptance criteria is implemented before required items are complete.
- [ ] Voice-first interaction remains the primary experience.
- [ ] UI remains responsive during async operations (no blocked interactions).

## 1. Learner Dashboard (Role Play Start)

### 1.1 Selection and Start
- [ ] Scenario selector is searchable.
- [ ] Persona selector is searchable.
- [ ] Difficulty selector exists and is optional.
- [ ] Primary CTA exists to start role play in one action.

### 1.2 Pre-Session Summary
- [ ] Scenario goals are displayed.
- [ ] Persona traits and behavior notes are displayed.
- [ ] Suggested skill focus is displayed.

### 1.3 Routing and Data
- [ ] Start action routes to session view with selected setup.
- [ ] Selected scenario/persona/difficulty are available in session state.

## 2. Role Play Session (Voice-First Conversational UI)

### 2.1 Session Layout
- [ ] Dedicated session page exists.
- [ ] Voice interaction panel is visible.
- [ ] Transcript panel is visible.
- [ ] Session controls include pause/end/restart.

### 2.2 Session State Visibility
- [ ] State indicator is visible and accurate.
- [ ] States include at least: listening, processing, speaking, paused, ended.
- [ ] Error state is represented when failures occur.

### 2.3 Voice Input
- [ ] Supports push-to-talk or tap-to-record.
- [ ] Recording indicator includes timer and mic icon/state.
- [ ] Live input level meter or waveform is visible while recording.
- [ ] Recording can be canceled before submission.
- [ ] Microphone permission denial has clear guidance and recovery.

### 2.4 Voice Output
- [ ] AI responses play as speech audio.
- [ ] Playback controls include mute/unmute.
- [ ] Playback controls include volume.
- [ ] Playback controls include stop/skip current speech.
- [ ] AI speaking indicator is visible while audio is playing.

### 2.5 Conversation and Transcript
- [ ] Progressive/incremental rendering is implemented (mocked or real).
- [ ] Transcript clearly distinguishes learner vs persona turns.
- [ ] Transcript includes timestamps.
- [ ] Conversation context is maintained across turns.

### 2.7 Robustness
- [ ] Service/model error state has retry and helpful message.
- [ ] Timeout is handled gracefully.
- [ ] Empty response and malformed payload are handled defensively.
- [ ] Audio playback failures are handled with fallback guidance.

## 3. Coaching and Feedback Summary

### 3.1 End-of-Session Summary
- [ ] Overall assessment is shown (strengths and improvement areas).
- [ ] Actionable coaching tips are shown.
- [ ] Full transcript is readable and scrollable.
- [ ] Transcript is copyable.

### 3.2 Highlighted Moments
- [ ] At least 3 highlighted conversation moments are shown.
- [ ] Highlights include good practice and/or improvement opportunities.

### 3.3 Export
- [ ] Transcript can be exported (copy or download).
- [ ] Download supports txt or json format.
- [ ] Optional audio artifact export works if implemented.

### 3.4 Metadata
- [ ] Feedback view shows scenario.
- [ ] Feedback view shows persona.
- [ ] Feedback view shows session duration.
- [ ] Feedback view shows number of turns.

## 4. Admin Console (Scenario and Persona Configuration)

### 4.1 Core CRUD
- [ ] Admin route or mode exists.
- [ ] Scenario create/edit/delete works.
- [ ] Persona create/edit/delete works.

### 4.2 Form Quality
- [ ] Required field validation exists.
- [ ] Reasonable max-length validation exists.
- [ ] Preview capability exists (persona behavior or prompt preview).

### 4.3 Scenario Configuration
- [ ] Persona compatibility can be configured per scenario.
- [ ] Success criteria can be configured per scenario.
- [ ] Optional scoring weights can be configured.
- [ ] Optional voice behavior config can be configured (interrupt frequency, speaking pace, tone style).

### 4.4 Runtime Reflection
- [ ] Admin changes appear in learner dashboard without rebuild.

## 5. Non-Functional Latency and Responsiveness
- [ ] Processing indicator appears within 300ms after recording stops/submission.
- [ ] First visible output appears within 1.5s for mocked/local path (best effort for real services).
- [ ] First AI audio starts within 2.5s for mocked/local path (best effort for real services).
- [ ] Waiting states never freeze navigation, scrolling, or cancel actions.

## 6. Technical Delivery Checklist
- [ ] Core routes exist: `/dashboard`, `/session`, `/feedback`, `/admin`.
- [ ] Session lifecycle is modeled explicitly (`idle`, `listening`, `processing`, `speaking`, `paused`, `ended`, `error`).
- [ ] Provider-specific STT/LLM/TTS logic is isolated behind interfaces/adapters.
- [ ] Loading, empty, and error UI states exist for every async path.
- [ ] Demo can run locally end to end with mocked or real services.

## 7. Documentation and Handover
- [ ] Technical documentation explains core features and architecture.
- [ ] Dependencies and setup instructions are complete.
- [ ] Key design decisions and tradeoffs are documented.
- [ ] Another engineer can run and extend the project based on docs.
