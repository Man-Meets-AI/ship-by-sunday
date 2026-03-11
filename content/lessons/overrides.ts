import type { LessonContent } from "@/content/lessons/types";

type LessonContentOverride = {
	intro?: string;
	actionCard?: Partial<LessonContent["actionCard"]>;
	workbench?: Partial<LessonContent["workbench"]>;
};

export const lessonContentOverrides: Record<string, LessonContentOverride> = {
	"0.1": {
		workbench: {
			sections: {
				weekend_goal: {
					instruction:
						"Write the smallest believable thing you want live by Sunday. If it needs a roadmap to explain it, it is too big for this sprint.",
					exampleLabel: "Example",
					example:
						"A simple meeting-summary app where a startup operator can paste notes, generate a clean action summary, and copy it into Slack before the meeting follow-up gets lost.",
				},
			},
		},
	},
	"1.1": {
		workbench: {
			sections: {
				problem_1: {
					instruction:
						"Start with a real person or group, then name the recurring pain they keep running into.",
					exampleLabel: "Example",
					example:
						"Startup operators lose action items after meetings and waste time rebuilding them from messy notes.",
				},
				problem_2: {
					instruction:
						"Keep it grounded in life or work. This should sound like a real headache, not a market theme.",
					exampleLabel: "Example",
					example:
						"Freelancers forget client follow-ups because their notes and next steps are scattered across too many places.",
				},
				problem_3: {
					instruction:
						"Write the pain as something repeated and costly. Avoid solution language.",
					exampleLabel: "Example",
					example:
						"Small teams lose recurring process tasks because nobody owns the checklist after meetings end.",
				},
			},
		},
	},
	"1.2": {
		intro:
			"Pick one of the three problems you just wrote. Then name the most specific reachable user living with that problem.",
		actionCard: {
			jobNow:
				"Choose one candidate problem to carry forward, then define the user living with it.",
			comeBackWith:
				"One chosen problem and one clear user statement.",
		},
		workbench: {
			prompt:
				"Pick one of the three problems you just wrote. Then name the most specific reachable user living with that problem.",
			sections: {
				user_statement: {
					instruction:
						"Choose one specific reachable user inside the problem you just selected. Broad audiences slow everything down.",
					exampleLabel: "Example",
					example:
						"This app is for early-stage startup operators who leave internal meetings with messy notes and need to turn them into a clean action summary fast.",
				},
				reality_check: {
					instruction:
						"Make sure this is a real person with a current workaround and a path to reach them this week.",
				},
			},
		},
	},
	"1.3": {
		workbench: {
			sections: {
				outcome: {
					instruction:
						"State the changed condition for the user. If it sounds like a feature list, rewrite it as a result.",
					exampleLabel: "Example",
					example:
						"Startup operators leave a meeting with a clean action summary they can review and send in minutes.",
				},
				evidence: {
					instruction:
						"Describe what the user can now do and what stops being painful once the product works.",
				},
			},
		},
	},
};
