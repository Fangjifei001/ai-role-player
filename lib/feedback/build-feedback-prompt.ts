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
- strengths: 2–4 strings.
- improvements: 2–4 strings.
- coachingTips: at least 3 items; each must be actionable and specific.
- highlightMoments: at least 3 items; type only "good" or "bad"; message must quote or closely match a salesperson line; timestamp is seconds from session start (estimate order if unknown: 0, 60, 120, …).

Focus on:
- objection handling
- clarity
- questioning
- closing ability

Avoid vague phrases like:
"do better", "improve communication"`;
}
