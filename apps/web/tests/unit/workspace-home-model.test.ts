import { describe, expect, it } from "vitest";

import { buildWorkspaceHomeModel } from "@/app/(workspace)/_lib/workspace-home-model";

describe("workspace home model", () => {
	it("derives module counts and starter-mode copy from module flags", () => {
		const model = buildWorkspaceHomeModel({
			docs: true,
			course: false,
			codex: true,
			observability: true,
		});

		expect(model.enabledModuleCount).toBe(3);
		expect(model.totalModuleCount).toBe(4);
		expect(model.moduleCompletionPercent).toBe(75);
		expect(
			model.modules.find((module) => module.id === "course")?.statusLabel,
		).toBe("Starter mode");
		expect(model.quickActions.map((action) => action.label)).toEqual([
			"Open settings",
			"Open docs",
		]);
		expect(model.nextSteps.some((step) => step.id === "codex")).toBe(true);
	});
});
