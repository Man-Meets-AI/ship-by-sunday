import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("convex/react", () => ({
	useMutation: () => vi.fn(),
}));

globalThis.React = React;

import { WorkbenchRenderer } from "@/components/lesson-workbench";
import {
	appendSketchUploads,
	removeSketchUploadAt,
	replaceSketchUploads,
} from "@/components/lesson-workbench/modes/sketch-upload-workbench";
import type { PinnedArtifact } from "@/components/lesson-shells";
import { getLessonById } from "@/lib/course";

function renderSketchWorkbench(options?: {
	fieldValues?: Record<string, unknown>;
	pinnedArtifacts?: PinnedArtifact[];
}) {
	const lesson = getLessonById("2.2");
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

describe("sketch upload workbench", () => {
	it("renders lesson 2.2 as a focus-first sketch upload sprint", () => {
		const lesson = getLessonById("2.2");
		expect(lesson?.shell).toBe("focus");
		expect(lesson?.workbench).toBe("sketch_upload");

		const markup = renderSketchWorkbench({
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
				{
					artifactKey: "reference_board",
					artifactLabel: "Reference Board",
					contextTitle: "Reference board",
					artifactType: "board",
					lessonId: "2.1",
					lessonTitle: "Find References First",
					fieldValues: { reference_patterns: "Tight cards" },
					fields: [["What patterns keep repeating?", "Tight cards"]],
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
	});

	it("adds, replaces, and removes sketch uploads without disturbing the remaining gallery", () => {
		const first = [
			{
				kind: "upload" as const,
				status: "stored" as const,
				fileName: "screen-1.jpg",
				storageId: "sketch-1",
			},
		];
		const second = [
			{
				kind: "upload" as const,
				status: "stored" as const,
				fileName: "screen-2.jpg",
				storageId: "sketch-2",
			},
			{
				kind: "upload" as const,
				status: "stored" as const,
				fileName: "screen-3.jpg",
				storageId: "sketch-3",
			},
		];

		const appended = appendSketchUploads(first, second);
		expect(appended.map((item) => item.storageId)).toEqual([
			"sketch-1",
			"sketch-2",
			"sketch-3",
		]);
		expect(
			removeSketchUploadAt(appended, 1).map((item) => item.storageId),
		).toEqual(["sketch-1", "sketch-3"]);
		expect(
			replaceSketchUploads(appended, second).map((item) => item.storageId),
		).toEqual(["sketch-2", "sketch-3"]);
	});
});
