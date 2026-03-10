import type { LessonContent } from "@/content/lessons/types";

export const pickOneUserLessonContent: LessonContent = {
	lessonId: "1.2",
	slug: "01-02-pick-one-user",
	status: "draft",
	intro:
		"Choose one reachable user in one specific moment. Broad beats vague in theory, but specific beats broad when you are trying to get to a real first version.",
	coach: {
		video: {
			status: "pending",
			title: "Pick One User",
		},
		transcript: {
			status: "empty",
		},
		examples: [
			{
				id: "blurry-vs-tight",
				title: "Blurry user vs tightened user",
				body:
					"Blurry: 'This app is for teams.' Tightened: 'This app is for early-stage startup operators who run internal team meetings and need a faster way to turn messy notes into clear action items.'",
			},
			{
				id: "sentence-stem",
				title: "Sentence stem",
				body:
					"Use: 'This app is for ___ who need ___ without ___.' Keep the user reachable this week, not just theoretically valuable.",
			},
		],
	},
	workbench: {
		prompt:
			"Carry forward one problem from 1.1, then name one actual user who has it in a specific moment.",
		steps: [
			"Pick the strongest candidate problem from 1.1.",
			"Name one specific user, not a broad market.",
			"Describe what that user does today instead.",
		],
		emptyState:
			"If the user sounds like a market category, it is still too broad.",
	},
	sourceRefs: [
		"docs/recording/day-1-prep.md",
		"docs/recording/sprint-packets.md",
	],
};
