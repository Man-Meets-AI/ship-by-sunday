import { runBoundedProcess } from "../src/core/bounded-process";

describe("bounded process", () => {
	it("preserves missing executable failure codes", async () => {
		const result = await runBoundedProcess({
			command: "sbs-definitely-missing-command-enoent",
			args: [],
			timeoutMs: 1_000,
		});

		expect(result.succeeded).toBe(false);
		expect(result.failureCode).toBe("ENOENT");
	});
});
