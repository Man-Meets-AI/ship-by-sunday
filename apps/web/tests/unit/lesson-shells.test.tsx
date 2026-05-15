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

import { getLessonById } from "@/lib/course/lesson/model";
import { LessonShellWatch } from "@/app/(app)/_components/course/lesson/shells";

describe("LessonShellWatch", () => {
	it("renders lesson 2.1 video in the watch shell", () => {
		const lesson = getLessonById("2.1");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 2.1 to exist.");
		}

		const markup = renderToStaticMarkup(
			<LessonShellWatch
				lesson={lesson}
				coachContent={lesson.content.coach}
				footer={<div>Footer</div>}
				pinnedArtifacts={[]}
			/>,
		);

		expect(markup).toContain(lesson.title);
		expect(markup).toContain('data-slot="protected-route-header"');
		expect(markup).not.toContain("font-heading-serif");
		expect(markup).toContain("<iframe");
	});

	it("renders Light Research video in the watch shell", () => {
		const lesson = getLessonById("1.6");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 1.6 to exist.");
		}

		const markup = renderToStaticMarkup(
			<LessonShellWatch
				lesson={lesson}
				coachContent={lesson.content.coach}
				footer={<div>Footer</div>}
				pinnedArtifacts={[]}
			/>,
		);

		expect(markup).toContain(lesson.title);
		expect(markup).toContain("<iframe");
	});

	it("preserves lesson-specific titles when a lesson borrows a media slot", () => {
		const lesson = getLessonById("1.5");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 1.5 to exist.");
		}

		expect(lesson.content.coach.video?.title).toBe("Define the Outcome");
		expect(lesson.content.coach.video?.videoId).toBe(
			"59276fe3-0832-455b-8223-2a2974028be8",
		);
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
				pinnedArtifacts={[]}
			/>,
		);

		expect(markup).toContain("Finalize Build Handoff and Unlock Ship");
		expect(markup).toContain("4m 23s");
		expect(markup).toContain(
			"Orient to Codex and Cursor skills: where they live, how to tag them with $, and which specialists to use as you move into Ship.",
		);
	});

	it("renders transcript, helpful links, and static prompt cards when they exist", () => {
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
							id: "research-prompt",
							label: "Static prompt",
							body: "Use this static prompt and fill the placeholders yourself.",
							kind: "copy_prompt",
							promptTemplateId: "competitor_research",
						},
						{
							id: "ship-doc",
							label: "Ship notes",
							href: "https://example.com/ship-notes",
							kind: "external",
						},
					],
				}}
				footer={<div>Footer</div>}
				pinnedArtifacts={[]}
			/>,
		);

		expect(markup).toContain("Transcript");
		expect(markup).toContain("Ship it, review it, and move on.");
		expect(markup).toContain("Helpful links");
		expect(markup).toContain("Static prompt");
		expect(markup).toContain(
			"Use this static prompt and fill the placeholders yourself.",
		);
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
				pinnedArtifacts={[]}
			/>,
		);

		expect(markup).toContain("Video placeholder");
		expect(markup).toContain(
			"The lesson video will appear here when it is attached.",
		);
		expect(markup).not.toContain("<iframe");
	});
});
