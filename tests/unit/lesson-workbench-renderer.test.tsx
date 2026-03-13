import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("convex/react", () => ({
	useMutation: () => vi.fn(),
}));

globalThis.React = React;

import { WorkbenchRenderer } from "@/components/lesson-workbench";
import {
	workbenchChromeLabelClass,
	workbenchMetaRowClass,
} from "@/components/lesson-workbench/shared/workbench-readability";
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

function getProductBriefArtifact(): PinnedArtifact {
	return {
		artifactKey: "product_brief",
		artifactLabel: "Product Brief",
		contextTitle: "Product brief",
		artifactType: "brief",
		lessonId: "1.7",
		lessonTitle: "CEO Wrap-Up",
		fieldValues: {
			who: "Startup operators",
			outcome:
				"Leave the meeting with a clean action summary they can review and send in minutes.",
			evidence:
				"People care most about speed and clarity after the meeting, not giant knowledge-management features.",
			flow: "Paste notes -> generate summary -> review action items -> share",
			scope: "One core flow only. No analytics or team features yet.",
		},
		fields: [
			["Who", "Startup operators with messy post-meeting action items."],
			[
				"Outcome",
				"Leave the meeting with a clean action summary they can review and send in minutes.",
			],
			[
				"Evidence",
				"People care most about speed and clarity after the meeting, not giant knowledge-management features.",
			],
			[
				"Flow",
				"Paste notes -> generate summary -> review action items -> share",
			],
			["Scope", "One core flow only. No analytics or team features yet."],
		],
	};
}

function getBuildBriefArtifact(): PinnedArtifact {
	const lesson = getLessonById("3.1");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {});
}

function getWorkingLocalEnvironmentArtifact(): PinnedArtifact {
	const lesson = getLessonById("3.5");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {});
}

function getCoreUxWorkingArtifact(): PinnedArtifact {
	const lesson = getLessonById("3.8");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {});
}

function getBlockerLogArtifact(): PinnedArtifact {
	const lesson = getLessonById("3.9");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {});
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
		__fieldShapeVersion: 5,
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

function getReferenceBoardArtifact(): PinnedArtifact {
	const lesson = getLessonById("2.1");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		__fieldShapeVersion: 2,
		reference_gallery: {
			kind: "reference_gallery",
			items: [
				{
					id: "remote-1",
					source: "remote_url",
					url: "https://images.example.com/ref-1.png",
				},
				{
					id: "remote-2",
					source: "remote_url",
					url: "https://images.example.com/ref-2.png",
				},
				{
					id: "remote-3",
					source: "remote_url",
					url: "https://images.example.com/ref-3.png",
				},
			],
		},
	});
}

function getSketchSetArtifact(): PinnedArtifact {
	const lesson = getLessonById("2.2");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		sketch_upload: [
			{
				kind: "upload",
				status: "stored",
				storageId: "sketch-1",
				fileName: "screen-1.jpg",
				url: "https://example.com/sketch-1.jpg",
			},
			{
				kind: "upload",
				status: "stored",
				storageId: "sketch-2",
				fileName: "screen-2.jpg",
				url: "https://example.com/sketch-2.jpg",
			},
		],
	});
}

function getStoryboardImageArtifact(): PinnedArtifact {
	const lesson = getLessonById("2.3");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {
		storyboard_upload: {
			kind: "upload",
			status: "stored",
			storageId: "storyboard-1",
			fileName: "storyboard.png",
			url: "https://example.com/storyboard.png",
		},
	});
}

function getRoughScreensArtifact(): PinnedArtifact {
	const lesson = getLessonById("2.5");
	expect(lesson).toBeTruthy();

	return buildArtifactPreview(lesson!, {});
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
				expected: "Choose the user to build for",
				pinnedArtifacts: [getCandidateProblemsArtifact()],
			},
			{
				lessonId: "1.4",
				expected: "Research table",
			},
			{
				lessonId: "1.5",
				expected: "Map the flow",
			},
			{
				lessonId: "1.6",
				expected: "Keep in v1",
			},
			{
				lessonId: "2.1",
				expected: "Find References First",
			},
			{
				lessonId: "2.2",
				expected: "Sketch rules",
			},
			{
				lessonId: "2.6",
				expected: "Choose a Visual Direction",
			},
			{
				lessonId: "3.1",
				expected: "Watch the kickoff all the way through",
				pinnedArtifacts: [
					getProductBriefArtifact(),
					getStoryboardImageArtifact(),
					getRoughScreensArtifact(),
				],
			},
			{
				lessonId: "3.3",
				expected: "Figma MCP installed",
			},
			{
				lessonId: "3.10",
				expected: "Ship unlocked",
				pinnedArtifacts: [
					getBuildBriefArtifact(),
					getWorkingLocalEnvironmentArtifact(),
					getCoreUxWorkingArtifact(),
					getBlockerLogArtifact(),
				],
			},
			{
				lessonId: "4.1",
				expected: "Ship Checklist",
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

	it("renders lesson 1.1 with inline quality guidance and comparison support", () => {
		const markup = renderLessonWorkbench("1.1", {
			fieldValues: {
				problem_1_who: "Startup operators",
				problem_1_pain:
					"They lose action items after meetings and waste time rebuilding them.",
				problem_2_who: "Teams",
				problem_2_pain: "AI app for meeting notes",
			},
		});

		expect(markup).toContain("Quality bar");
		expect(markup).toContain("Compare your three candidates");
		expect(markup).toContain("Candidate 1");
		expect(markup).toContain("Candidate 2");
		expect(markup).toContain("Candidate 3");
		expect(markup).toContain("1.2 Pick One User");
		expect(markup).toContain("Reads more like pain than a product idea.");
		expect(markup).toContain(
			"Sharpen beyond broad labels like teams, founders, or users.",
		);
	});

	it("renders lesson 1.6 with explicit scope framing, ordered lists, and draft provenance", () => {
		const markup = renderLessonWorkbench("1.6", {
			fieldValues: {
				in_scope: ["Paste notes", "Generate summary", "Share next steps"],
				out_of_scope: ["Team collaboration", "Project dashboards", "CRM sync"],
				v1_rationale:
					"This is enough because the operator can move from messy notes to a clean action summary in one pass.",
				__scope_boundary_source: "generated_codex",
			},
			pinnedArtifacts: [
				getUserStatementArtifact(),
				getOutcomeStatementArtifact(),
				getResearchNotesArtifact(),
				getCoreFlowArtifact(),
			],
		});

		expect(markup).toContain("What this step does");
		expect(markup).toContain("Current draft");
		expect(markup).toContain("Started from Codex");
		expect(markup).toContain("1. Keep in v1");
		expect(markup).toContain("2. Cut from v1");
		expect(markup).toContain("3. Why this version is enough");
		expect(markup).toContain("Next up in 1.7 Brief");
	});

	it("renders lesson 3.1 as a watch-first Build kickoff with repo-facing resources", () => {
		const markup = renderLessonWorkbench("3.1", {
			pinnedArtifacts: [
				getProductBriefArtifact(),
				getStoryboardImageArtifact(),
				getRoughScreensArtifact(),
			],
		});

		expect(markup).toContain("Build Kickoff");
		expect(markup).toContain("Watch the kickoff all the way through");
		expect(markup).toContain("Build Plan Template");
		expect(markup).toContain("Figma MCP setup guide");
		expect(markup).toContain("Playwright MCP docs");
		expect(markup).not.toContain("Generate build prompt");
		expect(markup).not.toContain("Step 1: Choose your starting path");
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
			`<span class="${workbenchChromeLabelClass}">Research table</span>`,
		);
		expect(markup).not.toContain(
			'<span class="font-display text-sm uppercase tracking-[0.04em] text-product-text">Research Table</span>',
		);
	});

	it("renders tracker lessons with semantic table controls", () => {
		const markup = renderLessonWorkbench("4.4", {
			fieldValues: {
				send_table: [["Taylor", "Email", "Yes", "Looks promising"]],
			},
		});

		expect(markup).toContain("<table");
		expect(markup).toContain("Reply");
		expect(markup).toContain("Add Row");
	});

	it("shows candidate problem choices for lesson 1.2 handoff", () => {
		const markup = renderLessonWorkbench("1.2", {
			pinnedArtifacts: [getCandidateProblemsArtifact()],
			invalidFieldIds: new Set(["selected_problem_index"]),
		});

		expect(markup).toContain("Problem 1");
		expect(markup).toContain("Startup operators");
		expect(markup).toContain("Choose the user to build for");
		expect(markup).toContain("Pressure-test your choice");
		expect(markup).toContain("Commit to this user");
		expect(markup).toContain(
			"Choose the one user-problem pair you can test fastest.",
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

		expect(markup).toContain("Current choice");
		expect(markup).toContain("Problem 1");
		expect(markup).toContain("Not chosen");
		expect(markup).toContain("User statement preview");
		expect(markup).toContain(
			'This is the direction <code class="mx-1 font-mono">1.3</code> will inherit next.',
		);
		expect(markup).not.toContain(
			"Now define the specific user inside this chosen problem.",
		);
	});

	it("renders lesson 1.3 with inline outcome coaching and a live preview", () => {
		const markup = renderLessonWorkbench("1.3", {
			fieldValues: {
				outcome:
					"AI app with dashboards and workflow features for meeting summaries.",
			},
			pinnedArtifacts: [getUserStatementArtifact()],
		});

		expect(markup).toContain("Turn features into outcomes");
		expect(markup).toContain("Weak example");
		expect(markup).toContain("Stronger rewrite");
		expect(markup).toContain("Promised outcome");
		expect(markup).toContain("Observable proof");
		expect(markup).toContain("Pain removed");
		expect(markup).toContain("Outcome statement preview");
		expect(markup).toContain(
			"This draft still reads feature-heavy. Rewrite it as what changes for the user after the product works.",
		);
		expect(markup).toContain(
			'This is the promise <code class="mx-1 font-mono">1.4</code> will pressure-test next.',
		);
	});

	it("renders the upload control for lesson 1.5", () => {
		const markup = renderLessonWorkbench("1.5");

		expect(markup).toContain("Upload core flow photo");
		expect(markup).toContain("Watch first");
		expect(markup).toContain("Walkthrough pending");
	});

	it("renders lesson 0.1 as a video-first welcome rep without the status rail", () => {
		const lesson = getLessonById("0.1");
		expect(lesson?.coachVideoPlacement).toBe("workbench");

		const markup = renderLessonWorkbench("0.1");

		expect(markup).toContain("Watch first");
		expect(markup).toContain("Watch video");
		expect(markup).toContain("Define your weekend ship");
		expect(markup).not.toContain("Do this now");
		expect(markup).not.toContain("Timebox");
		expect(markup).not.toContain("Finish with");
	});

	it("renders the lesson metadata badges as non-selectable chrome", () => {
		const markup = renderLessonWorkbench("1.5");

		expect(markup).toContain(`<div class="${workbenchMetaRowClass}">`);
	});

	it("renders lesson 1.5 as a video-first paper upload lesson", () => {
		const markup = renderLessonWorkbench("1.5", {
			pinnedArtifacts: [
				getUserStatementArtifact(),
				getOutcomeStatementArtifact(),
			],
		});

		expect(markup).toContain("Watch first");
		expect(markup).toContain("Do this now");
		expect(markup).toContain("Map the flow");
		expect(markup).toContain("Upload the map");
		expect(markup).toContain(
			"Draw it on paper in 5-7 steps. Make the moment where the promise becomes real easy to spot.",
		);
		expect(markup).toContain("User");
		expect(markup).toContain("Promise");
		expect(markup).toContain("Upload one legible photo.");
		expect(markup).not.toContain("Anchor the flow");
		expect(markup).not.toContain("Before you step away");
		expect(markup).not.toContain("Default shape");
		expect(markup).not.toContain("Core flow stage");
		expect(markup).not.toContain("Save image");
		expect(markup).not.toContain("Use Figma instead");
	});

	it("renders lesson 2.3 as an offline storyboard upload handoff", () => {
		const markup = renderLessonWorkbench("2.3");

		expect(markup).toContain(
			"Storyboard the flow off-screen first. Use the printable PDF, the FigJam template, or just draw 5-7 rectangles on paper.",
		);
		expect(markup).toContain("Open printable storyboard template");
		expect(markup).toContain(
			"/downloads/ship-by-sunday-storyboard-template.pdf",
		);
		expect(markup).toContain(
			"Use the printable PDF, the FigJam template, or plain paper to storyboard the user journey in 5-7 frames, then upload one clean image.",
		);
		expect(markup).toContain("Upload storyboard image");
		expect(markup).toContain(
			"A phone photo of hand-drawn boxes, a FigJam or tablet screenshot, or an Excalidraw export is enough. Upload one clean image before moving into Figma.",
		);
		expect(markup).toContain(
			"Choose a file and it will upload to lesson storage before the lesson draft is saved.",
		);
		expect(markup).not.toContain(
			"A good storyboard reduces confusion before code starts.",
		);
	});

	it("renders lesson 2.2 as a focus-first sketch upload sprint", () => {
		const lesson = getLessonById("2.2");
		expect(lesson?.shell).toBe("focus");
		expect(lesson?.workbench).toBe("sketch_upload");

		const markup = renderLessonWorkbench("2.2", {
			fieldValues: {
				sketch_upload: [
					{
						kind: "upload",
						status: "stored",
						fileName: "screen-1.jpg",
						storageId: "sketch-1",
						previewUrl: "https://example.com/sketch-1.jpg",
					},
				],
			},
			pinnedArtifacts: [
				{
					artifactKey: "product_brief",
					artifactLabel: "Product Brief",
					contextTitle: "Product brief",
					artifactType: "brief",
					lessonId: "1.7",
					lessonTitle: "CEO Wrap-Up",
					fieldValues: { who: "Startup operators" },
					fields: [["Who", "Startup operators"]],
				},
			],
		});

		expect(markup).toContain("Watch first");
		expect(markup).toContain("Sketch rules");
		expect(markup).toContain("Keep it moving");
		expect(markup).toContain(
			"1 sketch image saved. Add more if you want, or continue.",
		);
		expect(markup).toContain("Add more sketches");
		expect(markup).toContain("Replace all");
		expect(markup).toContain("Remove");
		expect(markup).toContain("Need context?");
		expect(markup).toContain("https://example.com/sketch-1.jpg");
		expect(markup).not.toContain(
			"Choose a file and it will upload to lesson storage before the lesson draft is saved.",
		);
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
		expect(markup).toContain("CEO brief ready to lock");
		expect(markup).toContain("Next: DESIGN 2.1 — Find References First");
		expect(markup).toContain("Locked and specific");
		expect(markup).toContain("Grounded in 3 signals");
		expect(markup).toContain("What Design gets now");
		expect(markup).toContain("Review and lock");
		expect(markup).toContain("A designer could tell who this is for.");
		expect(markup).toContain("Collect references for this exact brief");
		expect(markup).toContain("Skills you flexed");
		expect(markup).toContain("Problem framing");
		expect(markup).toContain("Scope discipline");
		expect(markup).toContain("Who Design Is For");
		expect(markup).toContain("Outcome to Deliver");
		expect(markup).toContain("Evidence to Preserve");
		expect(markup).toContain("Core Flow to Keep");
		expect(markup).toContain("What Not to Design Yet");
		expect(markup).toContain("Edit user");
		expect(markup).toContain("Do not widen the product again.");
		expect(markup).toContain("https://example.com/core-flow.png");
		expect(markup).not.toContain("ArtifactContext");
		expect(markup).not.toContain("No saved preview yet.");
	});

	it("renders lesson 3.10 as a Ship-unlock wrap-up with a lead video surface", () => {
		const markup = renderLessonWorkbench("3.10", {
			pinnedArtifacts: [
				getBuildBriefArtifact(),
				getWorkingLocalEnvironmentArtifact(),
				getCoreUxWorkingArtifact(),
				getBlockerLogArtifact(),
			],
		});

		expect(markup).toContain("Watch video");
		expect(markup).toContain("Video placeholder");
		expect(markup).toContain("Build block complete");
		expect(markup).toContain("Ship unlocked");
		expect(markup).toContain("Next: SHIP 4.1 — Ship the Core, Not the Fantasy");
		expect(markup).toContain("What Ship now has");
		expect(markup).toContain("Kickoff");
		expect(markup).toContain("Local environment");
		expect(markup).toContain("Core UX");
		expect(markup).toContain("Stability pass");
		expect(markup).toContain(
			"Build started from the saved brief, storyboard, and rough screens",
		);
		expect(markup).toContain("Kickoff alignment");
		expect(markup).toContain("Evidence-driven debugging");
		expect(markup).not.toContain("ArtifactContext");
		expect(markup).not.toContain("No saved preview yet.");
	});
});
