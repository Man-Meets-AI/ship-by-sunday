import type { LessonContent } from "@/content/lessons/types";

export const killScopeLessonContent: LessonContent = {
	lessonId: "1.6",
	slug: "01-06-kill-scope",
	status: "draft",
	intro:
		"Cut the fantasy so the promise can survive the weekend. The goal is not to shrink ambition forever. The goal is to protect the smallest believable version that still proves the promise.",
	coach: {
		video: {
			status: "pending",
			title: "Kill Scope",
		},
		transcript: {
			status: "empty",
		},
		examples: [
			{
				id: "oversized-vs-v1",
				title: "Oversized idea vs weekend v1",
				body:
					"Oversized: meeting platform with uploads, transcription, team workspaces, search, Slack, calendar sync, speaker recognition, follow-up emails, and analytics. V1: paste notes, generate action summary, review, copy or share.",
			},
			{
				id: "sunday-test",
				title: "Sunday Test",
				body:
					"Ask: 'What has to work by Sunday for the promise to still be true?' For the example app: a user can paste notes, get a usable summary, and share it.",
			},
		],
	},
	workbench: {
		prompt:
			"Separate the idea into in-scope and out-of-scope. Keep only what must work by Sunday for the promise to remain true.",
		steps: [
			"List the fantasy features.",
			"Cut anything that does not protect the core promise.",
			"Leave with the smallest believable version.",
		],
		emptyState:
			"We are proving the promise, not shipping the full fantasy.",
	},
	sourceRefs: [
		"docs/recording/day-1-prep.md",
		"docs/recording/sprint-packets.md",
	],
};
