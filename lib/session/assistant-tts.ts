import { useSessionStore } from "@/lib/session/session-store";

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";
}

let ttsErrorHandler: ((detail: string) => void) | null = null;

export function setAssistantTtsErrorHandler(handler: ((detail: string) => void) | null): void {
  ttsErrorHandler = handler;
}

/** Stops TTS; if session was `speaking`, moves to `idle` (synthesis `onend` may not run after `cancel`). */
export function cancelAssistantSpeech(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const { sessionState, setState } = useSessionStore.getState();
  if (sessionState === "speaking") {
    setState("idle");
  }
}

/**
 * Speaks assistant text after generation. Sets `speaking`, then `idle` on end/error.
 * No-op (sets `idle`) when muted, empty text, or synthesis unsupported.
 */
export function speakAssistantResponse(text: string): void {
  const store = useSessionStore.getState();
  const trimmed = text.trim();
  if (!trimmed || store.isMuted) {
    store.setState("idle");
    return;
  }
  if (!isSpeechSynthesisSupported()) {
    store.setState("idle");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.lang = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";
  utterance.volume = Math.min(1, Math.max(0, store.ttsVolume));

  utterance.onend = () => {
    useSessionStore.getState().setState("idle");
  };
  utterance.onerror = (ev) => {
    const err = (ev as { error?: string }).error ?? "playback-failed";
    ttsErrorHandler?.(err);
    useSessionStore.getState().setState("idle");
  };

  store.setState("speaking");
  window.speechSynthesis.speak(utterance);
}
