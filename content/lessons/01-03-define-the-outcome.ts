import type { LessonContent } from "@/content/lessons/types";

export const defineTheOutcomeLessonContent: LessonContent = {
	lessonId: "1.3",
	slug: "01-03-define-the-outcome",
	status: "draft",
	intro:
		"Define the changed state for the user. The student should leave this lesson with one clear outcome statement that describes what gets better, not just what the app contains.",
	coach: {
		video: {
			status: "pending",
			title: "Define the Outcome",
		},
		transcript: {
			status: "empty",
		},
		examples: [
			{
				id: "feature-vs-outcome",
				title: "Feature-heavy statement vs outcome statement",
				body:
					"Feature-heavy: 'The app uses AI to summarize meetings, organize notes, and generate next steps.' Outcome: 'The app helps startup operators leave a meeting with a clean action summary they can review and send in minutes.'",
			},
			{
				id: "short-version",
				title: "Shortest version",
				body:
					"'Turn messy meeting notes into a clear action summary in minutes.' People want the changed state on the other side of the feature list.",
			},
		],
	},
	workbench: {
		prompt:
			"Write one user-facing outcome statement. Describe what gets better for the user, not what the app includes.",
		steps: [
			"Keep the statement observable.",
			"Name what is different for the user after the app works.",
			"Cut anything that reads like a feature list.",
		],
		emptyState:
			"If you are listing capabilities, rewrite it as the changed state the user wants.",
	},
	sourceRefs: [
		"docs/recording/day-1-prep.md",
		"docs/recording/sprint-packets.md",
	],
};
