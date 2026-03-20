import {
	type BlockId,
	getLesson,
	getLessonHref,
} from "@/features/course/lesson/model/manifest";
import { getBlockById } from "@/features/course/lesson/model/registry";

export type LessonStatus = "available" | "completed" | "in_progress" | "locked";
export type BlockStatus = "completed" | "active" | "ready" | "locked";
export type StatusTone = "now" | "next" | "done" | "locked";
export type MissionBadgeVariant = "default" | "secondary" | "outline" | "ghost";

export type MissionLesson = {
	lessonKey: string;
	id: string;
	displayLabel: string;
	title: string;
	shortTitle: string;
	status: LessonStatus;
	artifactLabel: string;
	isImplemented: boolean;
};

export type MissionBlock = {
	id: BlockId;
	label: string;
	order: number;
	availableCount?: number;
	completedCount: number;
	totalLessons: number;
	lessons: MissionLesson[];
};

export type MissionState = {
	progressCount: number;
	totalLessons: number;
	blocks: MissionBlock[];
};

export type EnrichedLesson = MissionLesson & {
	href: string;
	objectiveTitle: string;
	helperText?: string;
	winCondition: string;
};

export type EnrichedBlock = MissionBlock & {
	level: number;
	summary: string;
	status: BlockStatus;
	pct: number;
	allLessons: EnrichedLesson[];
	currentLesson: EnrichedLesson | null;
	completedLessons: EnrichedLesson[];
	upcomingLessons: EnrichedLesson[];
};

export function getBlockStatus(block: MissionBlock): BlockStatus {
	if (block.completedCount === block.totalLessons) return "completed";
	if (block.lessons.some((lesson) => lesson.status === "in_progress")) {
		return "active";
	}
	if (block.lessons.some((lesson) => lesson.status === "available")) {
		return "ready";
	}
	return "locked";
}

export function enrichLesson(lesson: MissionLesson): EnrichedLesson {
	const config = getLesson(lesson.lessonKey);

	return {
		...lesson,
		href: getLessonHref(lesson.lessonKey),
		objectiveTitle: config?.objectiveTitle ?? `${lesson.id} ${lesson.title}`,
		helperText: config?.helperText,
		winCondition:
			config?.winCondition ?? `${lesson.shortTitle} is complete and saved.`,
	};
}

export function enrichBlock(block: MissionBlock): EnrichedBlock {
	const meta = getBlockById(block.id);
	const status = getBlockStatus(block);
	const allLessons = block.lessons.map(enrichLesson);
	const currentLesson =
		allLessons.find(
			(lesson) =>
				lesson.status === "in_progress" || lesson.status === "available",
		) ?? null;
	const currentIndex = currentLesson
		? allLessons.findIndex(
				(lesson) => lesson.lessonKey === currentLesson.lessonKey,
			)
		: -1;

	return {
		...block,
		level: meta?.level ?? block.order,
		summary: meta?.summary ?? `${block.label} block`,
		status,
		pct:
			block.totalLessons > 0
				? Math.round((block.completedCount / block.totalLessons) * 100)
				: 0,
		allLessons,
		currentLesson,
		completedLessons: allLessons.filter(
			(lesson) => lesson.status === "completed",
		),
		upcomingLessons:
			currentIndex >= 0
				? allLessons
						.slice(currentIndex + 1)
						.filter((lesson) => lesson.status === "locked")
						.slice(0, 2)
				: allLessons.filter((lesson) => lesson.status === "locked").slice(0, 2),
	};
}

export function getToneVariant(tone: StatusTone): MissionBadgeVariant {
	switch (tone) {
		case "now":
			return "default";
		case "next":
			return "outline";
		case "done":
			return "secondary";
		default:
			return "ghost";
	}
}

export function getBlockTone(
	status: BlockStatus,
	isCurrent = false,
): StatusTone {
	if (isCurrent || status === "active") return "now";
	if (status === "completed") return "done";
	if (status === "ready") return "next";
	return "locked";
}

export function getBlockStatusLabel(status: BlockStatus, isCurrent = false) {
	if (isCurrent || status === "active") return "Now";
	if (status === "completed") return "Done";
	if (status === "ready") return "Ready";
	return "Locked";
}
