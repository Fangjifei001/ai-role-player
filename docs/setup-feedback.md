## STEP 0 — Build the UI structure
You are helping me build a Feedback page for an AI role play app.

Tech stack:
- React + TypeScript
- Zustand
- TailwindCSS

Goal:
Create a Feedback page layout.

Requirements:
- Clean SaaS-style UI
- Same style as Session page (minimal, card-based)
- Please refer the attachment for the UI

Layout:
1. Header:
   - "Session Feedback"
   - Scenario | Persona | Duration

2. Main sections:
   - Overall Score + Summary
   - Strengths (left)
   - Improvements (right)
   - Coaching Tips
   - Highlight Moments

3. Footer:
   - Export button

Do NOT implement data logic yet.
Use placeholder data only.
Focus on layout and spacing.
Keep code modular and production-ready.
Avoid unnecessary abstraction.

## STEP 1 — Define TypeScript typs
Now define TypeScript types for the feedback data.

Requirements:

Create a type "FeedbackResult" with:

- summary:
  - overallAssessment: string
  - score: number

- strengths: string[]

- improvements: string[]

- coachingTips:
  - title: string
  - description: string

- highlightMoments:
  - type: "good" | "bad"
  - message: string
  - feedback: string
  - timestamp: number

Make sure types are reusable and clean.

Do NOT create components yet.

Keep code modular and production-ready.
Avoid unnecessary abstraction.

## Step 2 - Create test data
Now create a mock feedback object using the FeedbackResult type.

Requirements:
- realistic content (sales coaching style)
- include at least:
  - 3 strengths
  - 3 improvements
  - 3 coaching tips
  - 3 highlight moments

Export it so UI can use it.

Do NOT hardcode inside components.

## Step 3 - Split components and assemble page
Now split components and assemble the full Feedback page.

Split the pages to components:
- FeedbackSummary
- FeedbackList
- CoachingTips
- HighlightMoments

Assemble the components and verify the page.

Ensure:
- don't change the exit layout and style

Do NOT add API yet.

## Step 3 - Integrate with real AI
Now integrate API data.

You need to get the feedback from real AI.
- Create a function to build the AI prompt
- The prompt should contains all following content
"
You are an expert sales coach evaluating a role-play conversation.
Your task is to analyze the salesperson's performance and provide structured, actionable feedback.
Be specific, concise, and practical.
Do NOT give generic advice.
Do NOT repeat the transcript.

SCENARIO:
{{scenario.description}}

PERSONA:
{{persona.description}}

GOALS:
{{scenario.scenarioGoals}}

TRANSCRIPT:
{{full_transcript}}

Return your response in STRICT JSON format.
You must include:
1. Overall assessment (short paragraph)
2. Score (0–100)
3. Strengths (2–4 items)
4. Improvements (2–4 items)
5. Coaching tips (actionable, specific)
6. At least 3 highlighted moments:
   - include exact user message
   - label as "good" or "bad"
   - explain why

Focus on:
- objection handling
- clarity
- questioning
- closing ability

Avoid vague phrases like:
"do better", "improve communication"
"

Replace mock data with API response.

Add:
- loading state
- error state

Do NOT change UI structure.
Keep code modular and production-ready.
Avoid unnecessary abstraction.