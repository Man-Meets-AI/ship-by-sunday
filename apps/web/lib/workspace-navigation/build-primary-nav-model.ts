import { getLessonHref } from "@/features/course/lesson/routing/lesson-routes";
import type { BonusMissionState } from "@/lib/execute-ship/bonus-mission-types";
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

export type PostReviewActiveSection = "build" | "launch" | "bonus";

export function buildLockedPostReviewPrimaryNav(): WorkspacePrimaryNavItem[] {
	return [
		{
			kind: "link",
			id: "build",
			label: "Build Lessons",
			href: "#",
			state: "disabled",
		},
		{
			kind: "link",
			id: "launch",
			label: "Launch Lessons",
			href: "#",
			state: "disabled",
		},
		{
			kind: "menu",
			id: "bonus",
			label: "Bonus",
			state: "disabled",
			items: [
				{
					kind: "link",
					id: "bonus-product",
					label: "Product lessons",
					href: "#",
					state: "disabled",
				},
				{
					kind: "link",
					id: "bonus-design",
					label: "Design lessons",
					href: "#",
					state: "disabled",
				},
				{
					kind: "action",
					id: "bonus-lesson-map",
					label: "Lesson Map",
					actionId: "showLessonMap",
					state: "disabled",
				},
			],
		},
	];
}

function getBonusBlockHref(
	missionState: BonusMissionState,
	blockId: "CEO" | "DESIGN",
) {
	const block = missionState.blocks.find(
		(candidate) => candidate.id === blockId,
	);
	const preferredLesson =
		block?.lessons.find(
			(lesson) => lesson.status === "opened" || lesson.status === "available",
		) ?? block?.lessons[0];

	return preferredLesson ? getLessonHref(preferredLesson.lessonKey) : null;
}

function getBonusBlockState(
	missionState: BonusMissionState,
	blockId: "CEO" | "DESIGN",
	activeSection: PostReviewActiveSection | null | undefined,
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
	activeSection?: PostReviewActiveSection | null;
	activeBonusBlockId?: "CEO" | "DESIGN" | null;
	missionState: BonusMissionState;
	postReviewTargets: PostReviewNavigationTargets;
}): WorkspacePrimaryNavItem[] {
	const productHref = getBonusBlockHref(missionState, "CEO");
	const designHref = getBonusBlockHref(missionState, "DESIGN");

	return [
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
