import {
	getLessonHref,
	type BlockId,
} from "@/features/course/lesson/model/manifest";
import type { AppShellMissionState } from "@/features/course/shared/components/app-shell/app-shell-props";
import type { BonusMissionState } from "./bonus-mission-types";

const blockPresentation = {
	CEO: {
		label: "Product",
		summary:
			"Revisit the product lessons whenever the packet needs sharper user, problem, or scope decisions.",
		kind: "reference",
	},
	DESIGN: {
		label: "Design",
		summary:
			"Use the design lessons as supporting references when you need better flows, references, or direction while building.",
		kind: "reference",
	},
	BUILD: {
		label: "Build",
		summary:
			"This is the recommended continuation path. Use it to turn the packet into working software, one slice at a time.",
		kind: "featured",
	},
	SHIP: {
		label: "Ship",
		summary:
			"Keep the ship lessons unlocked as references for deployment, QA, and launch readiness once Build is stable.",
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
