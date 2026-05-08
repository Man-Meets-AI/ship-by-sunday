import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { runInstallCommand } from "../src/commands/install";
import {
	createTemporaryDirectory,
	initializeGitRepository,
} from "./test-utils";

const execFileAsync = promisify(execFile);

describe("Worker Foundations install command", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("reports a sync-safe read-only dry run", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(
				["--repo", repositoryRoot, "--dry-run", "--json", "--no-kickoff"],
				{ ...process.env, SHIPBYSUNDAY_WORKER_HOME: workerHome },
			),
		).resolves.toBe(0);

		const output = logSpy.mock.calls.join("\n");
		const result = JSON.parse(output) as {
			outcome: string;
			plan: { proofCommands: string[] };
		};
		expect(result.outcome).toBe("ready");
		expect(result.plan.proofCommands).toContain("bun run docs:validate");
		expect(output).not.toContain(repositoryRoot);
		expect(output).not.toContain(workerHome);
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(false);
		expect(existsSync(path.join(repositoryRoot, ".worker"))).toBe(false);
	});

	it("installs visible Worker source and dogfoods the child plan writer", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(
				[
					"--repo",
					repositoryRoot,
					"--yes",
					"--json",
					"--no-kickoff",
					"--no-commit",
				],
				{ ...process.env, SHIPBYSUNDAY_WORKER_HOME: workerHome },
			),
		).resolves.toBe(0);

		const output = logSpy.mock.calls.join("\n");
		const result = JSON.parse(output) as {
			outcome: string;
			proof: Array<{ command: string; status: string }>;
		};
		expect(result.outcome).toBe("installed");
		expect(result.proof).toEqual(
			expect.arrayContaining([
				{ command: "bun run docs:validate", status: "passed" },
				{ command: "bun run worker:test", status: "passed" },
			]),
		);

		const packageJson = JSON.parse(
			await readFile(path.join(repositoryRoot, "package.json"), "utf8"),
		) as { scripts: Record<string, string> };
		expect(packageJson.scripts["docs:validate"]).toBe(
			"./scripts/run-worker.sh docs:validate",
		);
		expect(packageJson.scripts["worker:test"]).toBe(
			"./scripts/run-worker.sh test",
		);
		expect(
			await readFile(
				path.join(repositoryRoot, "apps/worker/src/worker-cli.ts"),
				"utf8",
			),
		).toContain("program:write-child-plan");
		expect(
			await readFile(
				path.join(
					repositoryRoot,
					"docs/exec-plans/active/2026-05-08-worker-foundations-first-plan.md",
				),
				"utf8",
			),
		).toContain("program_id: worker-foundations-adoption");
		expect(
			await readFile(
				path.join(repositoryRoot, "docs/worker/install-report.md"),
				"utf8",
			),
		).toContain("Outcome: `installed`");
	});

	it("auto-commits tracked install files without staging ignored Worker state", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(
				["--repo", repositoryRoot, "--yes", "--json", "--no-kickoff"],
				{ ...process.env, SHIPBYSUNDAY_WORKER_HOME: workerHome },
			),
		).resolves.toBe(0);

		const result = JSON.parse(logSpy.mock.calls.join("\n")) as {
			commit: string | null;
		};
		expect(result.commit).toMatch(/^[0-9a-f]+$/);

		const committedFiles = await execFileAsync(
			"git",
			["show", "--name-only", "--format=", "HEAD"],
			{ cwd: repositoryRoot },
		);
		expect(committedFiles.stdout).toContain("docs/worker/install-report.md");
		expect(committedFiles.stdout).toContain("apps/worker/package.json");
		expect(committedFiles.stdout).not.toContain(".worker/");

		const status = await execFileAsync("git", ["status", "--porcelain"], {
			cwd: repositoryRoot,
		});
		expect(status.stdout.trim()).toBe("");
	});

	it("provisions a Worker-managed Bun toolchain when Bun is not on PATH", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const pathWithoutBun = await createTemporaryDirectory(
			"worker-no-bun-path-",
		);
		const bunExecutable = findExecutableOnPath("bun");
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(
				[
					"--repo",
					repositoryRoot,
					"--yes",
					"--json",
					"--no-kickoff",
					"--no-commit",
				],
				{
					...process.env,
					PATH: pathWithoutBun,
					SHIPBYSUNDAY_WORKER_HOME: workerHome,
					SHIPBYSUNDAY_WORKER_BUN: bunExecutable,
				},
			),
		).resolves.toBe(0);

		const output = logSpy.mock.calls.join("\n");
		const result = JSON.parse(output) as {
			outcome: string;
			plan: {
				toolchain: {
					runtime: string;
					status: string;
					origin: string;
					targetRef: string;
				};
			};
			proof: Array<{ command: string; status: string }>;
		};
		expect(result.outcome).toBe("installed");
		expect(result.plan.toolchain).toEqual({
			runtime: "bun",
			status: "provisionable",
			origin: "explicit-env",
			targetRef: "worker-home/toolchains/bun/bin/bun",
		});
		expect(output).not.toContain(workerHome);
		expect(existsSync(path.join(workerHome, "toolchains/bun/bin/bun"))).toBe(
			true,
		);
		expect(result.proof).toEqual(
			expect.arrayContaining([
				{ command: "bun run docs:validate", status: "passed" },
			]),
		);
	});

	it("blocks unrecognized same-name scripts without leaking script bodies", async () => {
		const repositoryRoot = await createFixtureRepository({
			scripts: {
				"docs:validate": "echo SECRET_SCRIPT_BODY",
			},
		});
		const workerHome = await createWorkerHome();
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(
				["--repo", repositoryRoot, "--dry-run", "--json", "--no-kickoff"],
				{ ...process.env, SHIPBYSUNDAY_WORKER_HOME: workerHome },
			),
		).resolves.toBe(2);

		const output = logSpy.mock.calls.join("\n");
		expect(output).toContain("Existing same-name package script");
		expect(output).not.toContain("SECRET_SCRIPT_BODY");
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(false);
	});

	it("plans legacy runtime scripts as managed updates", async () => {
		const repositoryRoot = await createFixtureRepository({
			scripts: {
				"programs:lint": "./scripts/run-runtime.sh programs:lint",
				"docs:validate": "./scripts/run-runtime.sh docs:validate",
			},
		});
		const workerHome = await createWorkerHome();
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(
				["--repo", repositoryRoot, "--dry-run", "--json", "--no-kickoff"],
				{ ...process.env, SHIPBYSUNDAY_WORKER_HOME: workerHome },
			),
		).resolves.toBe(0);

		const output = logSpy.mock.calls.join("\n");
		expect(output).toContain("Existing legacy Worker runtime script");
		expect(output).not.toContain("run-runtime.sh programs:lint");
	});
});

async function createFixtureRepository({
	scripts = {},
}: {
	scripts?: Record<string, string>;
} = {}) {
	const repositoryRoot = await createTemporaryDirectory("worker-install-repo-");
	await initializeGitRepository(repositoryRoot);
	await writeFile(
		path.join(repositoryRoot, "package.json"),
		`${JSON.stringify(
			{
				name: "worker-install-fixture",
				private: true,
				packageManager: "bun@1.3.5",
				scripts,
			},
			null,
			"\t",
		)}\n`,
	);
	await execFileAsync("git", ["add", "package.json"], { cwd: repositoryRoot });
	await execFileAsync("git", ["commit", "-m", "test fixture"], {
		cwd: repositoryRoot,
	});
	return repositoryRoot;
}

async function createWorkerHome() {
	const workerHome = await createTemporaryDirectory("worker-install-home-");
	await mkdir(workerHome, { recursive: true });
	await writeFile(
		path.join(workerHome, "license.json"),
		JSON.stringify({ status: "active" }),
	);
	return workerHome;
}

function findExecutableOnPath(executableName: string) {
	for (const directory of (process.env.PATH ?? "").split(path.delimiter)) {
		const candidatePath = path.join(directory, executableName);
		if (existsSync(candidatePath)) {
			return candidatePath;
		}
	}
	throw new Error(`${executableName} was not found on PATH.`);
}
