import type { BlockId, LessonConfig } from "@/lib/course/lesson/model/manifest";
import {
	getOrderedBlocks,
	getStudentFacingLessons,
} from "@/lib/course/lesson/model/registry";
import { getTutorialVideoHref } from "@/lib/course/lesson/routing/tutorial-routes";

export type TutorialVideoLesson = {
	readonly lessonKey: string;
	readonly routeSegment: string;
	readonly displayLabel: string;
	readonly title: string;
	readonly description: string;
	readonly durationLabel: string | null;
	readonly href: string;
};

export type TutorialVideoBlock = {
	readonly id: BlockId;
	readonly label: string;
	readonly summary: string;
	readonly lessons: readonly TutorialVideoLesson[];
};

export type TutorialVideoLibrary = {
	readonly totalLessons: number;
	readonly blocks: readonly TutorialVideoBlock[];
};

function toTutorialVideoLesson(lesson: LessonConfig): TutorialVideoLesson {
	return {
		lessonKey: lesson.lessonKey,
		routeSegment: lesson.routeSegment,
		displayLabel: lesson.displayLabel,
		title: lesson.title,
		description: lesson.content.intro,
		durationLabel: lesson.content.coach.video?.durationLabel ?? null,
		href: getTutorialVideoHref(lesson.lessonKey),
	};
}

export function buildTutorialVideoLibrary(): TutorialVideoLibrary {
	const lessons = getStudentFacingLessons();
	const lessonsByBlock = new Map<BlockId, TutorialVideoLesson[]>();

	for (const lesson of lessons) {
		const blockLessons = lessonsByBlock.get(lesson.block) ?? [];
		blockLessons.push(toTutorialVideoLesson(lesson));
		lessonsByBlock.set(lesson.block, blockLessons);
	}

	const blocks = getOrderedBlocks()
		.map((block): TutorialVideoBlock => {
			return {
				id: block.id,
				label: block.label,
				summary: block.summary,
				lessons: lessonsByBlock.get(block.id) ?? [],
			};
		})
		.filter((block) => block.lessons.length > 0);

	return {
		totalLessons: lessons.length,
		blocks,
	};
}
