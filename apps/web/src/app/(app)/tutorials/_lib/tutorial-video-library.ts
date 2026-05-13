import type { BlockId, LessonConfig } from "@/lib/course/lesson/model/manifest";
import {
	getOrderedBlocks,
	getStudentFacingLessons,
} from "@/lib/course/lesson/model/registry";
import { getTutorialVideoHref } from "@/lib/course/lesson/routing/tutorial-routes";
import { resolveLessonVideoPosterUrl } from "@/lib/course/lesson/model/video";

export type TutorialVideoLesson = {
	readonly lessonKey: string;
	readonly routeSegment: string;
	readonly displayLabel: string;
	readonly title: string;
	readonly description: string;
	readonly durationLabel: string | null;
	readonly thumbnailUrl: string | null;
	readonly href: string;
};

export type TutorialVideoSection = {
	readonly id: string;
	readonly label: string;
	readonly lessons: readonly TutorialVideoLesson[];
};

export type TutorialVideoBlock = {
	readonly id: BlockId;
	readonly label: string;
	readonly summary: string;
	readonly videoCount: number;
	readonly sections: readonly TutorialVideoSection[];
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
		thumbnailUrl: resolveLessonVideoPosterUrl(lesson.content.coach.video),
		href: getTutorialVideoHref(lesson.lessonKey),
	};
}

function getTutorialVideoSectionLabel(blockId: BlockId, lessonId: string) {
	if (blockId !== "BUILD") {
		return "All videos";
	}

	if (["3.0", "3.1", "3.2"].includes(lessonId)) {
		return "Start and orient";
	}

	if (["3.3", "3.4", "3.5", "3.6"].includes(lessonId)) {
		return "Wire the product";
	}

	if (["3.7", "3.8", "3.9", "3.10", "3.11", "3.12"].includes(lessonId)) {
		return "Plan and build slices";
	}

	return "Stabilize and launch";
}

function buildTutorialVideoSections(
	blockId: BlockId,
	lessons: readonly TutorialVideoLesson[],
): TutorialVideoSection[] {
	const lessonsBySection = new Map<string, TutorialVideoLesson[]>();

	for (const lesson of lessons) {
		const sectionLabel = getTutorialVideoSectionLabel(
			blockId,
			lesson.displayLabel,
		);
		const sectionLessons = lessonsBySection.get(sectionLabel) ?? [];
		sectionLessons.push(lesson);
		lessonsBySection.set(sectionLabel, sectionLessons);
	}

	return Array.from(lessonsBySection, ([label, sectionLessons]) => ({
		id: label.toLowerCase().replaceAll(" ", "-"),
		label,
		lessons: sectionLessons,
	}));
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
			const blockLessons = lessonsByBlock.get(block.id) ?? [];
			return {
				id: block.id,
				label: block.label,
				summary: block.summary,
				videoCount: blockLessons.length,
				sections: buildTutorialVideoSections(block.id, blockLessons),
				lessons: blockLessons,
			};
		})
		.filter((block) => block.lessons.length > 0);

	return {
		totalLessons: lessons.length,
		blocks,
	};
}
