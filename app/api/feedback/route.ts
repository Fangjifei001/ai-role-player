/**
 * Generates structured sales-coach feedback (JSON). Uses same env model as `/api/session/chat`.
 */
import { generateText } from "ai";
import { buildSalesCoachFeedbackPrompt } from "@/lib/feedback/build-feedback-prompt";
import { parseFeedbackResultFromModelText } from "@/lib/feedback/parse-feedback-response";
import { type ResolvedModel, resolveModelFromEnv } from "@/lib/llm/resolve-model-from-env";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export type FeedbackApiRequestBody = {
  scenarioDescription?: string;
  scenarioGoals?: string[];
  personaDescription?: string;
  transcript?: string;
};

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

  const b = body as FeedbackApiRequestBody;
  const scenarioDescription = typeof b.scenarioDescription === "string" ? b.scenarioDescription.trim() : "";
  const personaDescription = typeof b.personaDescription === "string" ? b.personaDescription.trim() : "";
  const transcript = typeof b.transcript === "string" ? b.transcript.trim() : "";
  const scenarioGoals = Array.isArray(b.scenarioGoals)
    ? b.scenarioGoals
        .filter((g): g is string => typeof g === "string")
        .map((g) => g.trim())
        .filter((g) => g.length > 0)
    : [];

  if (!scenarioDescription) {
    return Response.json({ error: "scenarioDescription is required." }, { status: 400 });
  }
  if (!personaDescription) {
    return Response.json({ error: "personaDescription is required." }, { status: 400 });
  }
  if (!transcript) {
    return Response.json({ error: "Transcript is empty; nothing to evaluate." }, { status: 400 });
  }

  let model: ResolvedModel;
  try {
    model = resolveModelFromEnv();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: msg }, { status: 503 });
  }

  const prompt = buildSalesCoachFeedbackPrompt({
    scenarioDescription,
    scenarioGoals,
    personaDescription,
    fullTranscript: transcript,
  });

  try {
    const { text } = await generateText({
      model,
      prompt,
      maxRetries: parseMaxRetries(),
    });

    if (!text?.trim()) {
      return Response.json({ error: "Model returned an empty response." }, { status: 502 });
    }

    try {
      const result = parseFeedbackResultFromModelText(text);
      return Response.json({ result });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to parse model JSON.";
      console.error("[api/feedback] parse error:", msg, text.slice(0, 500));
      return Response.json({ error: msg }, { status: 502 });
    }
  } catch (e) {
    console.error("[api/feedback] generateText:", e);
    const msg = e instanceof Error ? e.message : "Model request failed.";
    return Response.json({ error: msg }, { status: 502 });
  }
}
