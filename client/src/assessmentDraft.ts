import {
  clearAssessmentDraftCloud,
  getAssessmentDraftCloud,
  getCurrentAssessment,
  getQuestions,
  getStoredToken,
  saveAssessment,
  saveAssessmentDraftCloud,
  startAssessment,
  submitAssessment,
} from "./api";
import type { AnswerInput, AssessmentMetadataInput } from "./types";

const GUEST_ASSESSMENT_DRAFT_KEY = "corelife_guest_assessment_draft";

type Step1Draft = {
  age?: string;
  primaryGoal?: string;
  selectedAreas?: string[];
};

type Step2Draft = {
  questionScores?: Record<string, number>;
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

type SyncGuestDraftOptions = {
  completeAssessment?: boolean;
};

const LIFE_AREA_VALUE_TO_ID: Record<string, number> = {
  health: 1,
  appearance: 2,
  love: 3,
  family: 4,
  friends: 5,
  career: 6,
  money: 7,
  "self-growth": 8,
  spirituality: 9,
  recreation: 10,
  environment: 11,
  community: 12,
  // Backward compatibility for older draft values.
  "health-fitness": 1,
  mindset: 8,
  "career-work": 6,
  finance: 7,
  relationships: 3,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeStep(value: unknown, fallback: 1 | 2 | 3 = 1): 1 | 2 | 3 {
  const numeric = Number(value);
  return numeric === 1 || numeric === 2 || numeric === 3 ? numeric : fallback;
}

function normalizeSavedAt(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : "";
  const timestamp = Date.parse(raw);
  if (Number.isNaN(timestamp)) {
    return new Date().toISOString();
  }
  return new Date(timestamp).toISOString();
}

function normalizeDraft(payload: unknown): GuestAssessmentDraft | null {
  if (!isRecord(payload)) return null;

  const step1Raw = isRecord(payload.step1) ? payload.step1 : null;
  const step2Raw = isRecord(payload.step2) ? payload.step2 : null;
  const step3Raw = isRecord(payload.step3) ? payload.step3 : null;

  const step1 = step1Raw
    ? {
        age: typeof step1Raw.age === "string" ? step1Raw.age.trim() : undefined,
        primaryGoal:
          typeof step1Raw.primaryGoal === "string"
            ? step1Raw.primaryGoal.trim()
            : undefined,
        selectedAreas: Array.isArray(step1Raw.selectedAreas)
          ? step1Raw.selectedAreas
              .map((value) => String(value).trim())
              .filter(Boolean)
          : undefined,
      }
    : undefined;

  const step2 = step2Raw
    ? {
        questionScores: isRecord(step2Raw.questionScores)
          ? Object.entries(step2Raw.questionScores).reduce<
              Record<string, number>
            >((acc, [questionId, score]) => {
              const numericQuestionId = Number(questionId);
              const numericScore = Number(score);

              if (
                Number.isInteger(numericQuestionId) &&
                Number.isInteger(numericScore) &&
                numericScore >= 1 &&
                numericScore <= 5
              ) {
                acc[String(numericQuestionId)] = numericScore;
              }

              return acc;
            }, {})
          : undefined,
      }
    : undefined;

  const step3 = step3Raw
    ? {
        confidence:
          Number(step3Raw.confidence) >= 1 && Number(step3Raw.confidence) <= 10
            ? Number(step3Raw.confidence)
            : undefined,
        priorities: Array.isArray(step3Raw.priorities)
          ? step3Raw.priorities
              .map((value) => String(value).trim())
              .filter(Boolean)
          : undefined,
        timeCommitment:
          typeof step3Raw.timeCommitment === "string"
            ? step3Raw.timeCommitment.trim()
            : undefined,
      }
    : undefined;

  return {
    step: normalizeStep(payload.step),
    route:
      typeof payload.route === "string" && payload.route.trim()
        ? payload.route.trim()
        : "/assessment",
    savedAt: normalizeSavedAt(payload.savedAt),
    ...(step1 ? { step1 } : {}),
    ...(step2 ? { step2 } : {}),
    ...(step3 ? { step3 } : {}),
  };
}

function mergeDrafts(
  current: GuestAssessmentDraft | null,
  partial: GuestAssessmentDraft,
): GuestAssessmentDraft {
  return {
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
}

function draftTimestamp(draft: GuestAssessmentDraft | null) {
  if (!draft?.savedAt) return 0;
  const timestamp = Date.parse(draft.savedAt);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

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
  const merged = mergeDrafts(current, {
    ...partial,
    savedAt: normalizeSavedAt(partial.savedAt),
  });

  localStorage.setItem(GUEST_ASSESSMENT_DRAFT_KEY, JSON.stringify(merged));
  return merged;
}

export function clearGuestAssessmentDraft() {
  localStorage.removeItem(GUEST_ASSESSMENT_DRAFT_KEY);
}

export async function getAssessmentDraft() {
  const localDraft = readRawDraft();
  const token = getStoredToken();

  if (!token) {
    return localDraft;
  }

  try {
    const { draft } = await getAssessmentDraftCloud();
    const cloudDraft = normalizeDraft(draft);

    if (!cloudDraft) {
      return localDraft;
    }

    if (
      !localDraft ||
      draftTimestamp(cloudDraft) >= draftTimestamp(localDraft)
    ) {
      localStorage.setItem(
        GUEST_ASSESSMENT_DRAFT_KEY,
        JSON.stringify(cloudDraft),
      );
      return cloudDraft;
    }

    await saveAssessmentDraftCloud(
      localDraft as unknown as Record<string, unknown>,
    );
    return localDraft;
  } catch {
    return localDraft;
  }
}

export async function saveAssessmentDraft(partial: GuestAssessmentDraft) {
  const merged = saveGuestAssessmentDraft(partial);
  const token = getStoredToken();
  if (!token) return merged;

  try {
    await saveAssessmentDraftCloud(
      merged as unknown as Record<string, unknown>,
    );
  } catch {
    // Keep local draft as fallback when cloud save fails.
  }

  return merged;
}

export async function clearAssessmentDraft() {
  clearGuestAssessmentDraft();

  const token = getStoredToken();
  if (!token) return;

  try {
    await clearAssessmentDraftCloud();
  } catch {
    // Ignore cloud clear failures during local cleanup.
  }
}

export function getSelectedAreaIdsFromDraft(
  draft: GuestAssessmentDraft | null,
) {
  const selectedAreas = draft?.step1?.selectedAreas ?? [];
  const ids = selectedAreas
    .map((value) => LIFE_AREA_VALUE_TO_ID[String(value).trim().toLowerCase()])
    .filter((value): value is number => Number.isInteger(value));

  return [...new Set(ids)];
}

function buildAnswerInputsFromDraft(
  questionByArea: Map<number, number[]>,
  draft: GuestAssessmentDraft,
  includeAllAreas = false,
): AnswerInput[] {
  const selectedAreaIds = getSelectedAreaIdsFromDraft(draft);
  const scoreByQuestionId = new Map<number, number>();
  const rawScores = draft.step2?.questionScores ?? {};

  for (const [questionId, score] of Object.entries(rawScores)) {
    const numericQuestionId = Number(questionId);
    const numericScore = Number(score);
    if (
      Number.isInteger(numericQuestionId) &&
      Number.isInteger(numericScore) &&
      numericScore >= 1 &&
      numericScore <= 5
    ) {
      scoreByQuestionId.set(numericQuestionId, numericScore);
    }
  }

  const answers: AnswerInput[] = [];

  if (includeAllAreas) {
    for (const questionIds of questionByArea.values()) {
      for (const questionId of questionIds) {
        answers.push({
          question_id: questionId,
          score: scoreByQuestionId.get(questionId) ?? 3,
        });
      }
    }
    return answers;
  }

  for (const areaId of selectedAreaIds) {
    const questionIds = questionByArea.get(areaId) ?? [];
    for (const questionId of questionIds) {
      const score = scoreByQuestionId.get(questionId);
      if (!score) continue;
      answers.push({ question_id: questionId, score });
    }
  }

  return answers;
}

function buildAssessmentMetadataFromDraft(
  draft: GuestAssessmentDraft,
): AssessmentMetadataInput | null {
  const metadata: AssessmentMetadataInput = {};
  let hasMetadata = false;

  if (typeof draft.step1?.age === "string") {
    const age = Number(draft.step1.age.trim());
    if (Number.isInteger(age) && age > 0) {
      metadata.age = age;
      hasMetadata = true;
    }
  }

  if (typeof draft.step1?.primaryGoal === "string") {
    metadata.primaryGoal = draft.step1.primaryGoal.trim() || null;
    hasMetadata = true;
  }

  if (Array.isArray(draft.step1?.selectedAreas)) {
    metadata.selectedAreaIds = getSelectedAreaIdsFromDraft(draft);
    hasMetadata = true;
  }

  if (typeof draft.step3?.confidence === "number") {
    const confidence = Number(draft.step3.confidence);
    if (Number.isInteger(confidence) && confidence >= 1 && confidence <= 10) {
      metadata.confidence = confidence;
      hasMetadata = true;
    }
  }

  if (Array.isArray(draft.step3?.priorities)) {
    metadata.priorities = [...new Set(draft.step3.priorities)]
      .map((value) => String(value).trim())
      .filter(Boolean);
    hasMetadata = true;
  }

  if (typeof draft.step3?.timeCommitment === "string") {
    const timeCommitmentMinutes = Number(draft.step3.timeCommitment.trim());
    metadata.timeCommitmentMinutes =
      Number.isInteger(timeCommitmentMinutes) && timeCommitmentMinutes > 0
        ? timeCommitmentMinutes
        : null;
    hasMetadata = true;
  }

  return hasMetadata ? metadata : null;
}

export async function syncGuestDraftToAccount(
  options: SyncGuestDraftOptions = {},
) {
  const token = getStoredToken();
  if (!token) return;

  const draft = await getAssessmentDraft();
  if (!draft) return;

  const shouldCompleteAssessment =
    Boolean(options.completeAssessment) && draft.step === 3;

  const { questions } = await getQuestions();

  const questionByArea = new Map<number, number[]>();
  for (const q of questions) {
    const existing = questionByArea.get(q.life_area_id) ?? [];
    existing.push(q.id);
    questionByArea.set(q.life_area_id, existing);
  }

  const answers = buildAnswerInputsFromDraft(
    questionByArea,
    draft,
    shouldCompleteAssessment,
  );
  const assessmentMeta = buildAssessmentMetadataFromDraft(draft);
  const shouldPersistMetadata = Boolean(assessmentMeta);

  if (
    answers.length === 0 &&
    !shouldCompleteAssessment &&
    !shouldPersistMetadata
  ) {
    return;
  }

  const { session } = await getCurrentAssessment();

  let targetSession = session;
  if (!targetSession) {
    targetSession = (await startAssessment()).session;
  }

  if (answers.length > 0 || shouldPersistMetadata) {
    await saveAssessment(
      targetSession.id,
      answers,
      assessmentMeta ?? undefined,
    );
  }

  if (shouldCompleteAssessment) {
    await submitAssessment(targetSession.id, assessmentMeta ?? undefined);
    await clearAssessmentDraft();
  }
}
