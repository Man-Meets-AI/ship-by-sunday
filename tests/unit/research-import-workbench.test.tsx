import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("convex/react", () => ({
	useMutation: () => vi.fn(),
}));

globalThis.React = React;

import { WorkbenchRenderer } from "@/components/lesson-workbench";
import type { PinnedArtifact } from "@/components/lesson-shells";
import { buildArtifactPreview, getLessonById } from "@/lib/course";

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
			["Tana", "Flexible workflows", "Steeper learning curve", "Flexibility"],
		],
		research_summary:
			"Users want speed first, but they get frustrated when the workflow falls apart under real use.",
	});
}

function renderResearchWorkbench(fieldValues?: Record<string, unknown>) {
	const lesson = getLessonById("1.4");
	expect(lesson).toBeTruthy();

	return renderToStaticMarkup(
		<WorkbenchRenderer
			lesson={lesson!}
			lessonContent={lesson!.content}
			fieldValues={fieldValues ?? {}}
			onFieldChange={() => {}}
			pinnedArtifacts={[
				getUserStatementArtifact(),
				getOutcomeStatementArtifact(),
			]}
			invalidFieldIds={new Set<string>()}
		/>,
	);
}

function renderScopeWorkbench(fieldValues?: Record<string, unknown>) {
	const lesson = getLessonById("1.6");
	expect(lesson).toBeTruthy();

	return renderToStaticMarkup(
		<WorkbenchRenderer
			lesson={lesson!}
			lessonContent={lesson!.content}
			fieldValues={fieldValues ?? {}}
			onFieldChange={() => {}}
			pinnedArtifacts={[
				getUserStatementArtifact(),
				getOutcomeStatementArtifact(),
				getResearchNotesArtifact(),
			]}
			invalidFieldIds={new Set<string>()}
		/>,
	);
}

describe("Research import workbench", () => {
	it("renders the prompt import flow in the main 1.4 workbench", () => {
		const markup = renderResearchWorkbench();

		expect(markup).toContain("Copy prompt -&gt; paste result");
		expect(markup).toContain(
			"1. Copy the prompt built from your chosen user and outcome.",
		);
		expect(markup).toContain("Paste ChatGPT response");
		expect(markup).toContain("Import into table");
		expect(markup).toContain("Generate with Codex");
		expect(markup).toContain("- User: Startup operators");
		expect(markup).toContain("Key pattern I noticed");
	});

	it("renders imported research values while keeping the manual editing controls visible", () => {
		const markup = renderResearchWorkbench({
			research_table: [["Notion", "Fast setup", "Weak export", "Speed"]],
			research_summary:
				"Users care about speed first, but real workflows break on edge cases.",
		});

		expect(markup).toContain("Notion");
		expect(markup).toContain("Fast setup");
		expect(markup).toContain("Add Row");
		expect(markup).toContain(
			"Users care about speed first, but real workflows break on edge cases.",
		);
		expect(markup).toContain("Key pattern I noticed");
	});
});

describe("Scope import workbench", () => {
	it("renders the scope-cut prompt import flow in the main 1.6 workbench", () => {
		const markup = renderScopeWorkbench();

		expect(markup).toContain("Copy prompt -&gt; paste scope cut");
		expect(markup).toContain(
			"1. Copy the scope-cut prompt built from your saved problem, user, outcome, and research.",
		);
		expect(markup).toContain("Paste ChatGPT scope cut");
		expect(markup).toContain("Import scope cut");
		expect(markup).toContain("Generate with Codex");
		expect(markup).toContain("- User: Startup operators");
		expect(markup).toContain("- Research pattern:");
		expect(markup).toContain("Keep in v1");
		expect(markup).toContain("Cut from v1");
		expect(markup).toContain("Why this version is enough");
	});

	it("renders imported scope values while keeping the manual editing controls visible", () => {
		const markup = renderScopeWorkbench({
			in_scope: [
				"Paste meeting notes",
				"Generate a clean action summary",
			],
			out_of_scope: [
				"Slack integration",
				"Team analytics dashboard",
			],
			v1_rationale:
				"This version is enough because the user can go from raw notes to a usable action summary in one pass.",
		});

		expect(markup).toContain("Paste meeting notes");
		expect(markup).toContain("Generate a clean action summary");
		expect(markup).toContain("Slack integration");
		expect(markup).toContain(
			"This version is enough because the user can go from raw notes to a usable action summary in one pass.",
		);
		expect(markup).toContain("Copy prompt -&gt; paste scope cut");
	});
});
