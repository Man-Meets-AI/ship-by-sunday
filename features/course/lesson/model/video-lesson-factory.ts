import { createPendingLessonCoach } from "./content-helpers";
import {
	focusPanelDefaults,
	type BlockId,
	type LessonConfig,
	type LessonUnlockTargets,
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
}: VideoLessonSeed): LessonConfig {
	const unlocks: LessonUnlockTargets | undefined =
		nextLessonId || unlockBlocks?.length
			? {
					...(nextLessonId ? { lessons: [nextLessonId] } : {}),
					...(unlockBlocks?.length ? { blocks: unlockBlocks } : {}),
				}
			: undefined;

	return {
		id,
		slug,
		order,
		block,
		title,
		shortTitle,
		shell: "watch",
		workbench: "external_workspace",
		artifact: {
			key: `lesson_${id.replace(/\./g, "_")}_video`,
			label: `${title} Video`,
			type: "video",
			required: false,
		},
		nextLessonId,
		prevLessonId,
		unlocks,
		coachMode: "pip",
		objectiveTitle: `${block} ${id} — ${title}`,
		checklist: [
			"Watch the lesson",
			"Capture the key move",
			"Move to the next step",
		],
		helperText:
			helperText ??
			"Watch the walkthrough, take the core move, and keep going.",
		winCondition: `The ${title} walkthrough is complete.`,
		panelDefaults: focusPanelDefaults,
		workbenchFields: [],
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
				jobNow: `Watch ${title} and keep moving.`,
				timebox: "5-10 minutes",
				comeBackWith: `A clear read on ${title}.`,
			},
			coach: createPendingLessonCoach({
				title,
				resources: [],
			}),
			workbench: {
				prompt: `Watch ${title} and move directly to the next lesson.`,
				teachingPoints: teachingPoints ?? [
					"Pull one concrete move from the walkthrough.",
					"Do not over-process the lesson.",
					"Keep momentum into the next step.",
				],
				emptyState: `Watch ${title} and keep moving.`,
			},
		},
	};
}
