export type BuildSalesCoachFeedbackPromptInput = {
  scenarioDescription: string;
  scenarioGoals: string[];
  personaDescription: string;
  fullTranscript: string;
};

/**
 * Single user message for the coach model. Asks for strict JSON matching {@link FeedbackResult} shape.
 */
export function buildSalesCoachFeedbackPrompt(input: BuildSalesCoachFeedbackPromptInput): string {
  const goalsBlock = input.scenarioGoals.map((g) => `• ${g}`).join("\n");

  return `You are an expert sales coach evaluating a role-play conversation.
Your task is to analyze the salesperson's performance and provide structured, actionable feedback.
Be specific, concise, and practical.
Do NOT give generic advice.
Do NOT repeat the transcript.

SCENARIO:
${input.scenarioDescription}

PERSONA:
${input.personaDescription}

GOALS:
${goalsBlock}

TRANSCRIPT:
${input.fullTranscript}

Return your response in STRICT JSON only (no markdown fences, no commentary). Use this exact shape:
{
  "summary": { "overallAssessment": "string", "score": number },
  "strengths": ["string"],
  "improvements": ["string"],
  "coachingTips": [{ "title": "string", "description": "string" }],
  "highlightMoments": [
    { "type": "good" | "bad", "message": "exact line from the salesperson in the transcript", "feedback": "why", "timestamp": number }
  ]
}

Rules:
- score is integer 0–100.
- strengths: 0–4 short strings grounded in the transcript. If the conversation is very short, one-sided, or has no clear wins, return an empty array []—do NOT invent praise. The app will show a supportive default if the array is empty.
- improvements: 0–4 specific, actionable items tied to evidence. If nothing concrete stands out, return [] rather than vague filler; the app will add a gentle default.
- coachingTips: prefer 3–5 items when possible; each must be actionable. If the transcript is too thin for five, still return as many good tips as you can (minimum 1 if you have any insight, otherwise []).
- highlightMoments: 0–6 items; only include moments you can justify from the transcript. type only "good" or "bad"; message must quote or closely match a salesperson line; timestamp is seconds from session start (estimate order if unknown: 0, 45, 90, …). Prefer quality over quantity—omit rather than fabricate.

Focus on:
- objection handling
- clarity
- questioning
- closing ability

Avoid vague phrases like:
"do better", "improve communication"`;
}
