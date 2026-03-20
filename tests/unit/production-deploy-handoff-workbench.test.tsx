/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";

import { getLessonById } from "@/features/course/lesson/model";
import { WorkbenchRenderer } from "@/features/course/lesson/workbench/renderer";

describe("production deploy handoff workbench (lesson 3.14)", () => {
	it("renders services card, alerts, steps, accordions, README prompt, and success checks", () => {
		const lesson = getLessonById("3.14");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 3.14.");
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

		expect(screen.getByText("Before you deploy")).toBeTruthy();
		expect(screen.getByText("Cloudflare")).toBeTruthy();
		expect(screen.getByText("Vercel")).toBeTruthy();
		expect(screen.getByText("Convex")).toBeTruthy();

		expect(screen.getByText("Protect production secrets")).toBeTruthy();
		expect(
			screen.getByText(/Stripe: product and price in production/i),
		).toBeTruthy();

		expect(screen.getByRole("checkbox", { name: /^Open README$/ })).toBeTruthy();
		expect(
			screen.getByRole("checkbox", { name: /^Deploy$/ }),
		).toBeTruthy();

		expect(
			screen.getByRole("button", { name: /Cloudflare — API token/i }),
		).toBeTruthy();
		expect(
			screen.getByText(/Manage Account →\s*Account API Tokens → Create new token/),
		).toBeTruthy();
		expect(screen.getByText("Zone DNS Edit")).toBeTruthy();
		expect(screen.getByText("Zone Zone Read")).toBeTruthy();

		expect(
			screen.getByRole("button", { name: /Stripe — production secret key/i }),
		).toBeTruthy();
		expect(screen.getByText(/Switch to/i)).toBeTruthy();

		expect(
			screen.getByRole("button", { name: /Clerk — production keys/i }),
		).toBeTruthy();

		expect(screen.getByText("README deployment prompt")).toBeTruthy();
		expect(
			screen.getByRole("button", { name: /^Copy prompt$/ }),
		).toBeTruthy();

		expect(screen.getByLabelText(/Cloudflare API token/i)).toBeTruthy();
		expect(screen.getByLabelText(/Stripe live secret key \(paste\)/i)).toBeTruthy();

		expect(screen.getByText("Success checks")).toBeTruthy();
		expect(
			screen.getByRole("checkbox", { name: /^Site is live$/ }),
		).toBeTruthy();
		expect(
			screen.getByRole("checkbox", {
				name: /^Stripe prod\/test sync confirmed$/,
			}),
		).toBeTruthy();
	});
});
