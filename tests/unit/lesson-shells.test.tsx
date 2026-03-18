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

import { getLessonById } from "@/features/course/lesson/model";
import { LessonShellWatch } from "@/features/course/lesson/shells";

describe("LessonShellWatch", () => {
	it("renders the Bunny-backed watch shell without workbench chrome", () => {
		const lesson = getLessonById("1.0");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 1.0 to exist.");
		}

		const markup = renderToStaticMarkup(
			<LessonShellWatch
				lesson={lesson}
				coachContent={lesson.content.coach}
				footer={<div>Footer</div>}
			/>,
		);

		expect(markup).toContain("CEO Kickoff");
		expect(markup).toContain("CEO Kickoff Video");
		expect(markup).toContain(
			"https://player.mediadelivery.net/embed/619172/0df1d1d2-098a-425b-b6eb-3c465f0a32e1",
		);
		expect(markup).toContain("Footer");
		expect(markup).not.toContain("Workbench");
	});

	it("renders ready Bunny media metadata in the watch shell", () => {
		const lesson = getLessonById("3.16");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 3.16 to exist.");
		}

		const markup = renderToStaticMarkup(
			<LessonShellWatch
				lesson={lesson}
				coachContent={lesson.content.coach}
				footer={<div>Footer</div>}
			/>,
		);

		expect(markup).toContain("Finalize Build Handoff and Unlock Ship");
		expect(markup).toContain("4m 23s");
		expect(markup).toContain(
			"Watch Finalize Build Handoff and Unlock Ship, pull the key move forward, and keep momentum.",
		);
	});

	it("renders transcript and resources when they exist", () => {
		const lesson = getLessonById("4.0");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 4.0 to exist.");
		}

		const markup = renderToStaticMarkup(
			<LessonShellWatch
				lesson={lesson}
				coachContent={{
					...lesson.content.coach,
					transcript: {
						status: "ready",
						body: "Ship it, review it, and move on.",
					},
					resources: [
						{
							id: "ship-doc",
							label: "Ship notes",
							href: "https://example.com/ship-notes",
							kind: "external",
						},
					],
				}}
				footer={<div>Footer</div>}
			/>,
		);

		expect(markup).toContain("Transcript");
		expect(markup).toContain("Ship it, review it, and move on.");
		expect(markup).toContain("Resources");
		expect(markup).toContain("Ship notes");
		expect(markup).toContain('target="_blank"');
	});

	it("renders the large placeholder when the lesson video is pending", () => {
		const lesson = getLessonById("4.0");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 4.0 to exist.");
		}

		const markup = renderToStaticMarkup(
			<LessonShellWatch
				lesson={lesson}
				coachContent={{
					...lesson.content.coach,
					video: {
						status: "pending",
						title: "Product Review",
					},
				}}
				footer={<div>Footer</div>}
			/>,
		);

		expect(markup).toContain("Video placeholder");
		expect(markup).toContain(
			"The lesson video will appear here when it is attached.",
		);
		expect(markup).not.toContain("<iframe");
	});
});
