import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

globalThis.React = React;

import { BonusCourseCard } from "@/features/course/mission/components/bonus-course-card";

describe("BonusCourseCard", () => {
	it("surfaces the included PM bonus with the playlist link and usage guidance", () => {
		const markup = renderToStaticMarkup(<BonusCourseCard />);

		expect(markup).toContain("Included bonus");
		expect(markup).toContain("Product Management for Beginners");
		expect(markup).toContain("Open YouTube playlist");
		expect(markup).toContain(
			"https://www.youtube.com/playlist?list=PLO6IqfGPRUN1Bof9pACmGc955t4d0J6cM",
		);
		expect(markup).toContain("Start Here still comes first.");
	});
});
