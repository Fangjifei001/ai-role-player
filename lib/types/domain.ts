export interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  personaIds: string[];
  scenarioGoals: string[];
  suggestedSkillFocus: string[];
  scoring: {
    weights: Record<string, number>;
    criteria: Array<{
      id: string;
      description: string;
      weight: number;
    }>;
  };
  voiceBehaviorOverrides?: {
    interruptFrequency?: "Low" | "Medium" | "High";
    speakingPace?: "Slow" | "Moderate" | "Fast";
    toneStyle?: "Friendly" | "Casual" | "Formal" | "Professional" | "Direct" | "Neutral" | "Challenging";
  };
  createdAt: string;
  updatedAt: string;
}

export interface Persona {
  id: string;
  name: string;
  traits: string[];
  behaviorNotes: string;
  voiceBehavior: {
    speakingPace: "Slow" | "Moderate" | "Fast";
    toneStyle: "Friendly" | "Casual" | "Formal" | "Professional" | "Direct";
    interruptFrequency: "Low" | "Medium" | "High";
  };
  createdAt: string;
  updatedAt: string;
}
