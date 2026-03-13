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
	LessonShellWatch,
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

function renderStartWithProblemWatchPanel() {
	const lesson = getLessonById("1.1");
	expect(lesson).toBeTruthy();

	return renderToStaticMarkup(
		<LessonShellSplit
			lesson={lesson!}
			objectiveTasks={[]}
			onObjectiveTaskToggle={() => {}}
			coachVisible
			activeCoachPanel="watch"
			onCoachPanelChange={() => {}}
			pinnedArtifacts={[]}
			coachContent={lesson!.content.coach}
			footer={<div>Footer</div>}
		>
			<div>Workbench</div>
		</LessonShellSplit>,
	);
}

function renderResearchLessonWithHiddenCoach() {
	const lesson = getLessonById("1.4");
	expect(lesson).toBeTruthy();

	return renderToStaticMarkup(
		<LessonShellSplit
			lesson={lesson!}
			objectiveTasks={[]}
			onObjectiveTaskToggle={() => {}}
			coachVisible={false}
			activeCoachPanel="resources"
			onCoachPanelChange={() => {}}
			pinnedArtifacts={[]}
			coachContent={lesson!.content.coach}
			footer={<div>Footer</div>}
		>
			<div>Workbench</div>
		</LessonShellSplit>,
	);
}

function renderStoryboardLessonResources() {
	const lesson = getLessonById("2.3");
	expect(lesson).toBeTruthy();

	return renderToStaticMarkup(
		<LessonShellSplit
			lesson={lesson!}
			objectiveTasks={[]}
			onObjectiveTaskToggle={() => {}}
			coachVisible
			activeCoachPanel="resources"
			onCoachPanelChange={() => {}}
			pinnedArtifacts={[]}
			coachContent={lesson!.content.coach}
			footer={<div>Footer</div>}
		>
			<div>Workbench</div>
		</LessonShellSplit>,
	);
}

function renderVisualDirectionLessonResources(
	activeCoachPanel:
		| "watch"
		| "transcript"
		| "examples"
		| "resources" = "transcript",
) {
	const lesson = getLessonById("2.6");
	expect(lesson).toBeTruthy();

	return renderToStaticMarkup(
		<LessonShellSplit
			lesson={lesson!}
			objectiveTasks={[]}
			onObjectiveTaskToggle={() => {}}
			coachVisible
			activeCoachPanel={activeCoachPanel}
			onCoachPanelChange={() => {}}
			pinnedArtifacts={[]}
			coachContent={lesson!.content.coach}
			footer={<div>Footer</div>}
		>
			<div>Workbench</div>
		</LessonShellSplit>,
	);
}

function renderWatchLesson(
	overrides?: Parameters<typeof LessonShellWatch>[0]["coachContent"],
) {
	const lesson = getLessonById("2.4");
	expect(lesson).toBeTruthy();

	return renderToStaticMarkup(
		<LessonShellWatch
			lesson={lesson!}
			coachContent={overrides ?? lesson!.content.coach}
			footer={<div>Footer</div>}
		/>,
	);
}

function renderBuildLessonExamples() {
	const lesson = getLessonById("3.1");
	expect(lesson).toBeTruthy();

	return renderToStaticMarkup(
		<LessonShellSplit
			lesson={lesson!}
			objectiveTasks={[]}
			onObjectiveTaskToggle={() => {}}
			coachVisible
			activeCoachPanel="examples"
			onCoachPanelChange={() => {}}
			pinnedArtifacts={[]}
			coachContent={lesson!.content.coach}
			footer={<div>Footer</div>}
		>
			<div>Workbench</div>
		</LessonShellSplit>,
	);
}

describe("LessonShellSplit resources", () => {
	it("keeps lesson 1.4 coach resources focused on the worksheet link", () => {
		const markup = renderResearchLessonResources([
			getUserStatementArtifact(),
			getOutcomeStatementArtifact(),
		]);

		expect(markup).toContain("Worksheet 01 — One-Page Product Brief");
		expect(markup).toContain("/downloads/ship-by-sunday-worksheets.pdf");
		expect(markup).not.toContain("Copy your custom research prompt");
		expect(markup).not.toContain("Copy prompt");
	});

	it("does not reintroduce the old prompt resource card when context is missing", () => {
		const markup = renderResearchLessonResources();

		expect(markup).toContain("Worksheet 01 — One-Page Product Brief");
		expect(markup).not.toContain("Copy your custom research prompt");
		expect(markup).not.toContain(
			"The prompt will appear here once your chosen user and outcome are saved.",
		);
	});

	it("uses the stronger no-video fallback copy on lesson 1.1", () => {
		const markup = renderStartWithProblemWatchPanel();

		expect(markup).toContain("No lesson video yet");
		expect(markup).toContain("Use the guided path");
		expect(markup).toContain(
			"Lean on the inline examples, the worksheet, and the compare-your-three recap while you draft grounded candidate problems.",
		);
		expect(markup).not.toContain("Video placeholder");
	});

	it("collapses the hidden coach rail instead of reserving a dead third column", () => {
		const markup = renderResearchLessonWithHiddenCoach();

		expect(markup).toContain("xl:grid-cols-[minmax(0,270px)_minmax(0,1fr)]");
		expect(markup).not.toContain(
			"Coach hidden. Use the top-right coach toggle",
		);
	});

	it("renders lesson 2.3 coach resources with a FigJam storyboard option", () => {
		const markup = renderStoryboardLessonResources();

		expect(markup).toContain("Worksheet 02 — Build-Ready Design Spec");
		expect(markup).toContain("Digital storyboard option (FigJam)");
		expect(markup).toContain(
			"https://www.figma.com/board/csR3w46LJaHNU0RKHVOJDB/Ship-by-Sunday-Template?node-id=0-1",
		);
		expect(markup).toContain('target="_blank"');
	});

	it("keeps the storyboard FigJam resource isolated to lesson 2.3", () => {
		const lesson = getLessonById("2.2");
		expect(lesson).toBeTruthy();
		const resources = lesson?.content.coach.resources ?? [];

		expect(
			resources.some(
				(resource) =>
					resource.kind === "external" &&
					resource.href.includes("Ship-by-Sunday-Template"),
			),
		).toBe(false);
	});

	it("hides the duplicate watch panel when the lesson video lives in the workbench", () => {
		const markup = renderVisualDirectionLessonResources();

		expect(markup).not.toContain(">Watch<");
		expect(markup).toContain(">Transcript<");
		expect(markup).toContain(">Examples<");
		expect(markup).toContain(">Resources<");
	});

	it("renders optional coach example images when provided by lesson content", () => {
		const markup = renderBuildLessonExamples();

		expect(markup).toContain("/course/build-guide-images/image1.png");
		expect(markup).toContain(
			"Use one controlled prompt, not a wide open request.",
		);
	});
});

describe("LessonShellWatch", () => {
	it("renders the watch shell around a ready video without workbench chrome", () => {
		const markup = renderWatchLesson({
			video: {
				status: "ready",
				url: "https://example.com/lesson.mp4",
				title: "Figma Basics for Speed",
				durationLabel: "8-10 min",
			},
		});

		expect(markup).toContain("Figma Basics for Speed");
		expect(markup).toContain("https://example.com/lesson.mp4");
		expect(markup).toContain("8-10 min");
		expect(markup).not.toContain("Workbench");
		expect(markup).not.toContain("Objective");
		expect(markup).not.toContain("Coach");
	});

	it("renders a large placeholder when the lesson video is still pending", () => {
		const markup = renderWatchLesson();

		expect(markup).toContain("Watch video");
		expect(markup).toContain("Video placeholder");
		expect(markup).toContain(
			"The lesson video will appear here when it is attached.",
		);
		expect(markup).not.toContain("Video not wired yet.");
	});
});
