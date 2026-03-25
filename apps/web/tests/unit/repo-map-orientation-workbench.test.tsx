/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { getLessonById } from "@/features/course/lesson/model";
import { WorkbenchRenderer } from "@/features/course/lesson/workbench/renderer";

describe("repo map orientation workbench (lesson 3.2)", () => {
	it("renders project map, secrets alert, resource buttons, and commands tab", async () => {
		const user = userEvent.setup();
		const lesson = getLessonById("3.2");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 3.2.");
		}

		render(
			<WorkbenchRenderer
				lesson={lesson}
				lessonContent={lesson.content}
				fieldValues={{}}
				onFieldChange={() => {}}
				pinnedArtifacts={[]}
				layoutMode="focus"
			/>,
		);

		expect(screen.getByRole("tab", { name: /project map/i })).toBeTruthy();
		expect(screen.getByText(/Secrets stay private/i)).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: /tool overview video/i })
				.getAttribute("href"),
		).toContain("youtube.com");
		expect(
			screen
				.getByRole("link", { name: /step-by-step setup guide/i })
				.getAttribute("href"),
		).toBe("/docs/local-setup");

		await user.click(screen.getByRole("tab", { name: /^commands$/i }));
		expect(screen.getByText("bun run dev")).toBeTruthy();
		expect(
			screen.getByRole("link", { name: /deploy guide/i }).getAttribute("href"),
		).toBe("/docs/deploy-to-vercel");
	});
});
