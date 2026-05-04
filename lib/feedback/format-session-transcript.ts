import type { Persona } from "@/lib/types/domain";
import type { TranscriptMessage } from "@/lib/session/session-store";

export function formatTranscriptForFeedback(messages: TranscriptMessage[]): string {
  return messages
    .filter((m) => m.text?.trim())
    .map((m) => {
      const who = m.role === "user" ? "Salesperson (trainee)" : "Customer (AI persona)";
      return `${who}: ${m.text.trim()}`;
    })
    .join("\n\n");
}

/** Persona has no single `description` field — combine fields for the coach prompt. */
export function buildPersonaDescriptionForFeedback(persona: Persona): string {
  const traits = persona.traits.length ? persona.traits.join(", ") : "none listed";
  return [
    `Name: ${persona.name}`,
    `Traits: ${traits}`,
    `Behavior notes: ${persona.behaviorNotes}`,
    `Voice: ${persona.voiceBehavior.toneStyle}, pace ${persona.voiceBehavior.speakingPace}, interrupt tendency ${persona.voiceBehavior.interruptFrequency}`,
  ].join("\n");
}

export function formatDurationMmSs(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
