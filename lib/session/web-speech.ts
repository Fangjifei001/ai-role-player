/** Web Speech API (SpeechRecognition) helpers — Chrome / Edge / Safari (prefixed). */

/** Narrow surface used by the app (DOM lib may omit Web Speech types). */
type SpeechResultRow = {
  readonly isFinal: boolean;
  readonly 0?: { readonly transcript?: string };
};

export type AppSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  /** May be missing or cleared on some engines when `onend` runs. */
  readonly results?: { readonly length: number; [i: number]: SpeechResultRow | undefined } | null;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: null | ((ev: unknown) => void);
  onerror: null | ((ev: { readonly error: string }) => void);
  onend: null | (() => void);
};

export function getSpeechRecognitionConstructor(): (new () => AppSpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => AppSpeechRecognition;
    webkitSpeechRecognition?: new () => AppSpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

export function collectSpeechTranscript(recognition: {
  readonly results?: { readonly length: number; [i: number]: SpeechResultRow | undefined } | null;
}): string {
  const results = recognition.results;
  if (!results || typeof results.length !== "number") {
    return "";
  }
  const parts: string[] = [];
  for (let i = 0; i < results.length; i++) {
    const alt = results[i]?.[0];
    if (alt?.transcript) parts.push(alt.transcript);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
