import { create } from "zustand";

export type SessionMachineState = "idle" | "listening" | "processing" | "speaking" | "paused" | "ended";

export type TranscriptRole = "user" | "assistant";

export type TranscriptMessage = {
  id: string;
  role: TranscriptRole;
  text: string;
  timestamp: string;
};

export type VoiceInputMode = "tap" | "push";

type SessionStore = {
  sessionState: SessionMachineState;
  messages: TranscriptMessage[];
  isMuted: boolean;
  /** 0–1, applied to `SpeechSynthesisUtterance.volume` when not muted. */
  ttsVolume: number;
  voiceInputMode: VoiceInputMode;
  setMuted: (muted: boolean) => void;
  setTtsVolume: (volume: number) => void;
  setVoiceInputMode: (mode: VoiceInputMode) => void;
  setState: (next: SessionMachineState) => void;
  addMessage: (msg: { role: TranscriptRole; text: string }) => void;
  /** Replaces the `text` of the last transcript row (for streaming partials). No-op if empty. */
  setLastMessageText: (text: string) => void;
  /** Drops the last row (e.g. failed assistant stream). No-op if transcript is empty. */
  popLastMessage: () => void;
  resetSession: () => void;
};

export const useSessionStore = create<SessionStore>((set) => ({
  sessionState: "idle",
  messages: [],
  isMuted: false,
  ttsVolume: 1,
  voiceInputMode: "tap",

  setState: (sessionState) => set({ sessionState }),

  setMuted: (isMuted) => set({ isMuted }),
  setTtsVolume: (ttsVolume) => set({ ttsVolume: Math.min(1, Math.max(0, ttsVolume)) }),
  setVoiceInputMode: (voiceInputMode) => set({ voiceInputMode }),

  addMessage: ({ role, text }) =>
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: crypto.randomUUID(),
          role,
          text,
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  setLastMessageText: (text) =>
    set((s) => {
      const n = s.messages.length;
      if (n === 0) return s;
      const last = s.messages[n - 1]!;
      const next: TranscriptMessage = { ...last, text };
      return { messages: [...s.messages.slice(0, n - 1), next] };
    }),

  popLastMessage: () =>
    set((s) =>
      s.messages.length === 0 ? s : { messages: s.messages.slice(0, -1) },
    ),

  resetSession: () =>
    set({
      sessionState: "idle",
      messages: [],
      isMuted: false,
      ttsVolume: 1,
      voiceInputMode: "tap",
    }),
}));
