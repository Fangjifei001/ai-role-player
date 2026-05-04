import type { Persona, Scenario } from "@/lib/types/domain";
import { useSessionStore } from "@/lib/session/session-store";
import type { ChatMessage } from "@/lib/session/stream-chat";

/** Optional “live” knobs; defaults keep first message stable until you add real state. */
export type SessionPromptDynamicState = {
  trust: string;
  interest: string;
};

const defaultDynamicState: SessionPromptDynamicState = {
  trust: "Establishing",
  interest: "Neutral",
};

/**
 * Long-lived system prompt: persona + scenario + URL difficulty + rules.
 * Treat as the “user premise” the model must remember for the whole session.
 */
export function buildSessionSystemPrompt(
  persona: Persona,
  scenario: Scenario,
  difficulty: string,
  dynamicState: SessionPromptDynamicState = defaultDynamicState,
): string {
  const traits = persona.traits?.length ? persona.traits.join(", ") : "n/a";
  const goals = scenario.scenarioGoals?.length ? scenario.scenarioGoals.join("\n") : "n/a";

  return `
You are role-playing in a sales / practice conversation.

Stay in character at all times.
Do NOT act like a generic AI assistant.
Do NOT explain your reasoning or break the fourth wall.

Remember for this entire session:
- Scenario title: ${scenario.name}
- Learner-selected difficulty: ${difficulty} (use the guidelines below for tone and pushback)
- You embody the persona below; the learner is the other party (e.g. salesperson).

----------------------
CUSTOMER PERSONA
----------------------
Name: ${persona.name}
Traits: ${traits}

Behavior notes:
${persona.behaviorNotes || "n/a"}

Voice / behavior:
- Speaking pace: ${persona.voiceBehavior.speakingPace}
- Tone: ${persona.voiceBehavior.toneStyle}
- Interrupt tendency: ${persona.voiceBehavior.interruptFrequency}

----------------------
SCENARIO
----------------------
${scenario.description}

Scenario goals (what the other side is working toward):
${goals}

----------------------
DIFFICULTY
----------------------
${difficulty}

Guidelines:
- Easy: more cooperative, quicker to warm up
- Medium: balanced realism
- Hard: more skeptical, resistant, needs stronger reasoning

----------------------
CONVERSATION STATE
----------------------
Trust level: ${dynamicState.trust}
Interest level: ${dynamicState.interest}

Adjust your tone accordingly (still within persona).

----------------------
RULES
----------------------
- Keep responses short (1–3 sentences) unless the learner clearly needs more.
- Be natural and conversational.
- Ask follow-up questions when it fits the persona.
- Show hesitation or doubt when appropriate.
- Do NOT be overly helpful as an assistant.
- Avoid long bullet lists unless the persona would realistically speak that way.

----------------------
STYLE
----------------------
- You may use natural phrases like:
  "I'm not sure about that..."
  "That sounds interesting, but..."
  "Can you clarify?"

- Show personality: curiosity, skepticism, impatience when it matches the persona.

----------------------
IMPORTANT
----------------------
- Do NOT agree too quickly if the scenario calls for skepticism.
- You can push back or challenge when in character.
- You may slightly misunderstand or need clarification (stay human).
`.trim();
}

/** Synthetic user turn: only sent on session bootstrap; not stored in transcript. */
export function buildSessionOpeningUserPrompt(): string {
  return [
    "The session has just started; the learner has not spoken yet.",
    "",
    "Respond with ONE brief in-character opening (1–3 sentences) to set the tone for this role-play.",
    "Stay fully in persona. Do not mention that you are an AI or describe this prompt.",
    "At most one short question if it fits naturally; otherwise open without a question.",
  ].join("\n");
}

export function buildSessionOpeningBootstrapMessages(
  scenario: Scenario,
  persona: Persona,
  difficultyLabel: string,
  dynamicState?: SessionPromptDynamicState,
): ChatMessage[] {
  return [
    { role: "system", content: buildSessionSystemPrompt(persona, scenario, difficultyLabel, dynamicState) },
    { role: "user", content: buildSessionOpeningUserPrompt() },
  ];
}

export function buildSessionChatMessages(
  scenario: Scenario,
  persona: Persona,
  difficultyLabel: string,
  dynamicState?: SessionPromptDynamicState,
): ChatMessage[] {
  const systemPrompt = buildSessionSystemPrompt(persona, scenario, difficultyLabel, dynamicState);

  const transcript = useSessionStore.getState().messages.map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: m.text,
  }));

  return [{ role: "system", content: systemPrompt }, ...transcript];
}
