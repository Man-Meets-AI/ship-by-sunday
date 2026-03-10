import type { LessonContent } from "@/content/lessons/types";

export const welcomeToShipBySundayLessonContent: LessonContent = {
	lessonId: "0.1",
	slug: "00-01-welcome-to-ship-by-sunday",
	status: "draft",
	intro:
		"This sprint is built to be completed, not consumed. Start by naming the smallest believable thing you want live by Sunday so the rest of the course stays anchored to a real outcome.",
	coach: {
		video: {
			status: "pending",
			title: "Welcome to Ship by Sunday",
		},
		transcript: {
			status: "empty",
		},
		examples: [
			{
				id: "artifact-preview",
				title: "What you leave with",
				body:
					"By the end of the sprint, the student should have four concrete outputs: Worksheet 01 Product Brief, Worksheet 02 Design Spec, Worksheet 03 Build Plan + Agent Brief, and Worksheet 04 Launch Plan + Feedback Tracker.",
			},
			{
				id: "operating-rule",
				title: "Operating rule",
				body:
					"This only works if the student does the reps. The point is not to binge lessons. The point is to move from idea to shipped v1 with one concrete action after another.",
			},
		],
	},
	workbench: {
		prompt:
			"Write the smallest believable thing you are here to ship by Sunday. Keep it concrete enough that the rest of the sprint can protect it.",
		steps: [
			"Look at the full 4-block path.",
			"Name the one thing you want live by Sunday.",
			"Keep the goal small enough to survive the weekend.",
		],
		emptyState:
			"Do not write a full product vision here. Write one concrete shipping goal.",
	},
	sourceRefs: [
		"docs/course-ops/plan.md",
		"docs/recording/sprint-packets.md",
		"docs/recording/founder-checklists.md",
	],
};
