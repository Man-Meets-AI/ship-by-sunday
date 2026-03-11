export * from "./contracts";

import type {
	BlockConfig,
	BlockId,
	CoachMode,
	LessonConfig,
	ShellType,
} from "./contracts";
import { buildLessons } from "./lessons/build";
import { ceoLessons } from "./lessons/ceo";
import { designLessons } from "./lessons/design";
import { shipLessons } from "./lessons/ship";
import { startHereLessons } from "./lessons/start-here";

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

export const lessonRegistry: LessonConfig[] = [
	...startHereLessons,
	...ceoLessons,
	...designLessons,
	...buildLessons,
	...shipLessons,
];

export const lessonIndex = Object.fromEntries(
	lessonRegistry.map((lesson) => [lesson.id, lesson]),
) as Record<string, LessonConfig>;

export function getLesson(id: string): LessonConfig | undefined {
	return lessonIndex[id];
}

export function getLessonsByBlock(block: BlockId): LessonConfig[] {
	return lessonRegistry.filter((lesson) => lesson.block === block);
}

export function getNextLesson(id: string): LessonConfig | undefined {
	const lesson = getLesson(id);
	return lesson?.nextLessonId ? getLesson(lesson.nextLessonId) : undefined;
}

export function getPreviousLesson(id: string): LessonConfig | undefined {
	const lesson = getLesson(id);
	return lesson?.prevLessonId ? getLesson(lesson.prevLessonId) : undefined;
}

export function getLessonHref(id: string): string {
	return id === "0.0" ? "/mission" : `/lesson/${id}`;
}

export function getProgressTotal(): number {
	return lessonRegistry.filter((lesson) => lesson.id !== "0.0").length;
}

export function getArtifactDependencies(id: string): string[] {
	return getLesson(id)?.artifact.dependsOn ?? [];
}

export function canEnterLesson(
	id: string,
	completedArtifactKeys: string[],
): boolean {
	const lesson = getLesson(id);
	if (!lesson) return false;
	const deps = lesson.artifact.dependsOn ?? [];
	return deps.every((dep) => completedArtifactKeys.includes(dep));
}

export function getDefaultShellForLesson(id: string): ShellType | undefined {
	return getLesson(id)?.shell;
}

export function getDefaultCoachModeForLesson(
	id: string,
): CoachMode | undefined {
	return getLesson(id)?.coachMode;
}
