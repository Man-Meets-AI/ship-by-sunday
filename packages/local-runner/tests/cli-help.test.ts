import { runCli } from "../src/cli";

describe("cli", () => {
	it("prints the supported local runner commands", async () => {
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(runCli(["--help"])).resolves.toBe(0);

		expect(logSpy.mock.calls.join("\n")).toContain("setup pair <token>");
		expect(logSpy.mock.calls.join("\n")).toContain("daemon start");
		expect(logSpy.mock.calls.join("\n")).toContain(
			"--work --confirm-local-writes --confirm-observability-audit --confirm-docs-spine-adoption [--confirm-adoption-audit]",
		);
		expect(logSpy.mock.calls.join("\n")).toContain(
			"workflow observability-debuggability run",
		);
		expect(logSpy.mock.calls.join("\n")).toContain(
			"workflow mature-repo-adoption run",
		);
		expect(logSpy.mock.calls.join("\n")).toContain(
			"workflow docs-spine-adoption run",
		);
		logSpy.mockRestore();
	});
});
