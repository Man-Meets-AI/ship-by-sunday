import { routeConfig } from "../../../config/product";
import {
	getLessonHref,
	type BlockId,
} from "../../course/lesson/model/manifest";
import { getStudentFacingLessons } from "../../course/lesson/model/registry";
import { getLessonMapHref } from "./lesson-map-href";

const POST_REVIEW_DEFAULT_BUILD_LESSON_ID = "3.1";
const studentFacingLessons = getStudentFacingLessons();

export type BlueprintResumeStageId = "blueprint" | "review";

export type PostReviewLessonState = {
	lessonKey?: string | null;
	lastViewedAt?: number;
	startedAt?: number;
	updatedAt?: number;
};

export type PostReviewNavigationTargets = {
	reviewDestination: string;
	buildLessonsDestination: string;
	launchLessonsDestination: string;
	lessonMapDestination: string;
	latestLessonDestination: string;
};

export type WorkspaceResumeDestination =
	| {
			destination: string;
			kind: "blueprint_stage";
			blueprintStageId: BlueprintResumeStageId;
			postReviewTargets: null;
	  }
	| {
			destination: string;
			kind: "review";
			blueprintStageId: "review";
			postReviewTargets: null;
	  }
	| {
			destination: string;
			kind: "post_review";
			blueprintStageId: null;
			postReviewTargets: PostReviewNavigationTargets;
	  };

function getLessonStateTimestamp(state: PostReviewLessonState) {
	return state.lastViewedAt ?? state.updatedAt ?? state.startedAt ?? 0;
}

function findLessonHrefByDisplayLabel(displayLabel: string) {
	const lesson = studentFacingLessons.find(
		(candidate) => candidate.displayLabel === displayLabel,
	);
	return lesson ? getLessonHref(lesson.lessonKey) : null;
}

export function getDefaultBuildLessonsDestination() {
	return (
		findLessonHrefByDisplayLabel(POST_REVIEW_DEFAULT_BUILD_LESSON_ID) ??
		getFirstBlockLessonHref("BUILD")
	);
}

function getFirstBlockLessonHref(blockId: BlockId) {
	const lesson = studentFacingLessons.find(
		(candidate) => candidate.block === blockId,
	);
	if (!lesson) {
		throw new Error(`Missing lesson for post-review block ${blockId}`);
	}

	return getLessonHref(lesson.lessonKey);
}

function findLatestLessonHref(
	lessonStates: readonly PostReviewLessonState[],
	executeShipUnlockedAt: number,
	blockId?: BlockId,
) {
	const latestState = [...lessonStates]
		.filter(
			(state): state is PostReviewLessonState & { lessonKey: string } =>
				typeof state.lessonKey === "string" && state.lessonKey.length > 0,
		)
		.filter((state) => getLessonStateTimestamp(state) >= executeShipUnlockedAt)
		.map((state) => {
			const lesson = studentFacingLessons.find(
				(candidate) => candidate.lessonKey === state.lessonKey,
			);
			return lesson ? { lesson, state } : null;
		})
		.filter(
			(
				candidate,
			): candidate is {
				lesson: (typeof studentFacingLessons)[number];
				state: PostReviewLessonState & { lessonKey: string };
			} => candidate !== null,
		)
		.filter((candidate) =>
			blockId ? candidate.lesson.block === blockId : true,
		)
		.sort(
			(left, right) =>
				getLessonStateTimestamp(right.state) -
				getLessonStateTimestamp(left.state),
		)[0];

	return latestState ? getLessonHref(latestState.lesson.lessonKey) : null;
}

export function getPostReviewNavigationTargets(
	lessonStates: readonly PostReviewLessonState[],
	executeShipUnlockedAt: number,
): PostReviewNavigationTargets {
	const buildLessonsFallback = getDefaultBuildLessonsDestination();
	const launchLessonsFallback = getFirstBlockLessonHref("SHIP");
	const buildLessonsDestination =
		findLatestLessonHref(lessonStates, executeShipUnlockedAt, "BUILD") ??
		buildLessonsFallback;
	const launchLessonsDestination =
		findLatestLessonHref(lessonStates, executeShipUnlockedAt, "SHIP") ??
		launchLessonsFallback;
	const latestLessonDestination =
		findLatestLessonHref(lessonStates, executeShipUnlockedAt) ??
		buildLessonsDestination;

	return {
		reviewDestination: routeConfig.review,
		buildLessonsDestination,
		launchLessonsDestination,
		lessonMapDestination: getLessonMapHref(),
		latestLessonDestination,
	};
}

export function resolveWorkspaceResumeDestination({
	executeShipUnlockedAt,
	firstIncompleteStageId,
	blueprintStageDestination,
	postReviewLessonStates,
}: {
	executeShipUnlockedAt: number | null;
	firstIncompleteStageId: BlueprintResumeStageId;
	blueprintStageDestination: string;
	postReviewLessonStates: readonly PostReviewLessonState[];
}): WorkspaceResumeDestination {
	if (firstIncompleteStageId !== "review") {
		return {
			destination: blueprintStageDestination,
			kind: "blueprint_stage",
			blueprintStageId: firstIncompleteStageId,
			postReviewTargets: null,
		};
	}

	if (!executeShipUnlockedAt) {
		return {
			destination: routeConfig.review,
			kind: "review",
			blueprintStageId: "review",
			postReviewTargets: null,
		};
	}

	const postReviewTargets = getPostReviewNavigationTargets(
		postReviewLessonStates,
		executeShipUnlockedAt,
	);

	return {
		destination: postReviewTargets.latestLessonDestination,
		kind: "post_review",
		blueprintStageId: null,
		postReviewTargets,
	};
}
