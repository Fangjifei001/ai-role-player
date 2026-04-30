# UX Guidelines

## Core Principle
Voice-first, conversational, and always responsive. The user must always know current session status and available next action.

## Learner Dashboard Requirements
- Provide searchable scenario and persona selectors.
- Provide optional difficulty selector (Easy / Medium / Hard or equivalent).
- Display scenario goals, persona traits/behavior notes, and suggested skill focus before start.
- Provide one clear primary CTA to start role play.

## Session View Requirements
- Include voice interaction panel, transcript panel, and session controls (pause/end/restart).
- Show explicit session state indicator with at least: listening, processing, speaking, paused, ended.
- Support progressive transcript and/or response rendering during generation.

## Voice Input UX Requirements
- Support push-to-talk or tap-to-record.
- Show recording indicator with timer and mic icon.
- Show live input level meter or waveform.
- Allow canceling recording before submission.
- Handle microphone permission denial with clear guidance and recovery steps.

## Voice Output UX Requirements
- AI persona responses must be played as speech audio.
- Provide playback controls: mute/unmute, volume, stop/skip current speech.
- Show visible indicator while AI is speaking.

## Transcript UX Requirements
- Clearly distinguish learner vs persona turns.
- Show timestamps for turns.
- Keep transcript readable, scrollable, and copyable in feedback.

## Feedback UX Requirements
- Show overall assessment (strengths and improvement areas).
- Show actionable coaching tips.
- Highlight at least 3 specific conversation moments (good practice and/or improvement needs).
- Show session metadata: scenario, persona, duration, number of turns.
- Support transcript export (copy or download txt/json).

## Latency and Responsiveness Requirements
- Show processing indicator within 300ms after user turn submission.
- Show first visible output within 1.5s where feasible.
- Start first AI audio within 2.5s for mocked/local responses (best effort with real model).
- UI must remain interactive during waits (scroll, navigation, cancel).

## Robustness Requirements
- Handle model/service errors with retry and clear messaging.
- Handle timeout gracefully.
- Handle empty/malformed payloads defensively.
- Handle audio playback failures (for example, unsupported codec) with fallback guidance.