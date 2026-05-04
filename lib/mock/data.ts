import type { Persona, Scenario } from "../types/domain";

export const mockScenarios: Scenario[] = [
  {
    "id": "scenario_001",
    "name": "Price Objection",
    "description": "Customer believes the solution is overpriced and challenges its value.",
    "difficulty": "Medium",
    "personaIds": ["persona_001", "persona_002"],
    "scenarioGoals": [
      "Address price concerns",
      "Communicate ROI clearly",
      "Handle objections confidently",
      "Move toward next step"
    ],
    "suggestedSkillFocus": [
      "Objection Handling",
      "Value Communication",
      "Confidence"
    ],
    "scoring": {
      "weights": {
        "Discovery": 30,
        "ObjectionHandling": 40,
        "Closing": 30
      },
      "criteria": [
        {
          "id": "crit_001",
          "description": "Effectively addressed pricing concerns",
          "weight": 40
        },
        {
          "id": "crit_002",
          "description": "Explained value and ROI clearly",
          "weight": 30
        },
        {
          "id": "crit_003",
          "description": "Maintained control of the conversation",
          "weight": 30
        }
      ]
    },
    "voiceBehaviorOverrides": {
      "interruptFrequency": "Medium"
    },
    "createdAt": "2026-05-02T11:00:00Z",
    "updatedAt": "2026-05-02T11:00:00Z"
  },
  {
    "id": "scenario_002",
    "name": "Competitor Comparison",
    "description": "Customer compares your product with a competitor and questions differentiation.",
    "difficulty": "Hard",
    "personaIds": ["persona_001", "persona_003"],
    "scenarioGoals": [
      "Differentiate product clearly",
      "Highlight unique value",
      "Handle competitive pressure",
      "Build credibility"
    ],
    "suggestedSkillFocus": [
      "Positioning",
      "Competitive Selling",
      "Credibility Building"
    ],
    "scoring": {
      "weights": {
        "Discovery": 30,
        "ObjectionHandling": 40,
        "Closing": 30
      },
      "criteria": [
        {
          "id": "crit_004",
          "description": "Clearly differentiated from competitor",
          "weight": 40
        },
        {
          "id": "crit_005",
          "description": "Handled objections with confidence",
          "weight": 30
        },
        {
          "id": "crit_006",
          "description": "Built trust and credibility",
          "weight": 30
        }
      ]
    },
    "voiceBehaviorOverrides": {
      "toneStyle": "Challenging"
    },
    "createdAt": "2026-05-02T11:05:00Z",
    "updatedAt": "2026-05-02T11:05:00Z"
  },
  {
    "id": "scenario_003",
    "name": "Renewal Conversation",
    "description": "Customer is considering whether to renew their contract.",
    "difficulty": "Medium",
    "personaIds": ["persona_003", "persona_004"],
    "scenarioGoals": [
      "Reinforce product value",
      "Understand customer concerns",
      "Secure renewal commitment",
      "Strengthen relationship"
    ],
    "suggestedSkillFocus": [
      "Customer Retention",
      "Relationship Building",
      "Listening"
    ],
    "scoring": {
      "weights": {
        "Discovery": 40,
        "ObjectionHandling": 30,
        "Closing": 30
      },
      "criteria": [
        {
          "id": "crit_007",
          "description": "Understood customer concerns",
          "weight": 40
        },
        {
          "id": "crit_008",
          "description": "Reinforced product value",
          "weight": 30
        },
        {
          "id": "crit_009",
          "description": "Successfully guided toward renewal",
          "weight": 30
        }
      ]
    },
    "createdAt": "2026-05-02T11:10:00Z",
    "updatedAt": "2026-05-02T11:10:00Z"
  },
  {
    "id": "scenario_004",
    "name": "Upsell Opportunity",
    "description": "Customer is using a basic plan; opportunity to upsell premium features.",
    "difficulty": "Easy",
    "personaIds": ["persona_002", "persona_004"],
    "scenarioGoals": [
      "Identify upsell opportunity",
      "Communicate additional value",
      "Align solution with needs",
      "Close upsell"
    ],
    "suggestedSkillFocus": [
      "Upselling",
      "Value Selling",
      "Needs Discovery"
    ],
    "scoring": {
      "weights": {
        "Discovery": 40,
        "ObjectionHandling": 30,
        "Closing": 30
      },
      "criteria": [
        {
          "id": "crit_010",
          "description": "Identified upsell opportunity",
          "weight": 40
        },
        {
          "id": "crit_011",
          "description": "Clearly communicated additional value",
          "weight": 30
        },
        {
          "id": "crit_012",
          "description": "Successfully attempted upsell",
          "weight": 30
        }
      ]
    },
    "voiceBehaviorOverrides": {
      "speakingPace": "Fast"
    },
    "createdAt": "2026-05-02T11:15:00Z",
    "updatedAt": "2026-05-02T11:15:00Z"
  }
];

export const mockPersonas: Persona[] = [
  {
    "id": "persona_001",
    "name": "Skeptical Decision Maker",
    "behaviorNotes": "A cautious persona who questions value and ROI, challenges assumptions, and seeks proof.",
    "traits": [
      "Skeptical",
      "Detail-oriented",
      "Risk-averse",
      "Needs data"
    ],
    "voiceBehavior": {
      "speakingPace": "Moderate",
      "toneStyle": "Professional",
      "interruptFrequency": "Low"
    },
    "createdAt": "2026-05-02T10:00:00Z",
    "updatedAt": "2026-05-02T10:00:00Z"
  },
  {
    "id": "persona_002",
    "name": "Rushed Buyer",
    "behaviorNotes": "A persona who wants quick answers, often interrupts, and is focused on speed over details.",
    "traits": [
      "Rushed",
      "Impatient",
      "Time-sensitive",
      "High-pressure"
    ],
    "voiceBehavior": {
      "speakingPace": "Fast",
      "toneStyle": "Direct",
      "interruptFrequency": "High"
    },
    "createdAt": "2026-05-02T10:05:00Z",
    "updatedAt": "2026-05-02T10:05:00Z"
  },
  {
    "id": "persona_003",
    "name": "Detail-Oriented Analyst",
    "behaviorNotes": "A meticulous persona who asks many clarifying questions and requires precise explanations.",
    "traits": [
      "Detail-oriented",
      "Analytical",
      "Methodical",
      "Needs examples"
    ],
    "voiceBehavior": {
      "speakingPace": "Slow",
      "toneStyle": "Formal",
      "interruptFrequency": "Low"
    },
    "createdAt": "2026-05-02T10:10:00Z",
    "updatedAt": "2026-05-02T10:10:00Z"
  },
  {
    "id": "persona_004",
    "name": "Friendly but Indecisive",
    "behaviorNotes": "A persona who is polite and cooperative but struggles to make decisions quickly.",
    "traits": [
      "Friendly",
      "Indecisive",
      "Cooperative",
      "Hesitant"
    ],
    "voiceBehavior": {
      "speakingPace": "Moderate",
      "toneStyle": "Casual",
      "interruptFrequency": "Low"
    },
    "createdAt": "2026-05-02T10:15:00Z",
    "updatedAt": "2026-05-02T10:15:00Z"
  }
];
