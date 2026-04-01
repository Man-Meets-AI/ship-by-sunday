import { runCli } from "../src/run-cli";
import { createCliIo } from "./test-helpers";

describe("CLI help and version routing", () => {
	it("prints grouped top-level help", async () => {
		const { io, stdout, stderr } = createCliIo();

		const exitCode = await runCli({
			argv: ["--help"],
			io,
			projectRootPath: process.cwd(),
		});

		expect(exitCode).toBe(0);
		expect(stderr).toEqual([]);
		const helpText = stdout.join("\n");
		expect(helpText).toContain("Ship by Sunday CLI");
		expect(helpText).toContain("Start or resume");
		expect(helpText).toContain("bun run sbs resume");
		expect(helpText).toContain("./bin/sbs [command]");
		expect(helpText).toContain("Version and shell integration");
		expect(helpText).toContain("Move data in and out");
	});

	it.each([
		["help review", ["help", "review"], "Ship by Sunday draft review"],
		["review --help", ["review", "--help"], "Ship by Sunday draft review"],
		["stage --help", ["stage", "--help"], "Ship by Sunday stage editor"],
	])(
		"routes %s to command help without execution",
		async (_, argv, expected) => {
			const promptStage = vi.fn();
			const { io, stdout, stderr } = createCliIo();

			const exitCode = await runCli({
				argv,
				io,
				promptStage,
				projectRootPath: process.cwd(),
			});

			expect(exitCode).toBe(0);
			expect(promptStage).not.toHaveBeenCalled();
			expect(stderr).toEqual([]);
			expect(stdout.join("\n")).toContain(expected);
		},
	);

	it("prints the raw version string and json envelope", async () => {
		const { io, stdout, stderr } = createCliIo();

		const versionExitCode = await runCli({
			argv: ["version"],
			io,
			projectRootPath: process.cwd(),
		});

		expect(versionExitCode).toBe(0);
		expect(stderr).toEqual([]);
		expect(stdout.join("\n")).toBe("0.1.0");

		const versionJsonIo = createCliIo();
		const versionJsonExitCode = await runCli({
			argv: ["--version", "--json"],
			io: versionJsonIo.io,
			projectRootPath: process.cwd(),
		});

		expect(versionJsonExitCode).toBe(0);
		expect(JSON.parse(versionJsonIo.stdout.join("\n"))).toMatchObject({
			status: "ok",
			command: "version",
			version: "0.1.0",
		});
	});

	it("does not execute a command when help is requested", async () => {
		const promptStage = vi.fn();
		const { io, stdout } = createCliIo();

		const exitCode = await runCli({
			argv: ["resume", "--help"],
			io,
			promptStage,
			projectRootPath: process.cwd(),
		});

		expect(exitCode).toBe(0);
		expect(promptStage).not.toHaveBeenCalled();
		expect(stdout.join("\n")).toContain("Ship by Sunday resume");
	});

	it.each([
		["bash", "# Ship by Sunday CLI completion for bash"],
		["zsh", "#compdef sbs"],
	])("prints %s completion scripts", async (shellName, expectedSnippet) => {
		const { io, stdout } = createCliIo();

		const exitCode = await runCli({
			argv: ["completion", shellName],
			io,
			projectRootPath: process.cwd(),
		});

		expect(exitCode).toBe(0);
		expect(stdout.join("\n")).toContain(expectedSnippet);
	});

	it("rejects unsupported completion shells with a stable error", async () => {
		const { io, stderr } = createCliIo();

		const exitCode = await runCli({
			argv: ["completion", "fish"],
			io,
			projectRootPath: process.cwd(),
		});

		expect(exitCode).toBe(2);
		expect(stderr.join("\n")).toContain(
			'Unsupported shell "fish". Expected one of bash, zsh.',
		);
	});
});
