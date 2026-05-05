import { describe, expect, it } from "vitest";

import { isStarterModuleEnabled } from "@/config/starter-selectors";

describe("starter selectors", () => {
	it("reads enabled modules from an override map", () => {
		expect(
			isStarterModuleEnabled("docs", {
				docs: false,
				course: true,
				observability: true,
				codex: true,
			}),
		).toBe(false);

		expect(
			isStarterModuleEnabled("course", {
				docs: true,
				course: false,
				observability: true,
				codex: true,
			}),
		).toBe(false);
	});
});
