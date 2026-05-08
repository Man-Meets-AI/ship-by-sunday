import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { promisify } from "node:util";

import { runInstallCommand } from "../src/commands/install";
import { SHIPBYSUNDAY_WORKER_CODEX_BLOCK_START } from "../src/core/codex-config-manager";
import {
	WORKER_LICENSE_API_BASE_URL_ENV_VAR,
	WORKER_LICENSE_OPEN_BROWSER_ENV_VAR,
} from "../src/workflows/worker-foundations-install/manifest";
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
		const activeChildPlan = await readFile(
			path.join(
				repositoryRoot,
				"docs/exec-plans/active/2026-05-08-worker-foundations-first-plan.md",
			),
			"utf8",
		);
		expect(activeChildPlan).toContain(
			"program_id: worker-foundations-adoption",
		);
		const completedPlanRef =
			"docs/exec-plans/completed/2026-05-08-worker-foundations-complete.md";
		await writeFixtureFile(
			repositoryRoot,
			completedPlanRef,
			activeChildPlan.replace("status: active", "status: complete"),
		);
		await expect(
			execFileAsync(
				"bun",
				["run", "plans:lint", "--", "--plan", completedPlanRef],
				{ cwd: repositoryRoot },
			),
		).resolves.toMatchObject({
			stdout: expect.stringContaining(`${completedPlanRef}: ok`),
		});
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

		const installReport = await readFile(
			path.join(repositoryRoot, "docs/worker/install-report.md"),
			"utf8",
		);
		expect(installReport).toContain(
			"Commit: `current branch HEAD after install`",
		);
		expect(installReport).not.toContain("Commit: `not-created`");

		const status = await execFileAsync("git", ["status", "--porcelain"], {
			cwd: repositoryRoot,
		});
		expect(status.stdout.trim()).toBe("");
	});

	it("reruns a committed install without failing on the existing starter child plan", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const env = { ...process.env, SHIPBYSUNDAY_WORKER_HOME: workerHome };

		await expect(
			runInstallCommand(
				["--repo", repositoryRoot, "--yes", "--json", "--no-kickoff"],
				env,
			),
		).resolves.toBe(0);

		logSpy.mockClear();
		await expect(
			runInstallCommand(
				["--repo", repositoryRoot, "--yes", "--json", "--no-kickoff"],
				env,
			),
		).resolves.toBe(0);

		const result = JSON.parse(logSpy.mock.calls.join("\n")) as {
			outcome: string;
		};
		expect(result.outcome).toBe("installed");

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

	it("blocks invalid licenses before repo mutation", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome({
			expires_at: "2000-01-01T00:00:00.000Z",
			machineCredential: "sbs_machine_test_credential",
			schemaVersion: "shipbysunday-worker-license.v1",
			status: "active",
		});
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(
				["--repo", repositoryRoot, "--yes", "--json", "--no-kickoff"],
				{
					...process.env,
					SHIPBYSUNDAY_WORKER_HOME: workerHome,
				},
			),
		).resolves.toBe(2);

		const output = logSpy.mock.calls.join("\n");
		const result = JSON.parse(output) as {
			outcome: string;
			plan: { blockers: Array<{ blockerId: string; reason: string }> };
		};
		expect(result.outcome).toBe("blocked");
		expect(result.plan.blockers).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					blockerId: "license",
					reason: expect.stringContaining("invalid"),
				}),
			]),
		);
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(false);
		expect(existsSync(path.join(repositoryRoot, "docs/worker"))).toBe(false);
	});

	it("blocks legacy status-only licenses before repo mutation", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome({ status: "active" });
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(
				["--repo", repositoryRoot, "--yes", "--json", "--no-kickoff"],
				{
					...process.env,
					SHIPBYSUNDAY_WORKER_HOME: workerHome,
				},
			),
		).resolves.toBe(2);

		const output = logSpy.mock.calls.join("\n");
		const result = JSON.parse(output) as {
			outcome: string;
			plan: { blockers: Array<{ blockerId: string; reason: string }> };
		};
		expect(result.outcome).toBe("blocked");
		expect(result.plan.blockers).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					blockerId: "license",
					reason: expect.stringContaining("schema version"),
				}),
			]),
		);
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(false);
		expect(existsSync(path.join(repositoryRoot, "docs/worker"))).toBe(false);
	});

	it("blocks missing licenses in noninteractive installs without repo mutation", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome(null);
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(
				["--repo", repositoryRoot, "--yes", "--json", "--no-kickoff"],
				{
					...process.env,
					SHIPBYSUNDAY_WORKER_HOME: workerHome,
				},
			),
		).resolves.toBe(2);

		const output = logSpy.mock.calls.join("\n");
		const result = JSON.parse(output) as {
			outcome: string;
			plan: { blockers: Array<{ blockerId: string; reason: string }> };
		};
		expect(result.outcome).toBe("blocked");
		expect(result.plan.blockers).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					blockerId: "license",
					reason: expect.stringContaining("missing"),
				}),
			]),
		);
		expect(existsSync(path.join(workerHome, "license.json"))).toBe(false);
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(false);
	});

	it("activates missing licenses interactively before repo mutation", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome(null);
		const activationServer = await createActivationServer();
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		vi.spyOn(process.stderr, "write").mockImplementation(() => true);
		vi.spyOn(process.stdout, "write").mockImplementation(() => true);
		const originalIsTty = process.stdin.isTTY;
		const stdinOnceSpy = vi
			.spyOn(process.stdin, "once")
			.mockImplementation((eventName, listener) => {
				if (eventName === "data") {
					queueMicrotask(() => {
						if (typeof listener === "function") {
							listener(Buffer.from("y\n"));
						}
					});
				}
				return process.stdin;
			});
		Object.defineProperty(process.stdin, "isTTY", {
			configurable: true,
			value: true,
		});

		try {
			await expect(
				runInstallCommand(
					["--repo", repositoryRoot, "--no-kickoff", "--no-commit"],
					{
						...process.env,
						SHIPBYSUNDAY_WORKER_HOME: workerHome,
						[WORKER_LICENSE_API_BASE_URL_ENV_VAR]: activationServer.baseUrl,
						[WORKER_LICENSE_OPEN_BROWSER_ENV_VAR]: "0",
					},
				),
			).resolves.toBe(0);
		} finally {
			stdinOnceSpy.mockRestore();
			Object.defineProperty(process.stdin, "isTTY", {
				configurable: true,
				value: originalIsTty,
			});
			await activationServer.close();
		}

		expect(logSpy.mock.calls.join("\n")).toContain(
			"Worker Foundations installed.",
		);
		expect(activationServer.startRequests).toBe(1);
		expect(activationServer.pollRequests).toBe(1);
		const license = JSON.parse(
			await readFile(path.join(workerHome, "license.json"), "utf8"),
		) as { machineCredential?: string; schemaVersion?: string };
		expect(license.schemaVersion).toBe("shipbysunday-worker-license.v1");
		expect(license.machineCredential).toBe("sbs_machine_activated_test");
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(true);
	});

	it("blocks JSON installs without --yes before prompting", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(["--repo", repositoryRoot, "--json", "--no-kickoff"], {
				...process.env,
				SHIPBYSUNDAY_WORKER_HOME: workerHome,
			}),
		).resolves.toBe(2);

		const output = logSpy.mock.calls.join("\n");
		const result = JSON.parse(output) as {
			outcome: string;
			plan: { blockers: Array<{ blockerId: string; reason: string }> };
		};
		expect(result.outcome).toBe("blocked");
		expect(result.plan.blockers).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					blockerId: "confirmation",
					reason: expect.stringContaining("JSON install requires --yes"),
				}),
			]),
		);
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(false);
	});

	it("blocks unrecognized starter child plans during preflight", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const planRef =
			"docs/exec-plans/active/2026-05-08-worker-foundations-first-plan.md";
		await writeFixtureFile(repositoryRoot, planRef, "# Owner plan\n");
		await commitFixtureFiles(repositoryRoot, [planRef]);
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(
				["--repo", repositoryRoot, "--dry-run", "--json", "--no-kickoff"],
				{
					...process.env,
					SHIPBYSUNDAY_WORKER_HOME: workerHome,
				},
			),
		).resolves.toBe(2);

		const output = logSpy.mock.calls.join("\n");
		expect(output).toContain("starter child ExecPlan");
		expect(output).not.toContain(path.join(repositoryRoot, planRef));
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(false);
	});

	it("blocks incomplete managed AGENTS markers during preflight", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		await writeFixtureFile(
			repositoryRoot,
			"AGENTS.md",
			"# Root Agents\n\n<!-- shipbysunday-worker:start -->\n",
		);
		await commitFixtureFiles(repositoryRoot, ["AGENTS.md"]);
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(
				["--repo", repositoryRoot, "--dry-run", "--json", "--no-kickoff"],
				{
					...process.env,
					SHIPBYSUNDAY_WORKER_HOME: workerHome,
				},
			),
		).resolves.toBe(2);

		const output = logSpy.mock.calls.join("\n");
		expect(output).toContain("incomplete Worker managed markers");
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(false);
	});

	it("fails honestly when kickoff is blocked and does not leak secrets to Codex", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const codexHome = await createTemporaryDirectory("worker-codex-home-");
		const codexEnvFile = path.join(codexHome, "kickoff-env.txt");
		const reportProbeFile = path.join(codexHome, "report-probe.txt");
		const fakeBinDirectory = await createFailingCodexBin({
			codexEnvFile,
			reportProbeFile,
		});
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(["--repo", repositoryRoot, "--yes", "--json"], {
				...process.env,
				CODEX_HOME: codexHome,
				GITHUB_TOKEN: "gho_should_not_leak",
				OPENAI_API_KEY: "sk-should-not-leak",
				PATH: `${fakeBinDirectory}${path.delimiter}${process.env.PATH ?? ""}`,
				SHIPBYSUNDAY_WORKER_HOME: workerHome,
			}),
		).resolves.toBe(1);

		const output = logSpy.mock.calls.join("\n");
		const result = JSON.parse(output) as {
			outcome: string;
			kickoff: { status: string };
		};
		expect(result.outcome).toBe("failed");
		expect(result.kickoff.status).toBe("blocked");
		expect(await readFile(reportProbeFile, "utf8")).toBe("present\n");

		const installReport = await readFile(
			path.join(repositoryRoot, "docs/worker/install-report.md"),
			"utf8",
		);
		expect(installReport).toContain("Outcome: `failed`");
		expect(installReport).toContain("Status: `blocked`");
		expect(installReport).not.toContain("Commit: `not-created`");

		const kickoffEnv = await readFile(codexEnvFile, "utf8");
		expect(kickoffEnv).toContain("SHIPBYSUNDAY_WORKER_HOME=");
		expect(kickoffEnv).not.toContain("OPENAI_API_KEY=");
		expect(kickoffEnv).not.toContain("GITHUB_TOKEN=");
		expect(kickoffEnv).not.toContain("sk-should-not-leak");
		expect(kickoffEnv).not.toContain("gho_should_not_leak");

		const codexConfigPath = path.join(codexHome, "config.toml");
		if (existsSync(codexConfigPath)) {
			expect(await readFile(codexConfigPath, "utf8")).not.toContain(
				SHIPBYSUNDAY_WORKER_CODEX_BLOCK_START,
			);
		}

		const status = await execFileAsync("git", ["status", "--porcelain"], {
			cwd: repositoryRoot,
		});
		expect(status.stdout.trim()).toBe("");
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

async function createWorkerHome(
	license: Record<string, string> | string | null = activeWorkerLicense(),
) {
	const workerHome = await createTemporaryDirectory("worker-install-home-");
	await mkdir(workerHome, { recursive: true });
	if (license !== null) {
		await writeFile(
			path.join(workerHome, "license.json"),
			typeof license === "string" ? license : JSON.stringify(license),
		);
	}
	return workerHome;
}

function activeWorkerLicense() {
	return {
		expires_at: "2999-01-01T00:00:00.000Z",
		issued_at: "2026-05-08T00:00:00.000Z",
		machineCredential: "sbs_machine_test_credential",
		machineId: "machine_test",
		schemaVersion: "shipbysunday-worker-license.v1",
		status: "active",
	};
}

async function createActivationServer() {
	let startRequests = 0;
	let pollRequests = 0;
	const server = createServer(async (request, response) => {
		await readRequestBody(request);
		if (
			request.method === "POST" &&
			request.url === "/api/worker/license/device/start"
		) {
			startRequests += 1;
			response.writeHead(200, { "Content-Type": "application/json" });
			response.end(
				JSON.stringify({
					deviceCode: "device_test",
					expiresAt: Date.now() + 60_000,
					intervalSeconds: 0.001,
					userCode: "SBS-TEST",
					verificationUrl: "https://example.test/activate",
				}),
			);
			return;
		}
		if (
			request.method === "POST" &&
			request.url === "/api/worker/license/device/poll"
		) {
			pollRequests += 1;
			response.writeHead(200, { "Content-Type": "application/json" });
			response.end(
				JSON.stringify({
					status: "approved",
					license: {
						...activeWorkerLicense(),
						machineCredential: "sbs_machine_activated_test",
					},
				}),
			);
			return;
		}
		response.writeHead(404);
		response.end();
	});
	await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
	const address = server.address();
	if (!address || typeof address === "string") {
		throw new Error("Activation test server did not expose a TCP port.");
	}
	return {
		get pollRequests() {
			return pollRequests;
		},
		get startRequests() {
			return startRequests;
		},
		baseUrl: `http://127.0.0.1:${address.port}`,
		close: () => new Promise<void>((resolve) => server.close(() => resolve())),
	};
}

async function readRequestBody(request: NodeJS.ReadableStream) {
	let body = "";
	for await (const chunk of request) {
		body += Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk);
	}
	return body;
}

async function writeFixtureFile(
	repositoryRoot: string,
	ref: string,
	contents: string,
) {
	const absolutePath = path.join(repositoryRoot, ref);
	await mkdir(path.dirname(absolutePath), { recursive: true });
	await writeFile(absolutePath, contents);
}

async function commitFixtureFiles(repositoryRoot: string, refs: string[]) {
	await execFileAsync("git", ["add", ...refs], { cwd: repositoryRoot });
	await execFileAsync("git", ["commit", "-m", "fixture update"], {
		cwd: repositoryRoot,
	});
}

async function createFailingCodexBin({
	codexEnvFile,
	reportProbeFile,
}: {
	codexEnvFile: string;
	reportProbeFile: string;
}) {
	const binDirectory = await createTemporaryDirectory("worker-codex-bin-");
	const codexPath = path.join(binDirectory, "codex");
	await writeFile(
		codexPath,
		[
			"#!/bin/sh",
			'if [ "$1" = "--version" ]; then echo "codex 1.0.0"; exit 0; fi',
			'if [ "$1" = "login" ] && [ "$2" = "status" ]; then echo "Logged in"; exit 0; fi',
			'if [ -f "docs/worker/install-report.md" ]; then',
			`  echo "present" > ${shellQuote(reportProbeFile)}`,
			"else",
			`  echo "missing" > ${shellQuote(reportProbeFile)}`,
			"fi",
			`env > ${shellQuote(codexEnvFile)}`,
			"exit 42",
			"",
		].join("\n"),
	);
	await chmod(codexPath, 0o755);
	return binDirectory;
}

function shellQuote(value: string) {
	return `'${value.replaceAll("'", "'\"'\"'")}'`;
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
