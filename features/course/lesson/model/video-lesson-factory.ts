import { createPendingLessonCoach } from "./content-helpers";
import {
  type ArtifactContract,
  type BlockId,
  type LessonConfig,
  type LessonContent,
  type LessonPromptImport,
  type LessonResourceContent,
  type LessonUnlockTargets,
  splitPanelDefaults,
  type WorkbenchField,
  type WorkbenchSection,
  type WorkbenchType,
} from "./contracts";

type VideoLessonSeed = {
  id: string;
  slug: string;
  order: number;
  block: BlockId;
  title: string;
  shortTitle: string;
  prevLessonId?: string;
  nextLessonId?: string;
  unlockBlocks?: BlockId[];
  helperText?: string;
  intro?: string;
  /** Overrides default video-first lessonMeta when set. */
  lessonMeta?: Partial<
    Pick<LessonContent["lessonMeta"], "goal" | "purpose" | "runtimeLabel">
  >;
  teachingPoints?: string[];
  pinnedArtifacts?: string[];
  coachResources?: LessonResourceContent[];
  workbenchFields?: WorkbenchField[];
  workbenchSections?: WorkbenchSection[];
  promptImport?: LessonPromptImport;
  artifact?: Partial<
    Pick<
      ArtifactContract,
      "key" | "label" | "type" | "contextTitle" | "required"
    >
  >;
  objectiveTitle?: string;
  winCondition?: string;
  checklist?: string[];
  actionJobNow?: string;
  actionTimebox?: string;
  actionComeBackWith?: string;
  workbenchPrompt?: string;
  workbenchEmptyState?: string;
  /** Defaults to `guided_form` (1.1–1.5 baseline). */
  workbench?: WorkbenchType;
  fieldShapeVersion?: number;
  /** Defaults to true (coach video must be ready for completion). */
  requireReadyVideoForCompletion?: boolean;
};

export function createVideoLesson({
  id,
  slug,
  order,
  block,
  title,
  shortTitle,
  prevLessonId,
  nextLessonId,
  unlockBlocks,
  helperText,
  intro,
  lessonMeta: lessonMetaOverride,
  teachingPoints,
  pinnedArtifacts,
  coachResources = [],
  workbenchFields = [],
  workbenchSections,
  promptImport,
  artifact: artifactOverride,
  objectiveTitle: objectiveTitleOverride,
  winCondition: winConditionOverride,
  checklist: checklistOverride,
  actionJobNow,
  actionTimebox,
  actionComeBackWith,
  workbenchPrompt,
  workbenchEmptyState,
  workbench: workbenchOverride,
  fieldShapeVersion,
  requireReadyVideoForCompletion: requireReadyVideoOverride,
}: VideoLessonSeed): LessonConfig {
  const unlocks: LessonUnlockTargets | undefined =
    nextLessonId || unlockBlocks?.length
      ? {
          ...(nextLessonId ? { lessons: [nextLessonId] } : {}),
          ...(unlockBlocks?.length ? { blocks: unlockBlocks } : {}),
        }
      : undefined;

  const defaultArtifact: ArtifactContract = {
    key: `lesson_${id.replace(/\./g, "_")}_video`,
    label: `${title} Video`,
    type: "video",
    required: false,
  };

  return {
    id,
    slug,
    order,
    block,
    title,
    shortTitle,
    shell: "split",
    availableLayoutModes: ["focus"],
    workbench: workbenchOverride ?? "guided_form",
    artifact: { ...defaultArtifact, ...artifactOverride },
    nextLessonId,
    prevLessonId,
    unlocks,
    coachMode: "docked",
    coachVideoPlacement: "workbench",
    workbenchMediaLayout: "split",
    objectiveTitle: objectiveTitleOverride ?? `${block} ${id} — ${title}`,
    checklist: checklistOverride ?? [
      "Watch the lesson",
      "Capture the key move",
      "Move to the next step",
    ],
    helperText:
      helperText ??
      "Watch the walkthrough, take the core move, and keep going.",
    winCondition:
      winConditionOverride ?? `The ${title} walkthrough is complete.`,
    panelDefaults: splitPanelDefaults,
    ...(pinnedArtifacts?.length ? { pinnedArtifacts } : {}),
    workbenchFields,
    ...(workbenchSections?.length ? { workbenchSections } : {}),
    ...(promptImport ? { promptImport } : {}),
    ...(fieldShapeVersion !== undefined ? { fieldShapeVersion } : {}),
    requireReadyVideoForCompletion: requireReadyVideoOverride ?? true,
    content: {
      status: "ready",
      intro:
        intro ??
        `Watch ${title}, pull the key move forward, and keep momentum.`,
      lessonMeta: {
        goal:
          lessonMetaOverride?.goal ??
          `Understand ${title} well enough to keep moving.`,
        purpose:
          lessonMetaOverride?.purpose ??
          "This step is video-first. The goal is to transfer the lesson cleanly without extra in-product ceremony.",
        ...(lessonMetaOverride?.runtimeLabel
          ? { runtimeLabel: lessonMetaOverride.runtimeLabel }
          : {}),
      },
      actionCard: {
        jobNow: actionJobNow ?? `Watch ${title} and keep moving.`,
        timebox: actionTimebox ?? "5-10 minutes",
        comeBackWith: actionComeBackWith ?? `A clear read on ${title}.`,
      },
      coach: createPendingLessonCoach({
        title,
        resources: coachResources,
      }),
      workbench: {
        prompt:
          workbenchPrompt ??
          `Watch ${title} and move directly to the next lesson.`,
        teachingPoints: teachingPoints ?? [
          "Pull one concrete move from the walkthrough.",
          "Do not over-process the lesson.",
          "Keep momentum into the next step.",
        ],
        emptyState: workbenchEmptyState ?? `Watch ${title} and keep moving.`,
      },
    },
  };
}
