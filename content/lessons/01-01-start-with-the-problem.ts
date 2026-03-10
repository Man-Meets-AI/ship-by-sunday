import type { LessonContent } from "@/content/lessons/types";

export const startWithTheProblemLessonContent: LessonContent = {
	lessonId: "1.1",
	slug: "01-01-start-with-the-problem",
	status: "draft",
	intro:
		"Start with real pain, not novelty. Write three candidate problems from life or work that are annoying enough to be worth solving, then keep them grounded in a real moment and a real person.",
	coach: {
		video: {
			status: "pending",
			title: "Start With the Problem",
		},
		transcript: {
			status: "empty",
		},
		examples: [
			{
				id: "weak-vs-strong",
				title: "Weak idea vs stronger problem",
				body:
					"Weak: 'I want to build an AI meeting app.' Stronger: 'After team meetings, early-stage startup operators lose action items, forget decisions, and waste time turning messy notes into clear follow-up tasks.'",
			},
			{
				id: "candidate-problems",
				title: "Three candidate problems",
				body:
					"1. Startup operators lose action items after meetings. 2. Freelancers forget client follow-ups because notes are scattered. 3. Small teams lose recurring process tasks because nobody owns the checklist after the meeting ends.",
			},
		],
	},
	workbench: {
		prompt:
			"Write three problems from your life or work that are annoying enough to be worth solving. Keep them tied to a real person and a real moment.",
		steps: [
			"Start with pain, not a feature idea.",
			"Keep the problem grounded in real work or life.",
			"Do not rank them yet. Generate candidates first.",
		],
		emptyState:
			"If you are writing product ideas instead of annoying moments, go back and rewrite them as problems.",
	},
	sourceRefs: [
		"docs/recording/day-1-prep.md",
		"docs/recording/sprint-packets.md",
	],
};
