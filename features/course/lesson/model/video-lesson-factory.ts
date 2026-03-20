import { createPendingLessonCoach } from "./content-helpers";
import {
	type ArtifactContract,
	type BlockId,
	focusPanelDefaults,
	type LessonConfig,
	type LessonPromptImport,
	type LessonResourceContent,
	type LessonUnlockTargets,
	type WorkbenchField,
	type WorkbenchSection,
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
		shell: "watch",
		workbench: "external_workspace",
		artifact: { ...defaultArtifact, ...artifactOverride },
		nextLessonId,
		prevLessonId,
		unlocks,
		coachMode: "pip",
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
		panelDefaults: focusPanelDefaults,
		...(pinnedArtifacts?.length ? { pinnedArtifacts } : {}),
		workbenchFields,
		...(workbenchSections?.length ? { workbenchSections } : {}),
		...(promptImport ? { promptImport } : {}),
		requireReadyVideoForCompletion: true,
		content: {
			status: "ready",
			intro:
				intro ??
				`Watch ${title}, pull the key move forward, and keep momentum.`,
			lessonMeta: {
				goal: `Understand ${title} well enough to keep moving.`,
				purpose:
					"This step is video-first. The goal is to transfer the lesson cleanly without extra in-product ceremony.",
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
