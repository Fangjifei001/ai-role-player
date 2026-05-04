/**
 * Env: LLM_PROVIDER (`deepseek` default | `openai`),
 * DeepSeek: DEEPSEEK_API_KEY, optional DEEPSEEK_MODEL, DEEPSEEK_BASE_URL,
 * OpenAI: OPENAI_API_KEY, optional OPENAI_MODEL, OPENAI_BASE_URL,
 * LLM_MAX_RETRIES (optional, default 0), HTTPS_PROXY / HTTP_PROXY (optional).
 */
import { streamText } from "ai";
import { streamTextResultToPlainTextResponse } from "@/lib/llm/plain-text-stream-response";
import { type ResolvedModel, resolveModelFromEnv } from "@/lib/llm/resolve-model-from-env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function splitLeadingSystem(messages: ChatMessage[]): {
  system: string | undefined;
  messages: { role: "user" | "assistant"; content: string }[];
} {
  let i = 0;
  const systemChunks: string[] = [];
  while (i < messages.length && messages[i]!.role === "system") {
    systemChunks.push(messages[i]!.content);
    i++;
  }
  const system = systemChunks.length > 0 ? systemChunks.join("\n\n") : undefined;
  const rest = messages.slice(i) as { role: "user" | "assistant"; content: string }[];
  return { system, messages: rest };
}

function parseMaxRetries(): number {
  const raw = process.env.LLM_MAX_RETRIES?.trim();
  if (raw === undefined || raw === "") return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = (body as { messages?: ChatMessage[] }).messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages array is required" }, { status: 400 });
  }

  const { system, messages: coreMessages } = splitLeadingSystem(messages);
  if (coreMessages.length === 0) {
    return Response.json(
      { error: "At least one user or assistant message is required after any system prompt." },
      { status: 400 },
    );
  }

  let model: ResolvedModel;
  try {
    model = resolveModelFromEnv();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: msg }, { status: 503 });
  }

  const maxRetries = parseMaxRetries();

  const result = streamText({
    model,
    ...(system !== undefined ? { system } : {}),
    messages: coreMessages,
    maxRetries,
    onError({ error }) {
      console.error("[session/chat] streamText error:", error);
    },
    onFinish({ text, finishReason }) {
      if (!text?.trim()) {
        console.warn("[session/chat] finished with empty text, finishReason:", finishReason);
      }
    },
  });

  return streamTextResultToPlainTextResponse(result);
}
