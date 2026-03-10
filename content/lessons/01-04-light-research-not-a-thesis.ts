import type { LessonContent } from "@/content/lessons/types";

export const lightResearchNotAThesisLessonContent: LessonContent = {
	lessonId: "1.4",
	slug: "01-04-light-research-not-a-thesis",
	status: "draft",
	intro:
		"Research just enough to avoid building blind. The goal is not a market report. The goal is a fast pass through a few references so the student can notice what matters and move on.",
	coach: {
		video: {
			status: "pending",
			title: "Light Research, Not a Thesis",
		},
		transcript: {
			status: "empty",
		},
		examples: [
			{
				id: "reference-grid",
				title: "Simple research note grid",
				body:
					"Reference 1: clean summary output, weak task ownership, users care about speed and clarity. Reference 2: easy-to-scan action items, too many extra features, users care about sharing fast. Reference 3: familiar note-taking pattern, generic output, users care about trustworthy summaries.",
			},
			{
				id: "research-line",
				title: "Operating line",
				body:
					"'You are not writing a market report. You are just trying not to build blind.'",
			},
		],
	},
	workbench: {
		prompt:
			"Add 2 to 3 competitors or references, note what they do well, where they are weak, and what users seem to care about.",
		steps: [
			"Move fast through 2 to 3 references.",
			"Notice what patterns repeat.",
			"Write down only the signal that will change what you build.",
		],
		emptyState:
			"If the lesson turns into strategy lecture mode, cut it back to fast signal collection.",
	},
	sourceRefs: [
		"docs/recording/day-1-prep.md",
		"docs/recording/sprint-packets.md",
	],
};
