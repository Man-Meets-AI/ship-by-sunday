import type { LessonContent } from "@/content/lessons/types";

export const howTheSprintWorksLessonContent: LessonContent = {
	lessonId: "0.2",
	slug: "00-02-how-the-sprint-works",
	status: "draft",
	intro:
		"Set up the sprint so the first real lesson starts without friction. The student should leave this lesson knowing the 4-block sequence, having the worksheet packet open, and knowing exactly what they will do first in CEO 1.1.",
	coach: {
		video: {
			status: "pending",
			title: "How the Sprint Works",
		},
		transcript: {
			status: "empty",
		},
		examples: [
			{
				id: "sequence",
				title: "4-block path",
				body:
					"CEO chooses the right problem and scope. DESIGN turns it into something buildable. BUILD creates the working local version. SHIP gets the core flow live and in front of real humans.",
			},
			{
				id: "first-30-minutes",
				title: "First 30 minutes",
				body:
					"Watch the two intro lessons, open the worksheet packet, duplicate the templates, and start Worksheet 01 in the CEO block. Do not try to watch everything first.",
			},
		],
	},
	workbench: {
		prompt:
			"Use this checklist to remove preventable friction before you start CEO 1.1. The goal is a clean handoff into the first real rep.",
		steps: [
			"Open the worksheet packet.",
			"Get the working folder and templates ready.",
			"Name the first move you will make in CEO 1.1.",
		],
		emptyState:
			"If the setup is vague here, the student will stall before the real work starts.",
	},
	sourceRefs: [
		"docs/course-ops/plan.md",
		"docs/recording/sprint-packets.md",
		"docs/recording/founder-checklists.md",
	],
};
