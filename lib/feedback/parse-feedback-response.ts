import type {
  FeedbackResult,
  FeedbackResultCoachingTip,
  FeedbackResultHighlightMoment,
  FeedbackResultSummary,
} from "@/lib/types/feedback-result";

/** Shown when the model returns no strengths—avoids failing the whole feedback response. */
const FALLBACK_STRENGTH =
  "We did not surface clear, repeatable strengths in this transcript yet—and that is okay. Short or difficult practices often look like this. Keep going: pick one skill to rehearse next time (for example, a concise opener, one deeper discovery question, or a clean recap before you propose anything). Consistency turns effort into visible wins.";

const FALLBACK_IMPROVEMENT =
  "Treat this session as a baseline: choose one concrete behavior to practice next time—such as labeling emotion, handling one objection with evidence, or confirming next steps—and measure whether you did it once before you raise the bar.";

const FALLBACK_COACHING_PAD: FeedbackResultCoachingTip[] = [
  {
    title: "Start with a clear intent",
    description:
      "Open with why you are asking your first question and what you want to learn. It grounds the conversation and makes your follow-ups feel purposeful rather than scripted.",
  },
  {
    title: "Check understanding before you pitch",
    description:
      "Briefly restate what you heard and ask a quick confirmation before you move to solutions. It catches misreads early and lowers unnecessary friction.",
  },
  {
    title: "Own a next step",
    description:
      "Close with one specific action you will take (what, when, how you will follow up). Momentum survives practice when the conversation ends with clarity, not ambiguity.",
  },
];

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
 * Parses model output into {@link FeedbackResult}. Throws only for malformed JSON or missing summary/score.
 * Empty strengths/improvements are filled with supportive defaults; coaching tips are padded to three generic items if needed.
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
  let strengths = Array.isArray(strengthsRaw)
    ? strengthsRaw.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean)
    : [];
  if (strengths.length === 0) strengths = [FALLBACK_STRENGTH];

  const improvementsRaw = root.improvements ?? root.areasToImprove ?? root.gaps;
  let improvements = Array.isArray(improvementsRaw)
    ? improvementsRaw.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean)
    : [];
  if (improvements.length === 0) improvements = [FALLBACK_IMPROVEMENT];

  let coachingTips = normalizeCoachingTips(root.coachingTips ?? root.coaching_tips);
  if (coachingTips.length < 3) {
    const titles = new Set(coachingTips.map((t) => t.title));
    for (const pad of FALLBACK_COACHING_PAD) {
      if (coachingTips.length >= 3) break;
      if (!titles.has(pad.title)) {
        coachingTips.push(pad);
        titles.add(pad.title);
      }
    }
    let fill = 0;
    while (coachingTips.length < 3) {
      fill += 1;
      coachingTips.push({
        title: `Practice focus ${fill}`,
        description:
          "Short sessions still build habit. Pick one micro-skill, run it once in the next role-play, and reflect on what changed—even a small signal counts as progress.",
      });
    }
  }

  const highlightMoments = normalizeHighlightMoments(root.highlightMoments ?? root.highlights ?? root.moments);

  return { summary, strengths, improvements, coachingTips, highlightMoments };
}
