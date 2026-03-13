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
			["Notion", "Fast setup", "Weak export", "Speed", "Pricing page"],
			[
				"Tana",
				"Flexible workflows",
				"Steeper learning curve",
				"Flexibility",
				"Review thread",
			],
		],
		research_summary:
			"Users want speed first, but they get frustrated when the workflow falls apart under real use.",
	});
}

function getCoreFlowArtifact(): PinnedArtifact {
	const lesson = getLessonById("1.5");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		__fieldShapeVersion: 5,
		__core_flow_image_upload: {
			kind: "upload",
			status: "stored",
			storageId: "core-flow-image",
			url: "https://example.com/core-flow.png",
		},
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
				getCoreFlowArtifact(),
			]}
			invalidFieldIds={new Set<string>()}
		/>,
	);
}

describe("Research import workbench", () => {
	it("renders the prompt import flow in the main 1.4 workbench", () => {
		const markup = renderResearchWorkbench();

		expect(markup).toContain("Research target");
		expect(markup).toContain("Promise to pressure-test");
		expect(markup).toContain("Need a fast AI starter?");
		expect(markup).toContain(
			"Start with 2-3 quick manual scans. Use AI only if you want a starter draft after you know what you are looking for.",
		);
		expect(markup).toContain("Use AI starter");
		expect(markup).not.toContain("Copy prompt");
		expect(markup).not.toContain("Generate with Codex");
		expect(markup).toContain("Evidence Seen");
		expect(markup).toContain("Key pattern I noticed");
		expect(markup).not.toContain("Paste ChatGPT response");
	});

	it("renders imported research values while keeping the manual editing controls visible", () => {
		const markup = renderResearchWorkbench({
			research_table: [
				["Notion", "Fast setup", "Weak export", "Speed", "Pricing page"],
			],
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

		expect(markup).toContain("What this step does");
		expect(markup).toContain("Current draft");
		expect(markup).toContain("Scope against this");
		expect(markup).toContain("Saved core flow");
		expect(markup).toContain("Need a backup cut?");
		expect(markup).toContain(
			"Start manually. Use backup assist only if you need a first-pass scope cut to react to.",
		);
		expect(markup).toContain("Open backup assist");
		expect(markup).toContain("1. Keep in v1");
		expect(markup).toContain("2. Cut from v1");
		expect(markup).toContain("3. Why this version is enough");
		expect(markup).toContain("Next up in 1.7 Brief");
		expect(markup).not.toContain("Paste ChatGPT scope cut");
	});

	it("renders imported scope values while keeping the manual editing controls visible", () => {
		const markup = renderScopeWorkbench({
			in_scope: ["Paste meeting notes", "Generate a clean action summary"],
			out_of_scope: ["Slack integration", "Team analytics dashboard"],
			v1_rationale:
				"This version is enough because the user can go from raw notes to a usable action summary in one pass.",
		});

		expect(markup).toContain("Paste meeting notes");
		expect(markup).toContain("Generate a clean action summary");
		expect(markup).toContain("Slack integration");
		expect(markup).toContain(
			"This version is enough because the user can go from raw notes to a usable action summary in one pass.",
		);
		expect(markup).toContain("Use 1.5 as the cut line");
		expect(markup).toContain("Name more cuts");
		expect(markup).toContain("Saved draft");
		expect(markup).toContain("Need a backup cut?");
	});
});
