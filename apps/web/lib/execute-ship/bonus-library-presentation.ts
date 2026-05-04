import { routeConfig } from "@/config/product";
import type { BlockId } from "@/lib/course/lesson/model/manifest";
import { getLessonHref } from "@/lib/course/lesson/routing/lesson-routes";
import type { AppShellMissionState } from "@/app/(workspace)/_components/app-shell/app-shell-props";
import { getLessonMapHref } from "@/lib/workspace-navigation/lesson-map-href";
import type { PostReviewNavigationTargets } from "@/lib/workspace-navigation/post-review-destination";
import type { BonusMissionState } from "./bonus-mission-types";

const blockPresentation = {
	CEO: {
		label: "Product",
		summary:
			"Return here when the product truth needs to get tighter before you keep building.",
		kind: "reference",
	},
	DESIGN: {
		label: "Design",
		summary:
			"Use these lessons when flows, references, or UI direction drift away from the original brief.",
		kind: "reference",
	},
	BUILD: {
		label: "Build",
		summary:
			"This is the main continuation path. Turn the Ship by Sunday Codebase into working software, one slice at a time.",
		kind: "featured",
	},
	SHIP: {
		label: "Ship",
		summary:
			"Use this section when the product is stable enough for QA, deploy handoff, and launch.",
		kind: "reference",
	},
} as const satisfies Record<
	BlockId,
	{ label: string; summary: string; kind: "featured" | "reference" }
>;

function getShellLessonStatus(status: "available" | "opened" | "completed") {
	if (status === "available") {
		return "available" as const;
	}

	return "completed" as const;
}

export function getBonusBlockPresentation(blockId: BlockId) {
	return blockPresentation[blockId];
}

export function getOrderedBonusBlocks(state: BonusMissionState) {
	return [...state.blocks].sort((left, right) => left.order - right.order);
}

export function getRecommendedBuildLessonHref(state: BonusMissionState) {
	const buildBlock = state.blocks.find((block) => block.id === "BUILD");
	const preferredLesson =
		buildBlock?.lessons.find((lesson) => lesson.displayLabel === "3.1") ??
		buildBlock?.lessons[0];

	return preferredLesson
		? getLessonHref(preferredLesson.lessonKey)
		: "/execute";
}

export function getRecommendedLaunchLessonHref(state: BonusMissionState) {
	const launchBlock = state.blocks.find((block) => block.id === "SHIP");
	const preferredLesson =
		launchBlock?.lessons.find(
			(lesson) => lesson.status === "opened" || lesson.status === "available",
		) ?? launchBlock?.lessons[0];

	return preferredLesson
		? getLessonHref(preferredLesson.lessonKey)
		: getRecommendedBuildLessonHref(state);
}

export function buildFallbackPostReviewTargets(
	state: BonusMissionState,
): PostReviewNavigationTargets {
	const buildLessonsDestination = getRecommendedBuildLessonHref(state);

	return {
		reviewDestination: routeConfig.review,
		buildLessonsDestination,
		launchLessonsDestination: getRecommendedLaunchLessonHref(state),
		lessonMapDestination: getLessonMapHref(),
		latestLessonDestination: buildLessonsDestination,
	};
}

export function buildBonusShellMission(
	state: BonusMissionState,
): AppShellMissionState {
	return {
		progressCount: state.exploredCount,
		totalLessons: state.totalLessons,
		progressLabel: "lessons explored",
		blocks: getOrderedBonusBlocks(state).map((block) => ({
			id: block.id,
			label: blockPresentation[block.id].label,
			order: block.order,
			completedCount: block.lessons.filter(
				(lesson) => lesson.status !== "available",
			).length,
			totalLessons: block.lessons.length,
			lessons: block.lessons.map((lesson) => ({
				lessonKey: lesson.lessonKey,
				id: lesson.id,
				displayLabel: lesson.displayLabel,
				title: lesson.title,
				shortTitle: lesson.shortTitle,
				status: getShellLessonStatus(lesson.status),
				artifactLabel: lesson.artifactLabel,
				isImplemented: lesson.isImplemented,
			})),
		})),
	};
}
