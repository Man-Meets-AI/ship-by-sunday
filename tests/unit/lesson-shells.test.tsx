import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/link", () => ({
	default: ({
		href,
		children,
		...props
	}: {
		href: string;
		children: React.ReactNode;
	}) => React.createElement("a", { href, ...props }, children),
}));

globalThis.React = React;

import {
	LessonShellSplit,
	type PinnedArtifact,
} from "@/components/lesson-shells";
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

function renderResearchLessonResources(pinnedArtifacts: PinnedArtifact[] = []) {
	const lesson = getLessonById("1.4");
	expect(lesson).toBeTruthy();

	return renderToStaticMarkup(
		<LessonShellSplit
			lesson={lesson!}
			objectiveTasks={[]}
			onObjectiveTaskToggle={() => {}}
			coachVisible
			activeCoachPanel="resources"
			onCoachPanelChange={() => {}}
			pinnedArtifacts={pinnedArtifacts}
			coachContent={lesson!.content.coach}
			footer={<div>Footer</div>}
		>
			<div>Workbench</div>
		</LessonShellSplit>,
	);
}

describe("LessonShellSplit resources", () => {
	it("renders the custom research prompt card and worksheet link for lesson 1.4", () => {
		const markup = renderResearchLessonResources([
			getUserStatementArtifact(),
			getOutcomeStatementArtifact(),
		]);

		expect(markup).toContain("Copy your custom research prompt");
		expect(markup).toContain(
			"Paste it into ChatGPT Deep Research or another frontier model",
		);
		expect(markup).toContain("Copy prompt");
		expect(markup).toContain("- User: Startup operators");
		expect(markup).toContain("Research Table");
		expect(markup).toContain("Worksheet 01 — One-Page Product Brief");
		expect(markup).toContain("/downloads/ship-by-sunday-worksheets.pdf");
		expect(markup).not.toMatch(/<button[^>]*disabled=""/);
	});

	it("keeps the prompt card visible but disables copy when prior context is missing", () => {
		const markup = renderResearchLessonResources();

		expect(markup).toContain("Copy your custom research prompt");
		expect(markup).toContain(
			"Finish lessons 1.2 and 1.3 first so we can build this prompt from your chosen user and outcome.",
		);
		expect(markup).toContain(
			"The prompt will appear here once your chosen user and outcome are saved.",
		);
		expect(markup).toMatch(/<button[^>]*disabled=""/);
		expect(markup).toContain("Worksheet 01 — One-Page Product Brief");
	});
});
