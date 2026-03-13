import { createPendingLessonCoach } from "../content-helpers";
import {
	focusPanelDefaults,
	splitPanelDefaults,
	type LessonConfig,
	type LessonExampleContent,
} from "../contracts";
import { CORE_FLOW_IMAGE_FIELD_ID } from "../core-flow";
import { WORKSHEET_01_RESOURCE, WORKSHEET_01_RESOURCES } from "../resources";

const START_WITH_PROBLEM_EXAMPLES: LessonExampleContent[] = [
	{
		id: "weak-idea-vs-painful-problem",
		title: "Weak idea vs painful problem",
		body: `Weak idea:
I want to build an AI meeting app.

Painful problem:
After team meetings, startup operators lose action items and waste time rewriting messy notes into clear follow-up tasks.`,
	},
	{
		id: "grounded-problem-examples",
		title: "3 grounded problem examples",
		body: `1. After team meetings, startup operators lose action items and waste time rewriting notes.
2. Freelancers forget client follow-ups because project notes are scattered across docs and chat threads.
3. Small teams lose recurring process tasks because nobody owns the checklist after the meeting ends.`,
	},
];

const PICK_ONE_USER_EXAMPLES: LessonExampleContent[] = [
	{
		id: "broad-user-vs-specific-user",
		title: "Broad user vs specific user",
		body: `Broad user:
This app is for teams.

Better but still soft:
This app is for startup teams who have meetings.

Specific user:
This app is for early-stage startup operators who run internal team meetings and need a faster way to turn messy notes into clear action items.`,
	},
	{
		id: "sentence-stem",
		title: "Sentence stem",
		body: `This app is for ___ who need ___ without ___.

Example:
This app is for early-stage startup operators who need to turn meeting notes into clear action items without manually rewriting everything after the call.`,
	},
];

const OUTCOME_EXAMPLES: LessonExampleContent[] = [
	{
		id: "feature-list-vs-user-outcome",
		title: "Feature list vs user outcome",
		body: `Feature-heavy:
The app uses AI to summarize meetings, organize notes, and generate next steps.

User outcome:
The app helps startup operators leave a meeting with a clean action summary they can review and send in minutes.`,
	},
	{
		id: "shortest-outcome-version",
		title: "Shortest outcome version",
		body: `Turn messy meeting notes into a clear action summary in minutes.

Why it works:
It names the changed state on the other side of the product instead of listing features.`,
	},
];

const RESEARCH_EXAMPLES: LessonExampleContent[] = [
	{
		id: "three-reference-note-examples",
		title: "3 reference-note examples",
		body: `Reference 1
- Does well: clean summary output
- Does poorly: unclear task ownership
- Users care about: speed and clarity

Reference 2
- Does well: action items are easy to scan
- Does poorly: too many features before the core use case
- Users care about: sharing the result fast

Reference 3
- Does well: familiar note-taking pattern
- Does poorly: output feels generic
- Users care about: trustworthy summaries and less cleanup work`,
	},
	{
		id: "what-to-extract-from-each-reference",
		title: "What to extract from each reference",
		body: `For each reference, capture:
- What it does well
- Where it creates friction
- What users seem to care about

You are not writing a market report. You are trying not to build blind.`,
	},
];

const RESEARCH_RESOURCES = [WORKSHEET_01_RESOURCE];

const CORE_FLOW_EXAMPLES: LessonExampleContent[] = [
	{
		id: "five-step-core-flow",
		title: "5-step core flow",
		body: `1. User pastes meeting notes.
2. App generates a short action summary.
3. User reviews and edits the summary.
4. User copies or shares it.
5. Team gets a clean follow-up record.

Value moment:
The user sees a usable action summary without rewriting their notes by hand.`,
	},
	{
		id: "messy-flow-vs-clean-flow",
		title: "Messy flow vs clean flow",
		body: `Messy flow:
record meeting -> upload file -> transcribe audio -> identify speakers -> summarize notes -> generate tasks -> assign owners -> sync calendar -> send follow-up email -> track analytics

Clean flow:
paste notes -> generate summary -> review -> share -> done`,
	},
];

const SCOPE_EXAMPLES: LessonExampleContent[] = [
	{
		id: "too-big-vs-sunday-ready",
		title: "Too big vs Sunday-ready",
		body: `Too big:
AI meeting platform with recording upload, transcription, team workspaces, search, Slack integration, calendar sync, speaker recognition, follow-up emails, and analytics dashboard.

Sunday-ready:
Paste meeting notes -> generate action summary -> review -> copy or share.`,
	},
	{
		id: "sunday-test",
		title: "Sunday Test",
		body: `Ask:
What has to work by Sunday for the promise to still be true?

For this example:
A user can paste notes, get a usable summary, and share it.`,
	},
];

export const ceoLessons = [
	{
		id: "1.1",
		slug: "01-01-start-with-the-problem",
		order: 1,
		block: "CEO",
		title: "Start With the Problem",
		shortTitle: "Problem",
		shell: "split",
		workbench: "guided_form",
		artifact: {
			key: "candidate_problems",
			label: "3 Candidate Problems",
			type: "text",
			required: true,
		},
		nextLessonId: "1.2",
		prevLessonId: "0.2",
		unlocks: { lessons: ["1.2"] },
		coachMode: "docked",
		objectiveTitle: "Leave with 3 real candidate pains",
		checklist: [
			"Write 3 real problems",
			"Name who has each problem",
			"Keep them grounded in life or work",
		],
		helperText:
			"Generate three grounded candidate pains now. You will choose one to carry into 1.2 next.",
		winCondition: "Three grounded candidate problems are saved and ready.",
		panelDefaults: splitPanelDefaults,
		fieldShapeVersion: 2,
		workbenchSections: [
			{
				id: "problem_1",
				eyebrow: "Candidate 1",
				title: "Candidate problem 1",
				instruction:
					"Start with a real person or group, then name the recurring pain they keep running into.",
				layout: "split",
				fieldIds: ["problem_1_who", "problem_1_pain"],
				completionLabel: "Candidate problem 1 written",
			},
			{
				id: "problem_2",
				eyebrow: "Candidate 2",
				title: "Candidate problem 2",
				instruction:
					"Keep it grounded in life or work. This should sound like a real headache, not a market theme.",
				layout: "split",
				fieldIds: ["problem_2_who", "problem_2_pain"],
				completionLabel: "Candidate problem 2 written",
			},
			{
				id: "problem_3",
				eyebrow: "Candidate 3",
				title: "Candidate problem 3",
				instruction:
					"Write the pain as something repeated and costly. Avoid solution language.",
				layout: "split",
				fieldIds: ["problem_3_who", "problem_3_pain"],
				completionLabel: "Candidate problem 3 written",
			},
		],
		workbenchFields: [
			{
				id: "problem_1_who",
				label: "Who has this problem?",
				kind: "text",
				required: true,
				placeholder: "Startup operators",
				inputWidth: "compact",
				artifactPreviewLabel: "Problem 1: who",
				taskLabel: "Problem owner 1",
			},
			{
				id: "problem_1_pain",
				label: "What painful problem keeps happening?",
				kind: "textarea",
				required: true,
				rows: 3,
				helpText:
					"Describe the recurring pain in plain language. Keep it specific enough that the person would recognize themselves in it.",
				placeholder:
					"They lose action items after meetings and waste time rebuilding them.",
				inputWidth: "wide",
				artifactPreviewLabel: "Problem 1: pain",
				taskLabel: "Problem statement 1",
			},
			{
				id: "problem_2_who",
				label: "Who has this problem?",
				kind: "text",
				required: true,
				placeholder: "Freelancers",
				inputWidth: "compact",
				artifactPreviewLabel: "Problem 2: who",
				taskLabel: "Problem owner 2",
			},
			{
				id: "problem_2_pain",
				label: "What painful problem keeps happening?",
				kind: "textarea",
				required: true,
				rows: 3,
				helpText:
					"Keep it grounded in a real life or work context, not a vague market idea.",
				placeholder:
					"They forget client follow-ups because their notes and next steps are scattered.",
				inputWidth: "wide",
				artifactPreviewLabel: "Problem 2: pain",
				taskLabel: "Problem statement 2",
			},
			{
				id: "problem_3_who",
				label: "Who has this problem?",
				kind: "text",
				required: true,
				placeholder: "Small teams",
				inputWidth: "compact",
				artifactPreviewLabel: "Problem 3: who",
				taskLabel: "Problem owner 3",
			},
			{
				id: "problem_3_pain",
				label: "What painful problem keeps happening?",
				kind: "textarea",
				required: true,
				rows: 3,
				helpText:
					"Name the person or group inside the problem itself, then describe the repeated pain they deal with.",
				placeholder:
					"They lose recurring process tasks because nobody owns the checklist after meetings.",
				inputWidth: "wide",
				artifactPreviewLabel: "Problem 3: pain",
				taskLabel: "Problem statement 3",
			},
		],
		content: {
			status: "draft",
			intro:
				'Do not start with "I want to build an AI app." Start with "someone has this painful problem."',
			lessonMeta: {
				runtimeLabel: "6-8 min",
				goal: "Get them out of feature-land and into pain-land.",
				purpose:
					"Strong apps start with an annoying, expensive, or emotionally charged problem. Novelty is weaker than pain.",
			},
			actionCard: {
				jobNow:
					"Write down 3 annoying problems from your life or work that would actually be worth solving, and name who has each one.",
				timebox: "10 minutes",
				comeBackWith: "Three candidate problems.",
			},
			coach: createPendingLessonCoach({
				title: "Start With the Problem",
				resources: WORKSHEET_01_RESOURCES,
				examples: START_WITH_PROBLEM_EXAMPLES,
			}),
			workbench: {
				prompt:
					'Do not start with "I want to build an AI app." Start with "someone has this painful problem."',
				teachingPoints: [
					"Contrast weak starts with stronger problem statements.",
					"Explain why personal pain is often the best starting point.",
					"Give 2-3 examples from your own life or products.",
				],
				emptyState:
					'Do not start with "I want to build an AI app." Start with "someone has this painful problem."',
			},
		},
	},
	{
		id: "1.2",
		slug: "01-02-pick-one-user",
		order: 2,
		block: "CEO",
		title: "Pick One User",
		shortTitle: "User",
		shell: "split",
		workbench: "guided_form",
		artifact: {
			key: "user_statement",
			label: "User Statement",
			contextTitle: "Our user",
			type: "text",
			required: true,
			dependsOn: ["candidate_problems"],
		},
		nextLessonId: "1.3",
		prevLessonId: "1.1",
		unlocks: { lessons: ["1.3"] },
		coachMode: "docked",
		objectiveTitle: "CEO 1.2 — Pick One User",
		checklist: [
			"Pick problem to carry forward",
			"Pain moment",
			"Current workaround",
			"Reachability",
		],
		handoff: {
			mode: "select_candidate_problem",
			sourceArtifactKey: "candidate_problems",
			selectionFieldId: "selected_problem_index",
			options: [
				{
					index: 1,
					ownerSourceFieldId: "problem_1_who",
					statementSourceFieldId: "problem_1_pain",
				},
				{
					index: 2,
					ownerSourceFieldId: "problem_2_who",
					statementSourceFieldId: "problem_2_pain",
				},
				{
					index: 3,
					ownerSourceFieldId: "problem_3_who",
					statementSourceFieldId: "problem_3_pain",
				},
			],
			persistedFields: [
				{
					targetFieldId: "selected_problem_owner",
					source: "owner",
					previewLabel: "User",
				},
				{
					targetFieldId: "selected_problem_statement",
					source: "statement",
					previewLabel: "Chosen problem",
				},
			],
		},
		helperText:
			"Pick the problem to carry forward. That choice already locks the user. Now ground it in a real moment, a current workaround, and a path to reach them.",
		winCondition: "One clear user statement is saved.",
		panelDefaults: splitPanelDefaults,
		fieldShapeVersion: 3,
		pinnedArtifacts: ["candidate_problems"],
		workbenchSections: [
			{
				id: "pain_moment",
				eyebrow: "Make it concrete",
				title: "Define when this problem hits",
				instruction:
					"Choosing the problem to carry forward already chose the user. Now capture the moment when this problem is most painful for them.",
				layout: "stack",
				fieldIds: ["pain_moment"],
				completionLabel: "Pain moment defined",
				blockedByFieldIds: ["selected_problem_index"],
			},
			{
				id: "reality_check",
				eyebrow: "Reality check",
				title: "Confirm this is grounded",
				instruction:
					"Make sure this is a real user with a current workaround and a path to reach them this week.",
				layout: "stack",
				fieldIds: ["current_solution", "reachability"],
				completionLabel: "Current workaround and reachability confirmed",
				blockedByFieldIds: ["selected_problem_index"],
			},
		],
		workbenchFields: [
			{
				id: "pain_moment",
				label: "When does this problem hit?",
				kind: "textarea",
				required: true,
				rows: 3,
				placeholder:
					"Right after team meetings, when decisions and next steps need to get shared fast.",
				inputWidth: "wide",
				artifactPreviewLabel: "Pain moment",
				taskLabel: "Pain moment",
			},
			{
				id: "current_solution",
				label: "How do they handle it today?",
				kind: "textarea",
				required: true,
				rows: 3,
				placeholder:
					"Messy notes, memory, and a manual cleanup pass after the meeting.",
				inputWidth: "wide",
				artifactPreviewLabel: "Current workaround",
				taskLabel: "Current workaround",
			},
			{
				id: "reachability",
				label: "Why can you reach them this week?",
				kind: "textarea",
				required: true,
				rows: 2,
				placeholder:
					"I already know a few people like this and can show them a demo.",
				inputWidth: "wide",
				artifactPreviewLabel: "Reachability",
				taskLabel: "Reachability",
			},
		],
		content: {
			status: "draft",
			intro:
				"Pick the problem to carry forward. That choice already locks the user. Now ground it in a real moment, a current workaround, and a path to reach them.",
			lessonMeta: {
				runtimeLabel: "5-7 min",
				goal: "Force specificity and constraint.",
				purpose:
					"The student needs one user in one situation. Broad audiences kill speed.",
			},
			actionCard: {
				jobNow:
					"Pick the problem to carry forward, then define when it hits, how they handle it today, and why you can reach them.",
				timebox: "10 minutes",
				comeBackWith:
					"One chosen problem grounded in a real moment and reachable path.",
			},
			coach: createPendingLessonCoach({
				title: "Pick One User",
				resources: WORKSHEET_01_RESOURCES,
				examples: PICK_ONE_USER_EXAMPLES,
			}),
			workbench: {
				prompt:
					"Pick the problem to carry forward. That choice already locks the user. Now ground it in a real moment, a current workaround, and a path to reach them.",
				teachingPoints: [
					"Choosing the problem to carry forward already chooses the user.",
					"Name the moment when this problem feels sharpest for them.",
					"Pressure-test reachability before you move on.",
				],
				emptyState:
					"Pick the problem to carry forward. That choice already locks the user. Now ground it in a real moment, a current workaround, and a path to reach them.",
			},
		},
	},
	{
		id: "1.3",
		slug: "01-03-define-the-outcome",
		order: 3,
		block: "CEO",
		title: "Define the Outcome",
		shortTitle: "Outcome",
		shell: "split",
		workbench: "guided_form",
		artifact: {
			key: "outcome_statement",
			label: "Outcome Statement",
			contextTitle: "Outcome statement",
			type: "text",
			required: true,
			dependsOn: ["user_statement"],
		},
		nextLessonId: "1.4",
		prevLessonId: "1.2",
		unlocks: { lessons: ["1.4"] },
		coachMode: "docked",
		objectiveTitle: "CEO 1.3 — Define the Outcome",
		checklist: [
			"Use the chosen user",
			"Write one clear user-facing outcome",
			"Keep it observable",
		],
		helperText:
			"Describe what gets better for the user, not what the app contains.",
		winCondition: "One clear outcome statement is saved.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["user_statement"],
		workbenchSections: [
			{
				id: "outcome",
				eyebrow: "Promise",
				title: "Write the promised outcome",
				instruction:
					"State the changed condition for the user. If it sounds like a feature list, rewrite it as a result.",
				layout: "stack",
				fieldIds: ["outcome"],
				completionLabel: "Outcome statement written",
			},
			{
				id: "evidence",
				eyebrow: "Make it real",
				title: "Show what success looks like",
				instruction:
					"Describe what the user can now do and what stops being painful once the product works.",
				layout: "stack",
				fieldIds: ["success_looks_like", "difference_for_user"],
				completionLabel: "Outcome proof described",
			},
		],
		workbenchFields: [
			{
				id: "outcome",
				label: "One clear user-facing outcome statement",
				kind: "text",
				required: true,
				placeholder:
					"Startup operators leave a meeting with a clean action summary they can review and send in minutes.",
				inputWidth: "wide",
				artifactPreviewLabel: "Outcome statement",
				taskLabel: "Outcome statement",
			},
			{
				id: "success_looks_like",
				label: "Success looks like...",
				kind: "textarea",
				required: true,
				rows: 3,
				placeholder:
					"They can paste notes, review a usable action summary, and share it without rebuilding everything by hand.",
				inputWidth: "wide",
				artifactPreviewLabel: "Success looks like",
				taskLabel: "Success looks like",
			},
			{
				id: "difference_for_user",
				label: "What will be different for the user?",
				kind: "textarea",
				required: true,
				rows: 3,
				placeholder:
					"They stop losing decisions in messy notes and can close the loop while the meeting is still fresh.",
				inputWidth: "wide",
				artifactPreviewLabel: "Difference for the user",
				taskLabel: "Difference for user",
			},
		],
		content: {
			status: "draft",
			intro: "People buy outcomes, not tools.",
			lessonMeta: {
				runtimeLabel: "5-6 min",
				goal: "Translate features into transformation.",
				purpose:
					"Students need to define the promised outcome so the product can be judged by a result, not a pile of features.",
			},
			actionCard: {
				jobNow: "Write one user-facing outcome statement.",
				timebox: "5 minutes",
				comeBackWith: "One clear promised outcome.",
			},
			coach: createPendingLessonCoach({
				title: "Define the Outcome",
				resources: WORKSHEET_01_RESOURCES,
				examples: OUTCOME_EXAMPLES,
			}),
			workbench: {
				prompt: "People buy outcomes, not tools.",
				teachingPoints: [
					"Write one sentence that starts with: After using this, the user can...",
					"Give weak feature-heavy examples, then rewrite them into outcomes.",
					"Tie this outcome to what will be shown in the demo later.",
				],
				emptyState: "People buy outcomes, not tools.",
			},
		},
	},
	{
		id: "1.4",
		slug: "01-04-light-research-not-a-thesis",
		order: 4,
		block: "CEO",
		title: "Light Research, Not a Thesis",
		shortTitle: "Research",
		shell: "split",
		workbench: "score_table",
		artifact: {
			key: "research_notes",
			label: "Research Notes",
			type: "table",
			required: true,
			dependsOn: ["outcome_statement"],
		},
		nextLessonId: "1.5",
		prevLessonId: "1.3",
		unlocks: { lessons: ["1.5"] },
		coachMode: "docked",
		objectiveTitle: "CEO 1.4 — Light Research, Not a Thesis",
		checklist: [
			"Add 2–3 competitors or references",
			"Note what they do well",
			"Note what they do poorly",
			"Capture what users seem to care about",
		],
		helperText: "Collect signal fast. Do not turn this into a thesis project.",
		winCondition: "2–3 research entries and one summary insight are saved.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: ["user_statement", "outcome_statement"],
		promptImport: {
			promptTemplateId: "competitor_research",
			tableFieldId: "research_table",
			summaryFieldId: "research_summary",
		},
		workbenchFields: [
			{
				id: "research_table",
				label: "Research Table",
				kind: "table",
				required: true,
				columns: [
					{
						id: "competitor",
						label: "Competitor",
						kind: "text",
						placeholder: "Name the product",
						width: "compact",
					},
					{
						id: "good",
						label: "Good",
						kind: "text",
						placeholder: "What it does well",
					},
					{
						id: "poor",
						label: "Poor",
						kind: "text",
						placeholder: "Where it breaks down",
					},
					{
						id: "usersCareAbout",
						label: "Users Care About",
						kind: "text",
						placeholder: "What matters most",
						width: "wide",
					},
				],
				helpText: "Columns: Competitor, Good, Poor, Users Care About",
			},
			{
				id: "research_summary",
				label: "Key pattern I noticed",
				kind: "textarea",
				required: true,
				rows: 3,
			},
		],
		content: {
			status: "draft",
			intro:
				"You are not writing a market report. You are trying to understand how this gets solved today.",
			lessonMeta: {
				runtimeLabel: "8-10 min",
				goal: "Gather signal without disappearing into research hell.",
				purpose: "Students need pattern awareness, not a dissertation.",
			},
			actionCard: {
				jobNow:
					"Find 2-3 existing solutions and write down what they do well, badly, and what users seem to care about.",
				timebox: "20 minutes",
				comeBackWith: "Three short research notes.",
			},
			coach: createPendingLessonCoach({
				title: "Light Research, Not a Thesis",
				resources: RESEARCH_RESOURCES,
				examples: RESEARCH_EXAMPLES,
			}),
			workbench: {
				prompt:
					"You are not writing a market report. You are trying to understand how this gets solved today.",
				teachingPoints: [
					"Show quick scans of Google, app stores, Reddit, or product sites.",
					"Capture: what they do well, what they do poorly, what users seem to care about.",
					"Keep the note format brutally simple.",
				],
				emptyState:
					"You are not writing a market report. You are trying to understand how this gets solved today.",
			},
		},
	},
	{
		id: "1.5",
		slug: "01-05-map-the-core-flow",
		order: 5,
		block: "CEO",
		title: "Map the Core Flow",
		shortTitle: "Flow",
		shell: "focus",
		availableLayoutModes: ["focus"],
		workbench: "paper_photo_upload",
		artifact: {
			key: "core_flow_image",
			label: "Core Flow Map",
			type: "image",
			required: true,
			dependsOn: ["user_statement", "outcome_statement"],
		},
		nextLessonId: "1.6",
		prevLessonId: "1.4",
		unlocks: { lessons: ["1.6"] },
		coachMode: "docked",
		objectiveTitle: "CEO 1.5 — Map the Core Flow",
		checklist: [
			"Watch the walkthrough",
			"Draw the core flow on paper",
			"Upload one clear photo",
		],
		helperText:
			"Watch the walkthrough, draw the core flow off-screen with paper and pen, then upload one clean photo before continuing.",
		winCondition: "The core flow map is saved as a lesson image.",
		panelDefaults: focusPanelDefaults,
		fieldShapeVersion: 5,
		pinnedArtifacts: ["user_statement", "outcome_statement"],
		workbenchFields: [
			{
				id: CORE_FLOW_IMAGE_FIELD_ID,
				label: "Upload core flow photo",
				kind: "image_upload",
				required: true,
				helpText:
					"A paper photo is ideal. A tablet sketch, FigJam screenshot, or another off-screen image still counts if the 5-7 step flow is clear.",
				taskLabel: "Upload core flow photo",
			},
		],
		content: {
			status: "draft",
			intro:
				"Watch the walkthrough, map the core flow on paper, and upload one clean photo before you move on.",
			lessonMeta: {
				runtimeLabel: "6-8 min",
				goal: "Get the core flow out of your head and onto paper fast.",
				purpose:
					"This keeps the product concrete before Design. A clear hand-drawn flow is enough for the next step.",
			},
			actionCard: {
				jobNow:
					"Watch the lesson, draw the core flow on paper in 5-7 steps, then upload one clear photo.",
				timebox: "15 minutes",
				comeBackWith: "One uploaded core flow photo.",
			},
			coach: createPendingLessonCoach({
				title: "Map the Core Flow",
				resources: WORKSHEET_01_RESOURCES,
				examples: CORE_FLOW_EXAMPLES,
			}),
			workbench: {
				prompt:
					"Do this off-screen. Watch first, map the core flow on paper, and bring back one clean photo.",
				teachingPoints: [
					"Paper and pen is the default. Do it fast, not beautifully.",
					"Keep it to 5-7 steps and make the sequence easy to follow.",
					"If you already did it on a tablet or digitally, one clean screenshot still counts.",
				],
				emptyState:
					"Do this off-screen. Watch first, map the core flow on paper, and bring back one clean photo.",
			},
		},
	},
	{
		id: "1.6",
		slug: "01-06-kill-scope",
		order: 6,
		block: "CEO",
		title: "Scope Hammer",
		shortTitle: "Scope",
		shell: "split",
		workbench: "scope_split",
		artifact: {
			key: "scope_boundary",
			label: "Scope Boundary",
			type: "mixed",
			required: true,
			dependsOn: ["core_flow_image"],
		},
		nextLessonId: "1.7",
		prevLessonId: "1.5",
		unlocks: { lessons: ["1.7"] },
		coachMode: "docked",
		objectiveTitle: "CEO 1.6 — Scope Hammer",
		checklist: [
			"Define what stays in v1",
			"Define what is explicitly out of scope",
			"Write why this is enough for v1",
		],
		helperText: "Cut fantasy. Keep the smallest believable version.",
		winCondition:
			"In-scope list, out-of-scope list, and v1 rationale are saved.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: [
			"user_statement",
			"outcome_statement",
			"research_notes",
			"core_flow_image",
		],
		promptImport: {
			promptTemplateId: "scope_boundary",
			inScopeFieldId: "in_scope",
			outOfScopeFieldId: "out_of_scope",
			rationaleFieldId: "v1_rationale",
		},
		workbenchFields: [
			{
				id: "in_scope",
				label: "Keep in v1",
				kind: "board",
				required: true,
				placeholder:
					"One feature per line. Keep only what must exist for the user to get the win.",
				artifactPreviewLabel: "Keep in v1",
				taskLabel: "Keep in v1",
			},
			{
				id: "out_of_scope",
				label: "Cut from v1",
				kind: "board",
				required: true,
				placeholder:
					"One cut per line. Name the tempting extras that do not belong in the weekend build.",
				artifactPreviewLabel: "Cut from v1",
				taskLabel: "Cut from v1",
			},
			{
				id: "v1_rationale",
				label: "Why this version is enough",
				kind: "textarea",
				required: true,
				rows: 3,
				artifactPreviewLabel: "Why this version is enough",
				taskLabel: "Why this version is enough",
			},
		],
		content: {
			status: "draft",
			intro: "A smaller shipped app beats a larger imaginary one.",
			lessonMeta: {
				runtimeLabel: "6-8 min",
				goal: "Prevent weekend death by feature creep.",
				purpose: "The key behavior here is subtraction.",
			},
			actionCard: {
				jobNow:
					"Use the prompt to get a first-pass scope cut, then tighten it until the app feels brutally small.",
				timebox: "10 minutes",
				comeBackWith: "A tighter MVP scope.",
			},
			coach: createPendingLessonCoach({
				title: "Kill Scope",
				resources: WORKSHEET_01_RESOURCES,
				examples: SCOPE_EXAMPLES,
			}),
			workbench: {
				prompt: "A smaller shipped app beats a larger imaginary one.",
				teachingPoints: [
					"Start from the generated cut list, then delete one more thing.",
					"Keep the product inside one believable user win.",
					"If a feature helps later but is not required for the core outcome, cut it.",
				],
				emptyState: "A smaller shipped app beats a larger imaginary one.",
			},
		},
	},
	{
		id: "1.7",
		slug: "01-07-ceo-block-wrap-up",
		order: 7,
		block: "CEO",
		title: "CEO Wrap-Up",
		shortTitle: "Brief",
		shell: "split",
		workbench: "brief_assembler",
		artifact: {
			key: "product_brief",
			label: "Product Brief",
			type: "brief",
			required: true,
			dependsOn: [
				"candidate_problems",
				"user_statement",
				"outcome_statement",
				"research_notes",
				"core_flow_image",
				"scope_boundary",
			],
		},
		nextLessonId: "2.1",
		prevLessonId: "1.6",
		unlocks: { lessons: ["2.1"], blocks: ["DESIGN"] },
		coachMode: "docked",
		objectiveTitle: "CEO 1.7 — CEO Wrap-Up",
		checklist: [
			"Review all CEO outputs",
			"Confirm the product brief",
			"Lock the artifact",
		],
		helperText: "CEO block complete. Lock the brief and move into Design.",
		winCondition: "The product brief is assembled and locked.",
		panelDefaults: splitPanelDefaults,
		pinnedArtifacts: [
			"user_statement",
			"outcome_statement",
			"research_notes",
			"core_flow_image",
			"scope_boundary",
		],
		briefAssembler: {
			variant: "stage_unlock",
			preset: "ceo",
			heroEyebrow: "CEO block complete",
			heroTitle: "Design unlocked",
			heroBody:
				"You turned a fuzzy idea into a real product direction. The user, outcome, evidence, flow, and scope are all locked into one handoff brief now.",
			nextStepLabel: "DESIGN 2.1 — Find References First",
			skills: [
				"Problem framing",
				"User clarity",
				"Outcome definition",
				"Evidence gathering",
				"Flow mapping",
				"Scope discipline",
			],
			artifactReadyCopy:
				"You are not guessing anymore. Design gets a real handoff now.",
			readyStateCopy: "CEO block complete. Lock the brief and unlock Design.",
			completionCtaLabel: "Unlock Design",
			celebrationEyebrow: "CEO block complete",
			celebrationTitle: "Design unlocked",
		},
		content: {
			status: "draft",
			intro:
				"You did the hardest part: you turned a vague idea into a clear first version.",
			lessonMeta: {
				runtimeLabel: "2-3 min",
				goal: "Lock the brief so the next block has real inputs.",
				purpose: "This is the handoff from thinking to form.",
			},
			actionCard: {
				jobNow:
					"Take a fast victory lap, review the brief, then unlock Design.",
				timebox: "2 minutes",
				comeBackWith: "A locked product brief and a clear jump into Design.",
			},
			coach: createPendingLessonCoach({
				title: "CEO Block Wrap-Up",
				resources: WORKSHEET_01_RESOURCES,
			}),
			workbench: {
				prompt:
					"This should now read like a real handoff instead of a pile of notes.",
				teachingPoints: [
					"Review the problem, user, outcome, flow, and scope as one story.",
					"Make the transition into Design feel earned and obvious.",
				],
				emptyState:
					"This should now read like a real handoff instead of a pile of notes.",
			},
		},
	},
] satisfies LessonConfig[];
