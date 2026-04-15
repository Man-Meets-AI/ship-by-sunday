/** @vitest-environment jsdom */

import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderChecklistLabel } from "@/features/course/lesson/workbench/fields/checklist-label";

describe("renderChecklistLabel", () => {
	it("returns plain string when there are no backticks", () => {
		const { container } = render(
			<div>{renderChecklistLabel("No code here")}</div>,
		);
		expect(container.textContent).toBe("No code here");
		expect(container.querySelector("code")).toBeNull();
	});

	it("wraps backtick segments in code elements", () => {
		const { container } = render(
			<div>{renderChecklistLabel("Opened `.env.local` in the editor")}</div>,
		);
		expect(container.textContent).toBe("Opened .env.local in the editor");
		const code = container.querySelector("code");
		expect(code?.textContent).toBe(".env.local");
	});
});
