import type { AssessmentSession, LifeArea } from "../types";

export type AreaScoreSummary = {
  id: number;
  name: string;
  score: number;
};

export function getLatestSession(sessions: AssessmentSession[]) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return null;
  }
  return sessions[sessions.length - 1] ?? null;
}

export function computeOverallScore(session: AssessmentSession | null) {
  if (!session) return null;
  const selectedIds = new Set(
    (session.selected_area_ids ?? []).map((id) => Number(id)),
  );
  if (selectedIds.size === 0 && typeof session.overall_score === "number") {
    return session.overall_score;
  }
  const entries = Object.entries(session.area_scores ?? {});
  const values = entries
    .filter(([key]) =>
      selectedIds.size === 0 ? true : selectedIds.has(Number(key)),
    )
    .map(([, value]) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildAreaScoreSummaries(
  session: AssessmentSession | null,
  lifeAreas: LifeArea[],
): AreaScoreSummary[] {
  if (!session || lifeAreas.length === 0) return [];
  const scores = session.area_scores ?? {};
  const selectedIds = new Set(
    (session.selected_area_ids ?? []).map((id) => Number(id)),
  );

  return lifeAreas
    .filter((area) =>
      selectedIds.size === 0 ? true : selectedIds.has(Number(area.id)),
    )
    .map((area) => {
      const rawScore = (scores as Record<string, number>)[String(area.id)];
      const numericScore = Number(rawScore);
      if (!Number.isFinite(numericScore)) {
        return null;
      }
      return {
        id: area.id,
        name: area.name,
        score: numericScore,
      };
    })
    .filter((area): area is AreaScoreSummary => Boolean(area));
}

export function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
