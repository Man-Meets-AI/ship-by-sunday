import { runCli } from "../src/run-cli";
import { createCliIo } from "./test-helpers";

describe("CLI help", () => {
	it("prints the available commands", async () => {
		const { io, stdout, stderr } = createCliIo();

		const exitCode = await runCli({
			argv: ["--help"],
			io,
			repoRootPath: process.cwd(),
		});

		expect(exitCode).toBe(0);
		expect(stderr).toEqual([]);
		expect(stdout.join("\n")).toContain("bun run sbs schema [--json]");
		expect(stdout.join("\n")).toContain("bun run sbs next [--json]");
		expect(stdout.join("\n")).toContain("bun run sbs resume");
		expect(stdout.join("\n")).toContain("bun run sbs generate");
	});

	it("returns an error for an unknown command", async () => {
		const { io, stderr } = createCliIo();

		const exitCode = await runCli({
			argv: ["wat"],
			io,
			repoRootPath: process.cwd(),
		});

		expect(exitCode).toBe(2);
		expect(stderr.join("")).toContain('Unknown command "wat".');
	});
});
