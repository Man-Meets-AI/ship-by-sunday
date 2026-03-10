import type { LessonContent } from "@/content/lessons/types";

export const mapTheCoreFlowLessonContent: LessonContent = {
	lessonId: "1.5",
	slug: "01-05-map-the-core-flow",
	status: "draft",
	intro:
		"Reduce the product to the shortest believable flow. If the student cannot explain the path in a few steps, the idea is still muddy.",
	coach: {
		video: {
			status: "pending",
			title: "Map the Core Flow",
		},
		transcript: {
			status: "empty",
		},
		examples: [
			{
				id: "five-step-flow",
				title: "5-step version",
				body:
					"1. User pastes meeting notes. 2. App generates a short action summary. 3. User reviews and edits. 4. User copies or shares the summary. 5. Team gets a clean follow-up record.",
			},
			{
				id: "messy-vs-clean",
				title: "Messy flow vs clean flow",
				body:
					"Messy: record meeting, upload file, transcribe, identify speakers, summarize, generate tasks, assign owners, sync calendar, send email, track analytics. Clean: paste notes, generate summary, review, share, done.",
			},
		],
	},
	workbench: {
		prompt:
			"Draw the flow on paper or tablet, keep it to 5 to 7 steps, and start with one actor. The value moment should be obvious.",
		steps: [
			"Draw the flow fast.",
			"Keep it to one actor first.",
			"Find the value moment and make sure the flow points to it.",
		],
		emptyState:
			"If the flow needs more than a few steps to explain, the idea still needs to be cut down.",
	},
	sourceRefs: [
		"docs/recording/day-1-prep.md",
		"docs/recording/sprint-packets.md",
	],
};
