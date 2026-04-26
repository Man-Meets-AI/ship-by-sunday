import { describe, expect, it } from "vitest";

describe("Convex HTTP boundary", () => {
	it("does not import Next server-only modules", async () => {
		await expect(import("@/convex/http")).resolves.toHaveProperty("default");
	});
});
