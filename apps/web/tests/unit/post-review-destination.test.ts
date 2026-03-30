import { describe, expect, it } from "vitest";
import { getLessonHref } from "@/features/course/lesson/model/manifest";
import {
	getPostReviewNavigationTargets,
	resolveWorkspaceResumeDestination,
} from "@/features/workspace-navigation/lib/post-review-destination";

describe("post-review destination helpers", () => {
	it("keeps incomplete packet visitors on the packet flow", () => {
		expect(
			resolveWorkspaceResumeDestination({
				executeShipUnlockedAt: null,
				firstIncompleteStageId: "design",
				packetStageDestination: "/design",
				postReviewLessonStates: [],
			}),
		).toEqual({
			destination: "/design",
			kind: "packet_stage",
			packetStageId: "design",
			postReviewTargets: null,
		});
	});

	it("defaults unlocked visitors to build lessons and keeps explicit build plus launch targets", () => {
		expect(
			resolveWorkspaceResumeDestination({
				executeShipUnlockedAt: 500,
				firstIncompleteStageId: "review",
				packetStageDestination: "/review",
				postReviewLessonStates: [],
			}),
		).toEqual({
			destination: getLessonHref("iterate-the-product-with-ai"),
			kind: "post_review",
			packetStageId: null,
			postReviewTargets: {
				reviewDestination: "/review",
				buildLessonsDestination: getLessonHref("iterate-the-product-with-ai"),
				launchLessonsDestination: getLessonHref("product-review"),
				lessonMapDestination: "/review?showLessonMap=1",
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
			reviewDestination: "/review",
			buildLessonsDestination: getLessonHref("iterate-the-product-with-ai"),
			launchLessonsDestination: getLessonHref("product-review"),
			lessonMapDestination: "/review?showLessonMap=1",
			latestLessonDestination: getLessonHref("welcome-to-ship-by-sunday"),
		});
	});
});
