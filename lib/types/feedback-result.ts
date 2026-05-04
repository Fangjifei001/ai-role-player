/** Structured coaching output for a completed role-play session (AI `/api/feedback` JSON). */

export type FeedbackHighlightMomentType = "good" | "bad";

export type FeedbackResultSummary = {
  overallAssessment: string;
  score: number;
};

export type FeedbackResultCoachingTip = {
  title: string;
  description: string;
};

export type FeedbackResultHighlightMoment = {
  type: FeedbackHighlightMomentType;
  message: string;
  feedback: string;
  /** Seconds from session start, Unix ms, or another numeric timeline — callers should document convention. */
  timestamp: number;
};

export type FeedbackResult = {
  summary: FeedbackResultSummary;
  strengths: string[];
  improvements: string[];
  coachingTips: FeedbackResultCoachingTip[];
  highlightMoments: FeedbackResultHighlightMoment[];
};
