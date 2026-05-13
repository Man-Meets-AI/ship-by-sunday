import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

globalThis.React = React;

import { BonusCourseCard } from "@/app/(app)/_components/course/mission/components/bonus-course-card";

describe("BonusCourseCard", () => {
	it("surfaces the included FULL TURBO bonus with the playlist link and usage guidance", () => {
		const markup = renderToStaticMarkup(<BonusCourseCard />);

		expect(markup).toContain('data-slot="card"');
		expect(markup).toContain('data-slot="badge"');
		expect(markup).toContain('data-slot="button"');
		expect(markup).toContain("Included bonus");
		expect(markup).toContain("FULL TURBO");
		expect(markup).toContain("Open YouTube playlist");
		expect(markup).toContain(
			"https://www.youtube.com/playlist?list=PLO6IqfGPRUN1Bof9pACmGc955t4d0J6cM",
		);
		expect(markup).toContain(
			"Ship the core flow first, then use FULL TURBO as the deeper practice layer.",
		);
	});
});
