import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("convex/react", () => ({
	useMutation: () => vi.fn(),
}));

globalThis.React = React;

import { WorkbenchRenderer } from "@/components/lesson-workbench";
import type { PinnedArtifact } from "@/components/lesson-shells";
import { buildArtifactPreview, getLessonById } from "@/lib/course";

function renderLessonWorkbench(
	lessonId: string,
	options?: {
		fieldValues?: Record<string, unknown>;
		pinnedArtifacts?: PinnedArtifact[];
		invalidFieldIds?: Set<string>;
	},
) {
	const lesson = getLessonById(lessonId);
	expect(lesson).toBeTruthy();

	return renderToStaticMarkup(
		<WorkbenchRenderer
			lesson={lesson!}
			lessonContent={lesson!.content}
			fieldValues={options?.fieldValues ?? {}}
			onFieldChange={() => {}}
			pinnedArtifacts={options?.pinnedArtifacts ?? []}
			invalidFieldIds={options?.invalidFieldIds ?? new Set<string>()}
		/>,
	);
}

function getCandidateProblemsArtifact(): PinnedArtifact {
	const lesson = getLessonById("1.1");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		__fieldShapeVersion: 2,
		problem_1_who: "Startup operators",
		problem_1_pain:
			"They lose action items after meetings and waste time rebuilding them.",
		problem_2_who: "Agency owners",
		problem_2_pain:
			"They forget which client requests turned into actual next steps.",
		problem_3_who: "Freelancers",
		problem_3_pain:
			"They leave calls with loose notes and miss what to do next.",
	});
}

function getUserStatementArtifact(): PinnedArtifact {
	const lesson = getLessonById("1.2");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		__fieldShapeVersion: 3,
		selected_problem_index: 1,
		selected_problem_owner: "Startup operators",
		selected_problem_statement:
			"They lose action items after meetings and waste time rebuilding them.",
		pain_moment:
			"Right after team meetings when they need to share next steps fast.",
		current_solution:
			"Messy notes, memory, and a manual cleanup pass after the meeting.",
		reachability:
			"I already know a few operators who would try this this week.",
	});
}

function getOutcomeStatementArtifact(): PinnedArtifact {
	const lesson = getLessonById("1.3");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		outcome:
			"Startup operators leave a meeting with a clean action summary they can review and send in minutes.",
		success_looks_like:
			"They can paste notes, review a usable action summary, and share it without rebuilding everything by hand.",
		difference_for_user:
			"They stop losing decisions in messy notes and can close the loop while the meeting is still fresh.",
	});
}

function getResearchNotesArtifact(): PinnedArtifact {
	const lesson = getLessonById("1.4");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		research_table: [
			["Notion", "Fast setup", "Weak export", "Speed"],
			["Coda", "Flexible docs", "Too much setup", "Customization"],
			["Tana", "Strong structure", "Steep learning curve", "Clean workflows"],
		],
		research_summary:
			"People care most about speed and clarity after the meeting, not giant knowledge-management features.",
	});
}

function getCoreFlowArtifact(): PinnedArtifact {
	const lesson = getLessonById("1.5");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		__fieldShapeVersion: 4,
		flow_actors: ["Startup operators"],
		flow_steps: [
			["Startup operators", "Paste notes"],
			["Startup operators", "Generate summary"],
			["Startup operators", "Review action items"],
			["Startup operators", "Share next steps"],
			["Startup operators", "Close the loop"],
		],
		flow_ending: "They leave with a clean action summary in minutes.",
		__core_flow_image_upload: {
			kind: "upload",
			status: "stored",
			storageId: "core-flow-image",
			url: "https://example.com/core-flow.png",
		},
	});
}

function getScopeBoundaryArtifact(): PinnedArtifact {
	const lesson = getLessonById("1.6");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		in_scope: ["Paste notes", "Generate summary", "Share next steps"],
		out_of_scope: [
			"Team collaboration",
			"Project dashboards",
			"CRM sync",
			"Analytics",
		],
		v1_rationale:
			"If the operator can move from messy notes to a clean action summary fast, the first version did its job.",
	});
}

describe("WorkbenchRenderer", () => {
	it("renders representative workbench modes without hitting the fallback", () => {
		const scenarios: Array<{
			lessonId: string;
			expected: string;
			pinnedArtifacts?: PinnedArtifact[];
		}> = [
			{
				lessonId: "0.2",
				expected: "Sprint roadmap",
			},
			{
				lessonId: "1.1",
				expected: "Candidate problem 1",
			},
			{
				lessonId: "1.2",
				expected: "Pick the problem to carry forward",
				pinnedArtifacts: [getCandidateProblemsArtifact()],
			},
			{
				lessonId: "1.4",
				expected: "Research table",
			},
			{
				lessonId: "1.5",
				expected: "Core flow stage",
			},
			{
				lessonId: "1.6",
				expected: "Keep in v1",
			},
			{
				lessonId: "2.1",
				expected: "Reference Board",
			},
			{
				lessonId: "3.1",
				expected: "Definition of done",
				pinnedArtifacts: [
					{
						artifactKey: "user_statement",
						artifactLabel: "User Statement",
						contextTitle: "Our user",
						lessonTitle: "Pick One User",
						fieldValues: {},
						fields: [
							["Chosen problem", "Operators lose the meeting thread."],
							["User", "Startup operators"],
						],
					},
				],
			},
			{
				lessonId: "3.2",
				expected: "Environment ready",
			},
			{
				lessonId: "3.3",
				expected: "External workspace",
			},
			{
				lessonId: "3.5",
				expected: "Blocker Log",
			},
		];

		for (const scenario of scenarios) {
			const markup = renderLessonWorkbench(scenario.lessonId, {
				pinnedArtifacts: scenario.pinnedArtifacts,
			});

			expect(markup).toContain(scenario.expected);
			expect(markup).not.toContain(
				"This workbench type has not been wired yet.",
			);
		}
	});

	it("renders the research workbench as a single-title semantic table", () => {
		const markup = renderLessonWorkbench("1.4", {
			fieldValues: {
				research_table: [["Notion", "Fast setup", "Weak export", "Speed"]],
			},
		});

		expect(markup).toContain("<table");
		expect(markup).toContain("Competitor");
		expect(markup).toContain("Users Care About");
		expect(markup).toContain(
			'<span class="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">Research table</span>',
		);
		expect(markup).not.toContain(
			'<span class="font-display text-sm uppercase tracking-[0.04em] text-product-text">Research Table</span>',
		);
	});

	it("renders tracker lessons with semantic table controls", () => {
		const markup = renderLessonWorkbench("3.5", {
			fieldValues: {
				blocker_table: [["Auth bug", "Missing env", "Retried login", "No"]],
			},
		});

		expect(markup).toContain("<table");
		expect(markup).toContain("Resolved?");
		expect(markup).toContain("Add Row");
	});

	it("shows candidate problem choices for lesson 1.2 handoff", () => {
		const markup = renderLessonWorkbench("1.2", {
			pinnedArtifacts: [getCandidateProblemsArtifact()],
			invalidFieldIds: new Set(["selected_problem_index"]),
		});

		expect(markup).toContain("Problem 1");
		expect(markup).toContain("Startup operators");
		expect(markup).toContain(
			"Pick the problem to carry forward before continuing.",
		);
		expect(markup).not.toContain("Carry forward");
	});

	it("treats the selected problem owner as the chosen user on lesson 1.2", () => {
		const markup = renderLessonWorkbench("1.2", {
			pinnedArtifacts: [getCandidateProblemsArtifact()],
			fieldValues: {
				selected_problem_index: 1,
				selected_problem_owner: "Startup operators",
				selected_problem_statement:
					"They lose action items after meetings and waste time rebuilding them.",
			},
		});

		expect(markup).toContain("Chosen user");
		expect(markup).toContain("Problem 1");
		expect(markup).toContain(
			"The selected problem owner is your user. Now ground this direction in a real moment, a current workaround, and a path to reach them.",
		);
		expect(markup).not.toContain(
			"Now define the specific user inside this chosen problem.",
		);
	});

	it("renders stage-save and fallback controls for lesson 1.5", () => {
		const markup = renderLessonWorkbench("1.5");

		expect(markup).toContain("Save image");
		expect(markup).toContain("Upload external screenshot");
		expect(markup).toContain("Use Figma instead");
	});

	it("renders the lesson metadata badges as non-selectable chrome", () => {
		const markup = renderLessonWorkbench("1.5");

		expect(markup).toContain(
			'<div class="flex flex-wrap items-center gap-1.5 text-product-muted select-none">',
		);
	});

	it("renders lesson 1.5 with the FigJam template and clean pinned context cards", () => {
		const markup = renderLessonWorkbench("1.5", {
			pinnedArtifacts: [
				getUserStatementArtifact(),
				getOutcomeStatementArtifact(),
			],
		});

		expect(markup).toContain("Open FigJam template");
		expect(markup).toContain(
			"https://www.figma.com/board/csR3w46LJaHNU0RKHVOJDB/Template-for-Storyboard?node-id=0-1",
		);
		expect(markup).toContain('target="_blank"');
		expect(markup).toContain('rel="noreferrer"');
		expect(markup).toContain("Core flow stage");
		expect(markup).toContain("Saved artifact");
		expect(markup).toContain("Upload external screenshot");
		expect(markup).toContain("Our user");
		expect(markup).toContain("Outcome statement");
		expect(markup).not.toContain("Research Notes");
		expect(markup).not.toContain("Template Preview");
		expect(markup).not.toContain(
			"This field will populate from an earlier saved artifact.",
		);
		expect(markup).not.toContain("Pick One User");
		expect(markup).not.toContain("Define the Outcome");
	});

	it("renders lesson 1.7 as a stage-unlock wrap-up instead of a raw artifact dump", () => {
		const markup = renderLessonWorkbench("1.7", {
			pinnedArtifacts: [
				getUserStatementArtifact(),
				getOutcomeStatementArtifact(),
				getResearchNotesArtifact(),
				getCoreFlowArtifact(),
				getScopeBoundaryArtifact(),
			],
		});

		expect(markup).toContain("CEO block complete");
		expect(markup).toContain("Design unlocked");
		expect(markup).toContain("Next: DESIGN 2.1 — Find References First");
		expect(markup).toContain("1 user locked");
		expect(markup).toContain("3 research signals");
		expect(markup).toContain("What you built");
		expect(markup).toContain("Skills you flexed");
		expect(markup).toContain("Problem framing");
		expect(markup).toContain("Scope discipline");
		expect(markup).toContain("Who");
		expect(markup).toContain("Outcome");
		expect(markup).toContain("Evidence");
		expect(markup).toContain("Flow");
		expect(markup).toContain("Scope");
		expect(markup).toContain("https://example.com/core-flow.png");
		expect(markup).not.toContain("ArtifactContext");
		expect(markup).not.toContain("No saved preview yet.");
	});
});
