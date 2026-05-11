import { describe, expect, it } from "vitest";

import {
	getCodebaseWorkspaceState,
	saveProjectDefinitionFacts,
} from "@/convex/codebase";

import { createWorkspaceTestCtx } from "./workspace-test-helpers";

describe("generated-codebase data model", () => {
	it("rejects grants without Generate Codebase capability from generated-codebase state", async () => {
		const { ctx } = createWorkspaceTestCtx({
			capabilities: ["worker"],
		});

		await expect(
			getCodebaseWorkspaceState._handler(ctx as never, {}),
		).rejects.toThrow("Generated codebase access required");
		await expect(
			saveProjectDefinitionFacts._handler(ctx as never, {
				clearedFieldKeys: [],
				factsPatch: {},
			}),
		).rejects.toThrow("Generated codebase access required");
	});
});
