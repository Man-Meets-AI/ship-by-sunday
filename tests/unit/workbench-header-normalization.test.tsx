import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("convex/react", () => ({
	useMutation: () => vi.fn(),
}));

globalThis.React = React;

import { WorkbenchRenderer } from "@/components/lesson-workbench";
import { ReadonlyFieldControl } from "@/components/lesson-workbench/fields/readonly-field-control";
import { SectionCard } from "@/components/lesson-workbench/shared/section-card";
import { TemplateDownloadCard } from "@/components/lesson-workbench/shared/template-download-card";
import { ArtifactContext } from "@/components/lesson-workbench/shared/artifact-context";
import { WorkbenchCard } from "@/components/lesson-workbench/shared/workbench-card";
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

function renderLessonWorkbench(
	lessonId: string,
	options?: {
		fieldValues?: Record<string, unknown>;
		pinnedArtifacts?: PinnedArtifact[];
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
			invalidFieldIds={new Set<string>()}
		/>,
	);
}

describe("Workbench header normalization", () => {
	it("renders WorkbenchCard with one thin all-caps label only", () => {
		const markup = renderToStaticMarkup(
			<WorkbenchCard label="Template">
				<div>Body</div>
			</WorkbenchCard>,
		);

		expect(markup).toContain(
			'<span class="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">Template</span>',
		);
		expect(markup).not.toContain("font-display text-sm uppercase");
	});

	it("renders SectionCard with only the section title and hides the eyebrow", () => {
		const markup = renderToStaticMarkup(
			<SectionCard
				section={{
					id: "weekend_goal",
					eyebrow: "Set the target",
					title: "Define your weekend ship",
					fieldIds: [],
				}}
				isComplete={false}
			>
				<div>Fields</div>
			</SectionCard>,
		);

		expect(markup).toContain(
			'<h2 class="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">Define your weekend ship</h2>',
		);
		expect(markup).not.toContain("Set the target");
		expect(markup).not.toContain("font-display text-base uppercase");
	});

	it("renders artifact and readonly preview headers in the thin label style", () => {
		const artifact = getUserStatementArtifact();

		const artifactContextMarkup = renderToStaticMarkup(
			<ArtifactContext pinnedArtifacts={[artifact]} />,
		);
		const readonlyMarkup = renderToStaticMarkup(
			<ReadonlyFieldControl
				field={{
					id: "chosen_user_preview",
					label: "Chosen user preview",
					kind: "readonly",
					linkedArtifactKey: "user_statement",
				}}
				pinnedArtifacts={[artifact]}
			/>,
		);

		expect(artifactContextMarkup).toContain(
			'<span class="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">Our user</span>',
		);
		expect(readonlyMarkup).toContain(
			'<p class="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">User Statement</p>',
		);
		expect(artifactContextMarkup).not.toContain(
			"font-display text-sm uppercase",
		);
		expect(readonlyMarkup).not.toContain("font-display text-sm uppercase");
	});

	it("keeps template, pinned context, and import cards on thin labels across lesson workbenches", () => {
		const storyboardLesson = getLessonById("2.3");
		expect(storyboardLesson).toBeTruthy();

		const templateMarkup = renderToStaticMarkup(
			<TemplateDownloadCard lessonContent={storyboardLesson!.content} />,
		);
		const importWorkbenchMarkup = renderLessonWorkbench("1.4", {
			pinnedArtifacts: [
				getUserStatementArtifact(),
				getOutcomeStatementArtifact(),
			],
		});
		const captureUploadMarkup = renderLessonWorkbench("1.5", {
			pinnedArtifacts: [
				getUserStatementArtifact(),
				getOutcomeStatementArtifact(),
			],
		});

		expect(templateMarkup).toContain(
			'<span class="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">Template</span>',
		);
		expect(importWorkbenchMarkup).toContain(
			'<span class="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">Copy prompt -&gt; paste result</span>',
		);
		expect(importWorkbenchMarkup).toContain(
			'<span class="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">Research table</span>',
		);
		expect(captureUploadMarkup).toContain(
			'<span class="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">Do this now</span>',
		);
		expect(captureUploadMarkup).toContain(
			'<span class="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">Upload the photo</span>',
		);
		expect(captureUploadMarkup).toContain(
			'<span class="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">Our user</span>',
		);
		expect(captureUploadMarkup).toContain(
			'<span class="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">Outcome statement</span>',
		);
		expect(importWorkbenchMarkup).not.toContain(
			"font-display text-sm uppercase tracking-[0.04em]",
		);
		expect(captureUploadMarkup).not.toContain(
			"font-display text-sm uppercase tracking-[0.04em]",
		);
	});

	it("renders roadmap block cards and external workspace cards with the thin label style", () => {
		const roadmapMarkup = renderLessonWorkbench("0.2");
		const externalWorkspaceMarkup = renderLessonWorkbench("3.3");

		expect(roadmapMarkup).toContain(
			'<p class="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">CEO</p>',
		);
		expect(roadmapMarkup).not.toContain(
			'font-display text-sm uppercase tracking-[0.06em] text-product-text">CEO</p>',
		);
		expect(externalWorkspaceMarkup).toContain(
			'<span class="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">External workspace</span>',
		);
	});
});
