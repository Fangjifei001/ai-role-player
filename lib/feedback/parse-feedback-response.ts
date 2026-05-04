import type {
  FeedbackResult,
  FeedbackResultCoachingTip,
  FeedbackResultHighlightMoment,
  FeedbackResultSummary,
} from "@/lib/types/feedback-result";

function extractJsonObject(raw: string): string {
  const t = raw.trim();
  const fence = /^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```\s*$/im.exec(t);
  if (fence?.[1]) return fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) return t.slice(start, end + 1).trim();
  return t;
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number.parseFloat(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function normalizeCoachingTips(raw: unknown): FeedbackResultCoachingTip[] {
  if (!Array.isArray(raw)) return [];
  const out: FeedbackResultCoachingTip[] = [];
  for (const item of raw) {
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      const title = asString(o.title) ?? asString(o.heading);
      const description = asString(o.description) ?? asString(o.body) ?? asString(o.detail);
      if (title && description) out.push({ title, description });
    } else if (typeof item === "string" && item.trim()) {
      const s = item.trim();
      const cut = s.length > 48 ? `${s.slice(0, 48)}…` : s;
      out.push({ title: cut, description: s });
    }
  }
  return out;
}

function normalizeHighlightMoments(raw: unknown): FeedbackResultHighlightMoment[] {
  if (!Array.isArray(raw)) return [];
  const out: FeedbackResultHighlightMoment[] = [];
  let fallbackTs = 0;
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const typeRaw = asString(o.type)?.toLowerCase();
    const type = typeRaw === "bad" ? "bad" : "good";
    const message = asString(o.message) ?? asString(o.quote) ?? asString(o.text);
    const feedback = asString(o.feedback) ?? asString(o.note) ?? asString(o.reason);
    if (!message || !feedback) continue;
    const ts = asNumber(o.timestamp) ?? fallbackTs;
    fallbackTs += 45;
    out.push({ type, message, feedback, timestamp: Math.max(0, ts) });
  }
  return out;
}

/**
 * Parses model output into {@link FeedbackResult}. Throws with a short message if invalid.
 */
export function parseFeedbackResultFromModelText(raw: string): FeedbackResult {
  let data: unknown;
  try {
    data = JSON.parse(extractJsonObject(raw));
  } catch {
    throw new Error("Model did not return valid JSON.");
  }

  if (!data || typeof data !== "object") throw new Error("JSON root must be an object.");

  const root = data as Record<string, unknown>;
  const summaryRaw = root.summary;
  if (!summaryRaw || typeof summaryRaw !== "object") throw new Error('Missing "summary" object.');

  const sObj = summaryRaw as Record<string, unknown>;
  const overallAssessment =
    asString(sObj.overallAssessment) ??
    asString(sObj.overall_assessment) ??
    asString(sObj.assessment);
  if (!overallAssessment) throw new Error('Missing "summary.overallAssessment".');

  const scoreRaw = asNumber(sObj.score) ?? asNumber(sObj.overallScore);
  if (scoreRaw === null) throw new Error('Missing numeric "summary.score".');
  const score = Math.min(100, Math.max(0, Math.round(scoreRaw)));

  const summary: FeedbackResultSummary = { overallAssessment, score };

  const strengthsRaw = root.strengths;
  const strengths = Array.isArray(strengthsRaw)
    ? strengthsRaw.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean)
    : [];
  if (strengths.length < 2) throw new Error("Expected at least 2 strengths.");

  const improvementsRaw = root.improvements ?? root.areasToImprove ?? root.gaps;
  const improvements = Array.isArray(improvementsRaw)
    ? improvementsRaw.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean)
    : [];
  if (improvements.length < 2) throw new Error("Expected at least 2 improvements.");

  const coachingTips = normalizeCoachingTips(root.coachingTips ?? root.coaching_tips);
  if (coachingTips.length < 3) throw new Error("Expected at least 3 coaching tips.");

  const highlightMoments = normalizeHighlightMoments(root.highlightMoments ?? root.highlights ?? root.moments);
  if (highlightMoments.length < 3) throw new Error("Expected at least 3 highlight moments.");

  return { summary, strengths, improvements, coachingTips, highlightMoments };
}
