/**
 * Serialized when leaving `/session` so `/feedback` can call the coach API without relying on Zustand.
 */
export const FEEDBACK_SNAPSHOT_STORAGE_KEY = "ai-role-player:feedback-snapshot-v1";

export type FeedbackSessionSnapshot = {
  scenarioName: string;
  personaName: string;
  scenarioDescription: string;
  scenarioGoals: string[];
  personaDescription: string;
  transcript: string;
  durationLabel: string;
  dateLabel: string;
};

export function readFeedbackSnapshotFromSessionStorage(): FeedbackSessionSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(FEEDBACK_SNAPSHOT_STORAGE_KEY);
  if (!raw?.trim()) return null;
  try {
    const v = JSON.parse(raw) as FeedbackSessionSnapshot;
    if (
      typeof v?.scenarioDescription !== "string" ||
      typeof v?.personaDescription !== "string" ||
      typeof v?.transcript !== "string" ||
      !Array.isArray(v?.scenarioGoals)
    ) {
      return null;
    }
    return {
      scenarioName: typeof v.scenarioName === "string" ? v.scenarioName : "Scenario",
      personaName: typeof v.personaName === "string" ? v.personaName : "Persona",
      scenarioDescription: v.scenarioDescription,
      scenarioGoals: v.scenarioGoals.filter((g): g is string => typeof g === "string"),
      personaDescription: v.personaDescription,
      transcript: v.transcript,
      durationLabel: typeof v.durationLabel === "string" ? v.durationLabel : "—",
      dateLabel: typeof v.dateLabel === "string" ? v.dateLabel : "",
    };
  } catch {
    return null;
  }
}

export function writeFeedbackSnapshotToSessionStorage(snapshot: FeedbackSessionSnapshot): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(FEEDBACK_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
}

export function clearFeedbackSnapshotFromSessionStorage(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(FEEDBACK_SNAPSHOT_STORAGE_KEY);
}
