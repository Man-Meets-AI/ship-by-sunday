import { describe, expect, it } from "vitest";
import {
	buildLockedPostReviewPrimaryNav,
	buildPostReviewPrimaryNav,
} from "@/lib/workspace-navigation/build-primary-nav-model";

const missionState = {
	exploredCount: 2,
	totalLessons: 4,
	blocks: [
		{
			id: "CEO",
			order: 1,
			lessons: [
				{
					lessonKey: "welcome-to-ship-by-sunday",
					routeSegment: "welcome-to-ship-by-sunday",
					id: "1.1",
					displayLabel: "1.1",
					title: "Welcome",
					shortTitle: "Welcome",
					block: "CEO",
					order: 1,
					status: "opened" as const,
					isImplemented: true,
					artifactLabel: "Welcome",
				},
			],
		},
		{
			id: "DESIGN",
			order: 2,
			lessons: [
				{
					lessonKey: "design-references",
					routeSegment: "design-references",
					id: "2.1",
					displayLabel: "2.1",
					title: "Design references",
					shortTitle: "References",
					block: "DESIGN",
					order: 1,
					status: "available" as const,
					isImplemented: true,
					artifactLabel: "References",
				},
			],
		},
		{
			id: "BUILD",
			order: 3,
			lessons: [],
		},
		{
			id: "SHIP",
			order: 4,
			lessons: [],
		},
	],
};

describe("buildPostReviewPrimaryNav", () => {
	it("maps build, launch, and bonus entries from centralized targets", () => {
		expect(
			buildPostReviewPrimaryNav({
				activeSection: "bonus",
				activeBonusBlockId: "CEO",
				missionState,
				postReviewTargets: {
					reviewDestination: "/review",
					buildLessonsDestination: "/lesson/iterate-the-product-with-ai",
					launchLessonsDestination: "/lesson/product-review",
					lessonMapDestination: "/review?showLessonMap=1",
					latestLessonDestination: "/lesson/iterate-the-product-with-ai",
				},
			}),
		).toEqual([
			{
				kind: "link",
				id: "build",
				label: "Build Lessons",
				href: "/lesson/iterate-the-product-with-ai",
				state: "available",
			},
			{
				kind: "link",
				id: "launch",
				label: "Launch Lessons",
				href: "/lesson/product-review",
				state: "available",
			},
			{
				kind: "menu",
				id: "bonus",
				label: "Bonus",
				state: "active",
				items: [
					{
						kind: "link",
						id: "bonus-product",
						label: "Product lessons",
						href: "/lesson/welcome-to-ship-by-sunday",
						state: "active",
					},
					{
						kind: "link",
						id: "bonus-design",
						label: "Design lessons",
						href: "/lesson/design-references",
						state: "available",
					},
					{
						kind: "action",
						id: "bonus-lesson-map",
						label: "Lesson Map",
						actionId: "showLessonMap",
						state: "active",
					},
				],
			},
		]);
	});

	it("exposes disabled post-review items before unlock", () => {
		expect(buildLockedPostReviewPrimaryNav()).toEqual([
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
		]);
	});
});
