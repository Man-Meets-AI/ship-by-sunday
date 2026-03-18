export * from "./contracts";

import { routeConfig } from "@/config/product";
import type { BlockConfig, LessonLayoutMode, LessonConfig } from "./contracts";
import { buildLessons } from "./lessons/build";
import { ceoLessons } from "./lessons/ceo";
import { designLessons } from "./lessons/design";
import { shipLessons } from "./lessons/ship";
import { startHereLessons } from "./lessons/start-here";
import { attachGeneratedLessonMedia } from "./video";

export const blocks: BlockConfig[] = [
	{
		id: "CEO",
		label: "CEO",
		level: 1,
		summary: "Choose the problem, user, outcome, and scope before you build.",
		order: 1,
		startsLocked: false,
	},
	{
		id: "DESIGN",
		label: "DESIGN",
		level: 2,
		summary: "Turn the idea into a buildable first version.",
		order: 2,
		startsLocked: true,
	},
	{
		id: "BUILD",
		label: "BUILD",
		level: 3,
		summary: "Make the core flow work locally without spiraling.",
		order: 3,
		startsLocked: true,
	},
	{
		id: "SHIP",
		label: "SHIP",
		level: 4,
		summary: "Get the app live, send it, and capture real feedback.",
		order: 4,
		startsLocked: true,
	},
];

const baseLessonRegistry: LessonConfig[] = [
	...startHereLessons,
	...ceoLessons,
	...designLessons,
	...buildLessons,
	...shipLessons,
];

export const lessonRegistry: LessonConfig[] = baseLessonRegistry.map(
	attachGeneratedLessonMedia,
);

export const lessonIndex = Object.fromEntries(
	lessonRegistry.map((lesson) => [lesson.id, lesson]),
) as Record<string, LessonConfig>;

export function getLesson(id: string): LessonConfig | undefined {
	return lessonIndex[id];
}

export function getLessonHref(id: string): string {
	return id === "0.0" ? routeConfig.mission : `/lesson/${id}`;
}

const DEFAULT_LESSON_LAYOUT_MODES = [
	"split",
	"focus",
] as const satisfies readonly LessonLayoutMode[];
const WATCH_LESSON_LAYOUT_MODES = [
	"focus",
] as const satisfies readonly LessonLayoutMode[];

export function getAvailableLayoutModesForLesson(
	lesson: Pick<LessonConfig, "availableLayoutModes" | "shell">,
): LessonLayoutMode[] {
	if (lesson.shell === "watch" && !lesson.availableLayoutModes?.length) {
		return [...WATCH_LESSON_LAYOUT_MODES];
	}

	return lesson.availableLayoutModes?.length
		? [...lesson.availableLayoutModes]
		: [...DEFAULT_LESSON_LAYOUT_MODES];
}

export function getDefaultLayoutModeForLesson(
	lesson: Pick<LessonConfig, "availableLayoutModes" | "shell">,
): LessonLayoutMode {
	const availableLayoutModes = getAvailableLayoutModesForLesson(lesson);
	const preferredLayoutMode =
		lesson.shell === "focus" || lesson.shell === "watch" ? "focus" : "split";

	return availableLayoutModes.includes(preferredLayoutMode)
		? preferredLayoutMode
		: (availableLayoutModes[0] ?? "split");
}

export function normalizeLayoutModeForLesson(
	lesson: Pick<LessonConfig, "availableLayoutModes" | "shell">,
	layoutMode: unknown,
): LessonLayoutMode {
	if (layoutMode === "split" || layoutMode === "focus") {
		return getAvailableLayoutModesForLesson(lesson).includes(layoutMode)
			? layoutMode
			: getDefaultLayoutModeForLesson(lesson);
	}

	return getDefaultLayoutModeForLesson(lesson);
}

export function lessonSupportsLayoutToggle(
	lesson: Pick<LessonConfig, "availableLayoutModes" | "shell">,
): boolean {
	return getAvailableLayoutModesForLesson(lesson).length > 1;
}
