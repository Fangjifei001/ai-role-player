/** One-line message for stream `error` parts (OpenAI / DeepSeek / gateways). */
export function formatLlmStreamFailure(err: unknown): string {
  if (err == null) return "Unknown API error.";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;

  if (typeof err === "object") {
    const o = err as Record<string, unknown>;
    const inner = o.error;
    if (inner && typeof inner === "object") {
      const ie = inner as Record<string, unknown>;
      if (typeof ie.message === "string") return ie.message;
      if (ie.code === "insufficient_quota" || ie.type === "insufficient_quota") {
        return "LLM: insufficient quota — add credits or check billing in your provider console.";
      }
    }
    if (typeof o.message === "string") return o.message;
    if (typeof o.code === "string") {
      const msg = typeof o.message === "string" ? o.message : "";
      return msg ? `LLM (${o.code}): ${msg}` : `LLM error code: ${o.code}`;
    }
  }

  try {
    const s = JSON.stringify(err);
    return s.length > 800 ? `${s.slice(0, 800)}…` : s;
  } catch {
    return String(err);
  }
}
