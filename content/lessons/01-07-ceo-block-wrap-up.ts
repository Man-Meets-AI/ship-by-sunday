import type { LessonContent } from "@/content/lessons/types";

export const ceoBlockWrapUpLessonContent: LessonContent = {
	lessonId: "1.7",
	slug: "01-07-ceo-block-wrap-up",
	status: "draft",
	intro:
		"This is the handoff artifact into Design. Review the CEO inputs, make the brief coherent, and lock the smallest believable product direction before moving on.",
	coach: {
		video: {
			status: "pending",
			title: "CEO Block Wrap-Up",
		},
		transcript: {
			status: "empty",
		},
		examples: [
			{
				id: "brief-purpose",
				title: "Why this artifact matters",
				body:
					"The product brief is the handoff into Design. If the problem, user, outcome, flow, and scope are muddy here, everything downstream gets slower and noisier.",
			},
		],
	},
	workbench: {
		prompt:
			"Review the CEO inputs and turn them into one usable product brief. This is not another brainstorm. It is the handoff into Design.",
		steps: [
			"Review problem, user, outcome, research, flow, and scope together.",
			"Resolve contradictions before moving on.",
			"Lock the brief as the handoff artifact into Design.",
		],
		emptyState:
			"If the brief still reads like scattered notes, tighten it before leaving the block.",
	},
	sourceRefs: [
		"docs/course-ops/plan.md",
		"docs/recording/sprint-packets.md",
	],
};
