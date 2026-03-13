import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("convex/react", () => ({
	useMutation: () => vi.fn(),
}));

globalThis.React = React;

import { WorkbenchRenderer } from "@/components/lesson-workbench";
import { getLessonById } from "@/lib/course";

describe("storyboard workbench", () => {
	it("frames lesson 2.3 as an offline storyboard upload step", () => {
		const lesson = getLessonById("2.3");
		expect(lesson).toBeTruthy();

		const markup = renderToStaticMarkup(
			<WorkbenchRenderer
				lesson={lesson!}
				lessonContent={lesson!.content}
				fieldValues={{}}
				onFieldChange={() => {}}
				pinnedArtifacts={[]}
				invalidFieldIds={new Set<string>()}
			/>,
		);

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
		expect(markup).not.toContain(
			"A good storyboard reduces confusion before code starts.",
		);
	});
});
