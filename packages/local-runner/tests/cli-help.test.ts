import { runCli } from "../src/cli";

describe("cli", () => {
	it("prints the supported local runner commands", async () => {
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(runCli(["--help"])).resolves.toBe(0);

		expect(logSpy.mock.calls.join("\n")).toContain("shipbysunday install");
		expect(logSpy.mock.calls.join("\n")).toContain("shipbysunday i");
		expect(logSpy.mock.calls.join("\n")).toContain("setup pair <token>");
		expect(logSpy.mock.calls.join("\n")).toContain("daemon start");
		expect(logSpy.mock.calls.join("\n")).toContain(
			"--work --confirm-local-writes --confirm-observability-audit --confirm-adoption-audit --confirm-docs-spine-adoption --confirm-docs-spine-apply --confirm-docs-operating-system-scan --confirm-docs-operating-system-tooling-plan --confirm-docs-operating-system-tooling-apply --confirm-docs-operating-system-lockfile-refresh",
		);
		expect(logSpy.mock.calls.join("\n")).toContain(
			"workflow observability-debuggability run",
		);
		expect(logSpy.mock.calls.join("\n")).toContain(
			"workflow mature-repo-adoption run",
		);
		expect(logSpy.mock.calls.join("\n")).toContain(
			"docs-operating-system <programs-lint|exec-plans-lint|markdown-lint|docs-validate|docs-refresh-quality|native-command-proof|write-child-plan>",
		);
		expect(logSpy.mock.calls.join("\n")).toContain(
			"workflow docs-spine-adoption run",
		);
		expect(logSpy.mock.calls.join("\n")).toContain(
			"workflow docs-spine-apply-and-proof run",
		);
		expect(logSpy.mock.calls.join("\n")).toContain(
			"workflow docs-operating-system-adoption run",
		);
		expect(logSpy.mock.calls.join("\n")).toContain(
			"workflow docs-operating-system-package-script-patching run",
		);
		expect(logSpy.mock.calls.join("\n")).toContain(
			"workflow docs-operating-system-lockfile-refresh run",
		);
		logSpy.mockRestore();
	});
});
