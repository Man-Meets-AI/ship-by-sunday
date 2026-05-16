import { describe, expect, it } from "vitest";

import { isStarterModuleEnabled } from "@/config/starter-selectors";

describe("starter selectors", () => {
	it("reads enabled modules from an override map", () => {
		expect(
			isStarterModuleEnabled("course", {
				course: false,
				observability: true,
				codex: true,
			}),
		).toBe(false);
	});
});
