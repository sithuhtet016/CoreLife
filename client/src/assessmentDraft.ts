import {
  getCurrentAssessment,
  getQuestions,
  getStoredToken,
  saveAssessment,
  startAssessment,
} from "./api";
import type { AnswerInput } from "./types";

const GUEST_ASSESSMENT_DRAFT_KEY = "corelife_guest_assessment_draft";

type Step1Draft = {
  age?: string;
  primaryGoal?: string;
  selectedAreas?: string[];
};

type Step2Draft = {
  health?: number;
  mindset?: number;
  career?: number;
};

type Step3Draft = {
  confidence?: number;
  priorities?: string[];
  timeCommitment?: string;
};

export type GuestAssessmentDraft = {
  step: 1 | 2 | 3;
  route: string;
  savedAt: string;
  step1?: Step1Draft;
  step2?: Step2Draft;
  step3?: Step3Draft;
};

function readRawDraft(): GuestAssessmentDraft | null {
  const raw = localStorage.getItem(GUEST_ASSESSMENT_DRAFT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as GuestAssessmentDraft;
  } catch {
    return null;
  }
}

export function getGuestAssessmentDraft() {
  return readRawDraft();
}

export function saveGuestAssessmentDraft(partial: GuestAssessmentDraft) {
  const current = readRawDraft();
  const merged: GuestAssessmentDraft = {
    ...(current ?? {}),
    ...partial,
    step1: {
      ...(current?.step1 ?? {}),
      ...(partial.step1 ?? {}),
    },
    step2: {
      ...(current?.step2 ?? {}),
      ...(partial.step2 ?? {}),
    },
    step3: {
      ...(current?.step3 ?? {}),
      ...(partial.step3 ?? {}),
    },
  } as GuestAssessmentDraft;

  localStorage.setItem(GUEST_ASSESSMENT_DRAFT_KEY, JSON.stringify(merged));
}

export function clearGuestAssessmentDraft() {
  localStorage.removeItem(GUEST_ASSESSMENT_DRAFT_KEY);
}

function buildAnswerInputsFromDraft(
  questionByArea: Map<number, number[]>,
  draft: GuestAssessmentDraft,
): AnswerInput[] {
  const answers: AnswerInput[] = [];
  const step2 = draft.step2;
  if (!step2) return answers;

  const areaScorePairs: Array<{ areaId: number; score?: number }> = [
    { areaId: 1, score: step2.health },
    { areaId: 8, score: step2.mindset },
    { areaId: 6, score: step2.career },
  ];

  for (const pair of areaScorePairs) {
    if (!pair.score || pair.score < 1 || pair.score > 5) continue;
    const questionIds = questionByArea.get(pair.areaId) ?? [];
    for (const questionId of questionIds) {
      answers.push({ question_id: questionId, score: pair.score });
    }
  }

  return answers;
}

export async function syncGuestDraftToAccount() {
  const token = getStoredToken();
  const draft = getGuestAssessmentDraft();
  if (!token || !draft) return;

  const [{ session }, { questions }] = await Promise.all([
    getCurrentAssessment(),
    getQuestions(),
  ]);

  const questionByArea = new Map<number, number[]>();
  for (const q of questions) {
    const existing = questionByArea.get(q.life_area_id) ?? [];
    existing.push(q.id);
    questionByArea.set(q.life_area_id, existing);
  }

  let targetSession = session;
  if (!targetSession) {
    targetSession = (await startAssessment()).session;
  }

  const answers = buildAnswerInputsFromDraft(questionByArea, draft);
  if (answers.length > 0) {
    await saveAssessment(targetSession.id, answers);
  }

  clearGuestAssessmentDraft();
}
