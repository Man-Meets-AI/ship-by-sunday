import { describe, expect, it } from "vitest";
import { getLessonHref } from "@/lib/course/lesson/routing/lesson-routes";
import {
	getPostReviewNavigationTargets,
	resolveWorkspaceResumeDestination,
} from "@/lib/workspace-navigation/post-review-destination";

describe("post-review destination helpers", () => {
	it("keeps incomplete codebase visitors on the codebase flow", () => {
		expect(
			resolveWorkspaceResumeDestination({
				executeShipUnlockedAt: null,
				firstIncompleteStageId: "design",
				codebaseStageDestination: "/design",
				postReviewLessonStates: [],
			}),
		).toEqual({
			destination: "/design",
			kind: "codebase_stage",
			codebaseStageId: "design",
			postReviewTargets: null,
		});
	});

	it("defaults unlocked visitors to build lessons and keeps explicit build plus launch targets", () => {
		expect(
			resolveWorkspaceResumeDestination({
				executeShipUnlockedAt: 500,
				firstIncompleteStageId: "review",
				codebaseStageDestination: "/generate-codebase/review",
				postReviewLessonStates: [],
			}),
		).toEqual({
			destination: getLessonHref("iterate-the-product-with-ai"),
			kind: "post_review",
			codebaseStageId: null,
			postReviewTargets: {
				reviewDestination: "/generate-codebase/review",
				buildLessonsDestination: getLessonHref("iterate-the-product-with-ai"),
				launchLessonsDestination: getLessonHref("product-review"),
				lessonMapDestination: "/generate-codebase/review?showLessonMap=1",
				latestLessonDestination: getLessonHref("iterate-the-product-with-ai"),
			},
		});
	});

	it("resumes to the latest unlocked lesson while preserving build and launch shortcuts", () => {
		expect(
			getPostReviewNavigationTargets(
				[
					{
						lessonKey: "iterate-the-product-with-ai",
						lastViewedAt: 700,
					},
					{
						lessonKey: "product-review",
						lastViewedAt: 900,
					},
					{
						lessonKey: "welcome-to-ship-by-sunday",
						lastViewedAt: 1200,
					},
				],
				500,
			),
		).toEqual({
			reviewDestination: "/generate-codebase/review",
			buildLessonsDestination: getLessonHref("iterate-the-product-with-ai"),
			launchLessonsDestination: getLessonHref("product-review"),
			lessonMapDestination: "/generate-codebase/review?showLessonMap=1",
			latestLessonDestination: getLessonHref("welcome-to-ship-by-sunday"),
		});
	});
});
