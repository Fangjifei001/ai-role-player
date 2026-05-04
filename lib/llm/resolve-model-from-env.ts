import { createDeepSeek } from "@ai-sdk/deepseek";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { getProxiedFetch } from "@/lib/llm/proxy-fetch";

export type LlmProviderId = "deepseek" | "openai";

export type ResolvedModel = Parameters<typeof streamText>[0]["model"];

function providerFromEnv(): LlmProviderId {
  const raw = process.env.LLM_PROVIDER?.trim().toLowerCase();
  if (!raw || raw === "deepseek") return "deepseek";
  if (raw === "openai") return "openai";
  throw new Error(`Unknown LLM_PROVIDER "${raw}". Use deepseek or openai.`);
}

/**
 * Pick chat model from env. Default: DeepSeek.
 *
 * - `LLM_PROVIDER`: `deepseek` (default) | `openai`
 * - DeepSeek: `DEEPSEEK_API_KEY`, optional `DEEPSEEK_MODEL` (default `deepseek-chat`), optional `DEEPSEEK_BASE_URL`
 * - OpenAI: `OPENAI_API_KEY`, optional `OPENAI_MODEL`, `OPENAI_BASE_URL`
 */
export function resolveModelFromEnv(): ResolvedModel {
  const fetchImpl = getProxiedFetch();
  const id = providerFromEnv();

  if (id === "deepseek") {
    const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
    if (!apiKey) {
      throw new Error(
        "DEEPSEEK_API_KEY is missing in .env.local (default LLM_PROVIDER is deepseek).",
      );
    }
    const baseURL = process.env.DEEPSEEK_BASE_URL?.trim() || undefined;
    const modelId = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";
    return createDeepSeek({ apiKey, baseURL, fetch: fetchImpl })(modelId);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing while LLM_PROVIDER=openai.");
  }
  const baseURL = process.env.OPENAI_BASE_URL?.trim() || undefined;
  const modelId = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  return createOpenAI({ apiKey, baseURL, fetch: fetchImpl })(modelId);
}
