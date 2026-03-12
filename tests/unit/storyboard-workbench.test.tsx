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
			"Storyboard the flow off-screen first. Paper, tablet, or Excalidraw is fine.",
		);
		expect(markup).toContain("Open printable storyboard worksheet");
		expect(markup).toContain(
			"Storyboard the user journey off-screen in 5-7 frames, then upload one clean image.",
		);
		expect(markup).toContain("Upload storyboard image");
		expect(markup).toContain(
			"A phone photo, tablet screenshot, or Excalidraw export is enough. Upload one clean image before moving into Figma.",
		);
		expect(markup).not.toContain(
			"A good storyboard reduces confusion before code starts.",
		);
	});
});
