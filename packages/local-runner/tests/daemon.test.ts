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
			]),
		).rejects.toThrow("--confirm-adoption-audit");
	});
});
