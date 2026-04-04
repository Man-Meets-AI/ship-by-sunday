import {
	getLessonHref,
	type LessonConfig,
} from "@/features/course/lesson/model/manifest";
import type { BonusMissionState } from "@/features/execute-ship/lib/bonus-mission-types";
import {
	getBonusBlockPresentation,
	getOrderedBonusBlocks,
} from "@/features/execute-ship/lib/bonus-library-presentation";
import type { PostReviewNavigationTargets } from "./post-review-destination";
import type { WorkspacePrimaryNavState } from "./build-primary-nav-model";

export const REVIEW_OVERVIEW_ID = "review-overview";
export const REVIEW_HANDOFF_ID = "review-handoff";
export const REVIEW_LESSON_MAP_ID = "review-lesson-map";

export type WorkspaceLocalNavItem = {
	id: string;
	label: string;
	href: string;
	state: WorkspacePrimaryNavState;
	description?: string;
};

export type WorkspaceLocalNavSection = {
	id: string;
	label: string;
	description?: string;
	items: WorkspaceLocalNavItem[];
};

export type WorkspaceLocalNavModel = {
	sections: WorkspaceLocalNavSection[];
};

function getLessonItemState(
	status: string,
	isCurrent: boolean,
): WorkspacePrimaryNavState {
	if (isCurrent) {
		return "active";
	}

	if (status === "available") {
		return "available";
	}

	if (status === "locked") {
		return "disabled";
	}

	return "complete";
}

function buildLessonSection({
	blockId,
	currentLessonKey,
	lessonGroupLabel,
	missionState,
}: {
	blockId: LessonConfig["block"];
	currentLessonKey: string;
	lessonGroupLabel: string;
	missionState: BonusMissionState;
}): WorkspaceLocalNavSection | null {
	const block = getOrderedBonusBlocks(missionState).find(
		(candidate) => candidate.id === blockId,
	);
	if (!block || block.lessons.length === 0) {
		return null;
	}

	const presentation = getBonusBlockPresentation(blockId);
	const description =
		blockId === "BUILD" || blockId === "SHIP"
			? undefined
			: presentation.summary;

	return {
		id: blockId.toLowerCase(),
		label: lessonGroupLabel,
		description,
		items: block.lessons.map((lesson) => ({
			id: lesson.lessonKey,
			label: lesson.shortTitle,
			href: getLessonHref(lesson.lessonKey),
			state: getLessonItemState(
				lesson.status,
				lesson.lessonKey === currentLessonKey,
			),
		})),
	};
}

export function buildReviewLocalNavModel({
	isLessonMapVisible,
	postReviewTargets,
}: {
	isLessonMapVisible: boolean;
	postReviewTargets: PostReviewNavigationTargets;
}): WorkspaceLocalNavModel {
	return {
		sections: [
			{
				id: "review-orientation",
				label: "Review",
				description: "Overview, handoff, and the lesson map.",
				items: [
					{
						id: "overview",
						label: "Overview",
						href: `#${REVIEW_OVERVIEW_ID}`,
						state: isLessonMapVisible ? "available" : "active",
					},
					{
						id: "handoff",
						label: "Handoff",
						href: `#${REVIEW_HANDOFF_ID}`,
						state: "available",
					},
					{
						id: "lesson-map",
						label: "Lesson Map",
						href: `${postReviewTargets.lessonMapDestination}#${REVIEW_LESSON_MAP_ID}`,
						state: isLessonMapVisible ? "active" : "available",
					},
				],
			},
			{
				id: "review-next-up",
				label: "Next up",
				description: "Continue into the unlocked lesson tracks.",
				items: [
					{
						id: "build-lessons",
						label: "Build Lessons",
						href: postReviewTargets.buildLessonsDestination,
						state: "available",
					},
					{
						id: "launch-lessons",
						label: "Launch Lessons",
						href: postReviewTargets.launchLessonsDestination,
						state: "available",
					},
				],
			},
		],
	};
}

export function buildWorkspaceLessonLocalNavModel({
	currentLesson,
	missionState,
}: {
	currentLesson: LessonConfig;
	missionState: BonusMissionState;
}): WorkspaceLocalNavModel {
	if (currentLesson.block === "BUILD") {
		const buildSection = buildLessonSection({
			blockId: "BUILD",
			currentLessonKey: currentLesson.lessonKey,
			lessonGroupLabel: "Build Lessons",
			missionState,
		});

		return {
			sections: buildSection ? [buildSection] : [],
		};
	}

	if (currentLesson.block === "SHIP") {
		const launchSection = buildLessonSection({
			blockId: "SHIP",
			currentLessonKey: currentLesson.lessonKey,
			lessonGroupLabel: "Launch Lessons",
			missionState,
		});

		return {
			sections: launchSection ? [launchSection] : [],
		};
	}

	const productSection = buildLessonSection({
		blockId: "CEO",
		currentLessonKey: currentLesson.lessonKey,
		lessonGroupLabel: "Product",
		missionState,
	});
	const designSection = buildLessonSection({
		blockId: "DESIGN",
		currentLessonKey: currentLesson.lessonKey,
		lessonGroupLabel: "Design",
		missionState,
	});

	return {
		sections: [productSection, designSection].filter(
			(section): section is WorkspaceLocalNavSection => Boolean(section),
		),
	};
}
