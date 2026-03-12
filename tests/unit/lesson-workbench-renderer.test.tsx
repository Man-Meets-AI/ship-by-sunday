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
				expected: "Upload Core Flow Image",
			},
			{
				lessonId: "1.6",
				expected: "In scope",
			},
			{
				lessonId: "2.1",
				expected: "Reference board",
			},
			{
				lessonId: "3.1",
				expected: "Definition of done",
				pinnedArtifacts: [
					{
						artifactKey: "user_statement",
						artifactLabel: "User Statement",
						contextTitle: "Current direction",
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
				expected: "Tracker",
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

	it("renders upload instructions for capture-upload lessons", () => {
		const markup = renderLessonWorkbench("1.5");

		expect(markup).toContain(
			"Choose a file and it will upload to lesson storage before the lesson draft is saved.",
		);
	});
});
