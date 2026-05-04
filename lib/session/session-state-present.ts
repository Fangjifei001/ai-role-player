import type { SessionMachineState } from "./session-store";

export function sessionStateDotClass(s: SessionMachineState): string {
  switch (s) {
    case "listening":
      return "bg-cyan-500";
    case "processing":
      return "bg-amber-500";
    case "speaking":
      return "bg-emerald-500";
    case "paused":
      return "bg-zinc-400";
    case "ended":
      return "bg-red-400";
    default:
      return "bg-zinc-300";
  }
}

export type SessionVoiceHint = { primary: string; secondary?: string };

export function getSessionVoiceCardHint(s: SessionMachineState): SessionVoiceHint {
  switch (s) {
    case "idle":
      return {
        primary: "Ready to begin",
        secondary: "When you speak, role-play will respond here.",
      };
    case "listening":
      return {
        primary: "Listening…",
        secondary: "You can pause or stop if you need a break.",
      };
    case "processing":
      return {
        primary: "Working on a reply…",
        secondary: "Hang tight while the AI shapes the next turn.",
      };
    case "speaking":
      return {
        primary: "AI is speaking…",
        secondary: "You can listen or interrupt to respond.",
      };
    case "paused":
      return {
        primary: "Paused",
        secondary: "Resume when you’re ready to continue.",
      };
    case "ended":
      return {
        primary: "Session ended",
        secondary: "You can head back to the dashboard to start another run.",
      };
  }
}
