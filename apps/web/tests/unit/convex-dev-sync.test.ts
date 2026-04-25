import { describe, expect, it } from "vitest";

import { buildHostedConvexDevSyncCommand } from "../../../../scripts/release/lib/convex-dev-sync.mjs";

describe("hosted convex dev sync command", () => {
	it("builds the one-shot hosted sync command", () => {
		expect(buildHostedConvexDevSyncCommand()).toEqual({
			command: "bunx",
			args: ["convex", "dev", "--once", "--typecheck", "disable"],
		});
	});
});
