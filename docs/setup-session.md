## Step 0 - Initial the page
You are helping me build a voice-first AI role play web app. The layout please refer the screenshot.

Tech stack:
- React + Vite + TypeScript
- Zustand for state
- TailwindCSS for UI

Goal:
Build a Role Play Session page with:
- Voice input (mic)
- Transcript panel
- AI response (streaming)
- Audio playback (TTS)
- Session state machine

First, set up the project structure.

Tasks:
1. Create folder structure:
   - src/components/session
   - src/pages
   - src/store
2. Setup a basic Session page
3. Add Tailwind layout (header, transcript area, bottom voice panel)

Do NOT implement logic yet.
Focus only on layout and structure.

## Step 1 - manage the state
Now implement a global session state using Zustand.

Requirements:
- State machine:
  "idle" | "listening" | "processing" | "speaking" | "paused" | "ended"

- Store should include:
  - current state
  - transcript messages (array of {id, role, text, timestamp})
  - isMuted

- Actions:
  - setState
  - addMessage
  - resetSession

- Keep it simple and clean.

After that:
- Connect state to UI (display current state in header)

## Step 2 - Mic input
Now implement the MicButton component.

Requirements:
- Button toggles recording state
- On click:
  idle → listening
  after 1.5s → processing
  after 1s → add a mock user message
  then → speaking
  after 1.5s → add a mock AI response
  then → idle

- Show UI states:
  - listening: red indicator
  - processing: spinner text
  - speaking: waveform animation placeholder

Do NOT integrate real audio yet.
This is a simulation to validate state transitions.

## STEP 3 — Transcript, support streaming
Now implement the Transcript panel.

Requirements:
- Add support for streaming:
  - allow partial message updates (update last message text)

- Auto-scroll to bottom on new messages

Keep UI clean and minimal.

## STEP 4 — Connect LLM（Streaming）
Now integrate OpenAI (or mock API) for AI response.

Requirements:
- When user message is added:
  → call API

- Use streaming response (ReadableStream or mock)

- As chunks arrive:
  → progressively update AI message in transcript

- State transitions:
  listening → processing → speaking → idle

Important:
- Show "Processing..." within 300ms
- Start rendering response ASAP (streaming)

Do NOT add TTS yet.
Focus on text streaming.

## STEP 5 — Connect STT(Speech To Text)
Now replace mock user input with real speech-to-text.
- Use Web Speech API (SpeechRecognition)

Requirements:
- Start recording when mic clicked
- Stop recording on second click
- Convert speech → text
- Add user message to transcript

Handle:
- permission denied
- empty result

Keep fallback to mock if not supported.

## STEP 6 — Connect TTS(Text to Speech) to implement AI speech output.
Now implement Text-to-Speech for AI responses.

Option:
- Use browser speechSynthesis (simple)

Requirements:
- When AI finishes generating:
  → speak the response

- Add controls:
  - mute/unmute
  - stop speaking

- Update state:
  speaking → idle when finished

Make sure:
- user can interrupt playback

## STEP 7 — Interrupt behavior
Now implement interrupt behavior.

Requirements:
- If user clicks mic while AI is speaking:
  → stop audio immediately
  → switch to listening

- Cancel any ongoing TTS or streaming

This should feel like a real conversation.

## STEP 8 — Improve perceived latency
Now improve perceived latency.

Requirements:
- Show "Processing..." within 300ms after user stops speaking
- Start rendering partial AI text ASAP
- Add typing indicator ("...")

- Ensure UI never freezes

Optional:
- Add fake delay smoothing if needed

## STEP 9 — Error handling
Add robust error handling.

Cases:
- mic permission denied
- STT failure
- API failure
- empty response
- audio playback failure

UI:
- show friendly messages
- provide retry option

## Step 10 - Session Control
Implement session controls.

Requirements:
- Pause
- Restart (clear transcript)
- End session

End session:
→ navigate to feedback page (placeholder)