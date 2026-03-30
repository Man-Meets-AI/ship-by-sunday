import { getLessonHref } from "../../course/lesson/model/manifest";
import type { BonusMissionState } from "../../execute-ship/lib/bonus-mission-types";
import type { PostReviewNavigationTargets } from "./post-review-destination";

export type WorkspacePrimaryNavState =
	| "active"
	| "available"
	| "complete"
	| "disabled";

export type WorkspacePrimaryNavActionId = "showLessonMap";

export type WorkspacePrimaryNavMenuEntry =
	| {
			kind: "link";
			id: string;
			label: string;
			href: string;
			state: WorkspacePrimaryNavState;
	  }
	| {
			kind: "action";
			id: string;
			label: string;
			actionId: WorkspacePrimaryNavActionId;
			state: WorkspacePrimaryNavState;
	  };

export type WorkspacePrimaryNavItem =
	| {
			kind: "link";
			id: string;
			label: string;
			href: string;
			state: WorkspacePrimaryNavState;
	  }
	| {
			kind: "menu";
			id: string;
			label: string;
			state: WorkspacePrimaryNavState;
			items: WorkspacePrimaryNavMenuEntry[];
	  };

type PostReviewActiveSection = "review" | "build" | "launch" | "bonus";

function getBonusBlockHref(
	missionState: BonusMissionState,
	blockId: "CEO" | "DESIGN",
) {
	const block = missionState.blocks.find((candidate) => candidate.id === blockId);
	const preferredLesson =
		block?.lessons.find(
			(lesson) =>
				lesson.status === "opened" || lesson.status === "available",
		) ?? block?.lessons[0];

	return preferredLesson ? getLessonHref(preferredLesson.lessonKey) : null;
}

function getBonusBlockState(
	missionState: BonusMissionState,
	blockId: "CEO" | "DESIGN",
	activeSection: PostReviewActiveSection,
	activeBonusBlockId: "CEO" | "DESIGN" | null,
): WorkspacePrimaryNavState {
	if (activeSection === "bonus" && activeBonusBlockId === blockId) {
		return "active";
	}

	return getBonusBlockHref(missionState, blockId) ? "available" : "disabled";
}

export function buildPostReviewPrimaryNav({
	activeSection,
	activeBonusBlockId = null,
	missionState,
	postReviewTargets,
}: {
	activeSection: PostReviewActiveSection;
	activeBonusBlockId?: "CEO" | "DESIGN" | null;
	missionState: BonusMissionState;
	postReviewTargets: PostReviewNavigationTargets;
}): WorkspacePrimaryNavItem[] {
	const productHref = getBonusBlockHref(missionState, "CEO");
	const designHref = getBonusBlockHref(missionState, "DESIGN");

	return [
		{
			kind: "link",
			id: "review",
			label: "Review",
			href: postReviewTargets.reviewDestination,
			state: activeSection === "review" ? "active" : "available",
		},
		{
			kind: "link",
			id: "build",
			label: "Build Lessons",
			href: postReviewTargets.buildLessonsDestination,
			state: activeSection === "build" ? "active" : "available",
		},
		{
			kind: "link",
			id: "launch",
			label: "Launch Lessons",
			href: postReviewTargets.launchLessonsDestination,
			state: activeSection === "launch" ? "active" : "available",
		},
		{
			kind: "menu",
			id: "bonus",
			label: "Bonus",
			state: activeSection === "bonus" ? "active" : "available",
			items: [
				...(productHref
					? [
							{
								kind: "link" as const,
								id: "bonus-product",
								label: "Product lessons",
								href: productHref,
								state: getBonusBlockState(
									missionState,
									"CEO",
									activeSection,
									activeBonusBlockId,
								),
							},
						]
					: []),
				...(designHref
					? [
							{
								kind: "link" as const,
								id: "bonus-design",
								label: "Design lessons",
								href: designHref,
								state: getBonusBlockState(
									missionState,
									"DESIGN",
									activeSection,
									activeBonusBlockId,
								),
							},
						]
					: []),
				{
					kind: "action",
					id: "bonus-lesson-map",
					label: "Lesson Map",
					actionId: "showLessonMap",
					state: activeSection === "bonus" ? "active" : "available",
				},
			],
		},
	];
}
