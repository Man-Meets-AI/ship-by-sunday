import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { renderLessonTitle } from "@/app/(workspace)/_components/course/lesson/workbench/shared/workbench-header";

describe("workbench header title rendering", () => {
	it("keeps the product name together when it appears in a lesson title", () => {
		const markup = renderToStaticMarkup(
			<>{renderLessonTitle("Ship by Sunday app brief")}</>,
		);

		expect(markup).toContain(
			'<span class="whitespace-nowrap">Ship by Sunday</span>',
		);
		expect(markup).toContain("app brief");
	});

	it("returns plain title text when no protected phrase is present", () => {
		const markup = renderToStaticMarkup(
			<>{renderLessonTitle("Build Core UX Plan Flow")}</>,
		);

		expect(markup).toBe("Build Core UX Plan Flow");
	});
});
