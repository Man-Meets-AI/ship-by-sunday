import { runDaemonCommand } from "../src/commands/daemon";

describe("daemon command", () => {
	it("requires mature repo adoption confirmation before worker mode can claim queue jobs", async () => {
		await expect(
			runDaemonCommand([
				"start",
				"--once",
				"--work",
				"--confirm-local-writes",
				"--confirm-observability-audit",
				"--confirm-docs-spine-adoption",
				"--confirm-docs-spine-apply",
				"--confirm-docs-operating-system-scan",
				"--confirm-docs-operating-system-tooling-plan",
				"--confirm-docs-operating-system-tooling-apply",
				"--confirm-docs-operating-system-lockfile-refresh",
			]),
		).rejects.toThrow("--confirm-adoption-audit");
	});

	it("requires docs operating system confirmations before worker mode can claim queue jobs", async () => {
		await expect(
			runDaemonCommand([
				"start",
				"--once",
				"--work",
				"--confirm-local-writes",
				"--confirm-observability-audit",
				"--confirm-adoption-audit",
				"--confirm-docs-spine-adoption",
				"--confirm-docs-spine-apply",
				"--confirm-docs-operating-system-scan",
			]),
		).rejects.toThrow("--confirm-docs-operating-system-tooling-plan");
	});

	it("requires docs operating system tooling apply confirmation before worker mode can claim queue jobs", async () => {
		await expect(
			runDaemonCommand([
				"start",
				"--once",
				"--work",
				"--confirm-local-writes",
				"--confirm-observability-audit",
				"--confirm-adoption-audit",
				"--confirm-docs-spine-adoption",
				"--confirm-docs-spine-apply",
				"--confirm-docs-operating-system-scan",
				"--confirm-docs-operating-system-tooling-plan",
			]),
		).rejects.toThrow("--confirm-docs-operating-system-tooling-apply");
	});

	it("requires docs operating system lockfile refresh confirmation before worker mode can claim queue jobs", async () => {
		await expect(
			runDaemonCommand([
				"start",
				"--once",
				"--work",
				"--confirm-local-writes",
				"--confirm-observability-audit",
				"--confirm-adoption-audit",
				"--confirm-docs-spine-adoption",
				"--confirm-docs-spine-apply",
				"--confirm-docs-operating-system-scan",
				"--confirm-docs-operating-system-tooling-plan",
				"--confirm-docs-operating-system-tooling-apply",
			]),
		).rejects.toThrow("--confirm-docs-operating-system-lockfile-refresh");
	});
});
