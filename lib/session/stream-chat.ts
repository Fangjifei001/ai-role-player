import { cancelAssistantSpeech, speakAssistantResponse } from "@/lib/session/assistant-tts";
import { useSessionStore } from "@/lib/session/session-store";

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = { role: ChatRole; content: string };

/**
 * POST `/api/session/chat`, appends an empty assistant row, streams full text via `setLastMessageText`.
 * Sets `sessionState` to `processing` while streaming, `idle` when done (including after errors once idle is set).
 */
const CHAT_FETCH_TIMEOUT_MS = 120_000;

export async function streamSessionChatReply(messages: ChatMessage[]): Promise<void> {
  const store = useSessionStore.getState();
  cancelAssistantSpeech();
  store.setState("processing");

  const ac = new AbortController();
  const timeoutId = window.setTimeout(() => ac.abort(), CHAT_FETCH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch("/api/session/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: ac.signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error("Request timed out. Check your network and try again.");
    }
    throw e instanceof Error ? e : new Error("Network error while contacting the AI.");
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const errText = await res.text();
    store.setState("idle");
    let msg = errText || `HTTP ${res.status}`;
    try {
      const j = JSON.parse(errText) as { error?: string };
      if (typeof j?.error === "string") msg = j.error;
    } catch {
      /* keep msg as errText */
    }
    throw new Error(msg);
  }

  store.addMessage({ role: "assistant", text: "" });

  const body = res.body;
  if (!body) {
    useSessionStore.getState().setState("idle");
    throw new Error("No response body");
  }

  // Match AI SDK `processTextStream`: UTF-8 bytes → string chunks (handles split code units).
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let accumulated = "";
  let handOffToTts = false;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += value;
      useSessionStore.getState().setLastMessageText(accumulated);
    }
    if (!accumulated.trim()) {
      useSessionStore.getState().popLastMessage();
      throw new Error(
        "LLM reply was empty. Check the terminal for [session/chat] logs; set HTTPS_PROXY in .env.local if the server cannot reach the API.",
      );
    }
    handOffToTts = true;
    speakAssistantResponse(accumulated);
  } finally {
    if (!handOffToTts) {
      useSessionStore.getState().setState("idle");
    }
  }
}
