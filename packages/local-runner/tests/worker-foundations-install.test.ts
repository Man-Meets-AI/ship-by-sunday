import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import {
	chmod,
	mkdir,
	readFile,
	realpath,
	symlink,
	writeFile,
} from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { promisify } from "node:util";

import { Effect, Layer } from "effect";

import { runInstallCommand } from "../src/commands/install";
import { SHIPBYSUNDAY_WORKER_CODEX_BLOCK_START } from "../src/core/codex-config-manager";
import {
	LocalRunnerHomeService,
	RUNNER_HOME_ENV_VAR,
	type RunnerCredential,
	writeRunnerCredential,
} from "../src/core/local-runner-home";
import {
	readQueuedRunnerEvents,
	RunnerEventService,
	type RunnerEvent,
} from "../src/core/runner-events";
import { buildSkippedKickoff } from "../src/workflows/worker-foundations-install/kickoff";
import {
	runWorkerFoundationsInstall,
	type WorkerInstallOptions,
} from "../src/workflows/worker-foundations-install/workflow";
import {
	WORKER_LICENSE_API_BASE_URL_ENV_VAR,
	WORKER_LICENSE_OPEN_BROWSER_ENV_VAR,
} from "../src/workflows/worker-foundations-install/manifest";
import {
	buildBlockedPlan,
	finishAndMaybeSyncResultEffect,
} from "../src/workflows/worker-foundations-install/result";
import type { FinishResultInput } from "../src/workflows/worker-foundations-install/types";
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
		expect(result.plan.proofCommands).toContain("npm run docs:validate");
		expect(output).not.toContain(repositoryRoot);
		expect(output).not.toContain(workerHome);
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(false);
		expect(existsSync(path.join(repositoryRoot, ".worker"))).toBe(false);
	});

	it("syncs a Worker install preview event when runner credentials exist", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const runnerHome = await createTemporaryDirectory("worker-runner-home-");
		const pairedRepositoryRoot = await realpath(repositoryRoot);
		const runnerEventServer = await createRunnerEventServer();
		await writeRunnerCredential({
			runnerHome,
			repositoryRoot: pairedRepositoryRoot,
			credential: {
				projectId: "workspaceProjects_1",
				runnerId: "workspaceRunnerBindings_1",
				runnerToken: "sbs_run_install_preview",
				apiBaseUrl: runnerEventServer.baseUrl,
				eventEndpoint: "/api/workspace/runner/events",
				updatedAt: 1,
			},
		});

		try {
			const result = await runWorkerFoundationsInstall({
				options: {
					...workerInstallOptions({ repoPath: repositoryRoot }),
					dryRun: true,
				},
				env: {
					...process.env,
					SHIPBYSUNDAY_WORKER_HOME: workerHome,
					[RUNNER_HOME_ENV_VAR]: runnerHome,
				},
			});

			expect(result.outcome).toBe("ready");
			expect(runnerEventServer.requests).toHaveLength(1);
			expect(runnerEventServer.requests[0]).toMatchObject({
				authorization: "Bearer sbs_run_install_preview",
				method: "POST",
				url: "/api/workspace/runner/events",
			});
			const syncedEvent = JSON.parse(runnerEventServer.requests[0].body) as {
				payload: {
					eventType: string;
					outcome: string;
					status: string;
					summary: string;
					createdRefs: string[];
					changedRefs: string[];
					proofCommandResults: unknown[];
				};
			};
			expect(syncedEvent.payload).toMatchObject({
				eventType: "worker.install.previewed",
				outcome: "ready",
				status: "ready",
				summary: "Worker Foundations install is ready.",
			});
			expect(syncedEvent.payload.createdRefs).toEqual([]);
			expect(syncedEvent.payload.changedRefs).toEqual([]);
			expect(syncedEvent.payload.proofCommandResults).toEqual([]);
			expect(JSON.stringify(syncedEvent)).not.toContain(repositoryRoot);
			expect(JSON.stringify(syncedEvent)).not.toContain(workerHome);
			expect(await readQueuedRunnerEvents(repositoryRoot)).toEqual([]);
		} finally {
			await runnerEventServer.close();
		}
	});

	it("syncs Worker install events through injected Effect services", async () => {
		const repositoryRoot = "/virtual/repository";
		const runnerHome = "/virtual/runner-home";
		const credential: RunnerCredential = {
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			runnerToken: "sbs_run_injected",
			apiBaseUrl: "https://runner.example.test",
			eventEndpoint: "/api/workspace/runner/events",
			updatedAt: 1,
		};
		const credentialRequests: Array<{
			repositoryRoot: string;
			runnerHome: string;
		}> = [];
		const queuedEvents: RunnerEvent[] = [];
		const flushRequests: Array<{
			repositoryRoot: string;
			runnerToken: string;
		}> = [];
		const localRunnerHomeLayer = Layer.succeed(
			LocalRunnerHomeService,
			LocalRunnerHomeService.of({
				ensureHome: (request) => Effect.succeed(request.runnerHome),
				readCredential: (request) =>
					Effect.sync(() => {
						credentialRequests.push({
							repositoryRoot: request.repositoryRoot,
							runnerHome: request.runnerHome,
						});
						return credential;
					}),
				writeCredential: () => Effect.void,
			}),
		);
		const runnerEventLayer = Layer.succeed(
			RunnerEventService,
			RunnerEventService.of({
				queue: (request) =>
					Effect.sync(() => {
						queuedEvents.push(request.event);
					}),
				readQueued: () => Effect.succeed([]),
				flush: (request) =>
					Effect.sync(() => {
						flushRequests.push({
							repositoryRoot: request.repositoryRoot,
							runnerToken: request.credential.runnerToken,
						});
						return { delivered: 1, remaining: 0 };
					}),
			}),
		);

		const result = await Effect.runPromise(
			finishAndMaybeSyncResultEffect({
				outcome: "installed",
				exitCode: 0,
				summary: "Worker Foundations installed.",
				context: {
					env: { [RUNNER_HOME_ENV_VAR]: runnerHome },
					now: 123,
					options: workerInstallOptions({ repoPath: repositoryRoot }),
					repositoryRoot,
					workerHome: "/virtual/worker-home",
					runId: "worker-install-injected",
				},
				plan: buildBlockedPlan({ packageManager: "npm", blockers: [] }),
				proof: [{ command: "npm run docs:validate", status: "passed" }],
				createdRefs: ["apps/worker/package.json"],
				changedRefs: [],
				branch: "worker-foundations/install",
				commit: "0123456789abcdef",
				localProofRef: "docs/worker/local-proof.json",
				reportRef: "docs/worker/install-report.md",
				kickoff: buildSkippedKickoff("disabled"),
			}).pipe(
				Effect.provide(Layer.merge(localRunnerHomeLayer, runnerEventLayer)),
			),
		);

		expect(result.outcome).toBe("installed");
		expect(credentialRequests).toEqual([{ repositoryRoot, runnerHome }]);
		expect(queuedEvents).toHaveLength(1);
		expect(queuedEvents[0]).toMatchObject({
			eventType: "worker.install.completed",
			projectId: credential.projectId,
			runnerId: credential.runnerId,
		});
		expect(queuedEvents[0].payload).toMatchObject({
			eventType: "worker.install.completed",
			outcome: "installed",
			status: "installed",
			summary: "Worker Foundations installed.",
			createdRefs: ["apps/worker/package.json"],
			changedRefs: [],
			proofCommandResults: [
				{ commandLabel: "npm run docs:validate", status: "passed" },
			],
			reportRef: "docs/worker/install-report.md",
			localProofRef: "docs/worker/local-proof.json",
		});
		expect(flushRequests).toEqual([
			{ repositoryRoot, runnerToken: credential.runnerToken },
		]);
	});

	it("swallows Worker install credential lookup failures after result construction", async () => {
		const repositoryRoot = "/virtual/repository";
		const runnerHome = "/virtual/runner-home";
		const credentialRequests: Array<{
			repositoryRoot: string;
			runnerHome: string;
		}> = [];
		const queuedEvents: RunnerEvent[] = [];
		const flushRequests: string[] = [];
		const localRunnerHomeLayer = Layer.succeed(
			LocalRunnerHomeService,
			LocalRunnerHomeService.of({
				ensureHome: (request) => Effect.succeed(request.runnerHome),
				readCredential: (request) =>
					Effect.sync(() => {
						credentialRequests.push({
							repositoryRoot: request.repositoryRoot,
							runnerHome: request.runnerHome,
						});
					}).pipe(
						Effect.flatMap(() =>
							Effect.fail(new Error("Runner credential lookup unavailable.")),
						),
					),
				writeCredential: () => Effect.void,
			}),
		);
		const runnerEventLayer = Layer.succeed(
			RunnerEventService,
			RunnerEventService.of({
				queue: (request) =>
					Effect.sync(() => {
						queuedEvents.push(request.event);
					}),
				readQueued: () => Effect.succeed([]),
				flush: (request) =>
					Effect.sync(() => {
						flushRequests.push(request.repositoryRoot);
						return { delivered: 0, remaining: 0 };
					}),
			}),
		);

		const result = await Effect.runPromise(
			finishAndMaybeSyncResultEffect(
				workerFinishResultInput({
					context: workerFinishContext({ repositoryRoot, runnerHome }),
				}),
			).pipe(
				Effect.provide(Layer.merge(localRunnerHomeLayer, runnerEventLayer)),
			),
		);

		expect(result.outcome).toBe("installed");
		expect(credentialRequests).toEqual([{ repositoryRoot, runnerHome }]);
		expect(queuedEvents).toEqual([]);
		expect(flushRequests).toEqual([]);
	});

	it("swallows Worker install event construction defects from stale credentials", async () => {
		const repositoryRoot = "/virtual/repository";
		const runnerHome = "/virtual/runner-home";
		const unsafeCredential: RunnerCredential = {
			projectId: "/tmp/workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			runnerToken: "sbs_run_stale",
			apiBaseUrl: "https://runner.example.test",
			eventEndpoint: "/api/workspace/runner/events",
			updatedAt: 1,
		};
		const queuedEvents: RunnerEvent[] = [];
		const localRunnerHomeLayer = Layer.succeed(
			LocalRunnerHomeService,
			LocalRunnerHomeService.of({
				ensureHome: (request) => Effect.succeed(request.runnerHome),
				readCredential: () => Effect.succeed(unsafeCredential),
				writeCredential: () => Effect.void,
			}),
		);
		const runnerEventLayer = Layer.succeed(
			RunnerEventService,
			RunnerEventService.of({
				queue: (request) =>
					Effect.sync(() => {
						queuedEvents.push(request.event);
					}),
				readQueued: () => Effect.succeed([]),
				flush: () => Effect.succeed({ delivered: 0, remaining: 0 }),
			}),
		);

		const result = await Effect.runPromise(
			finishAndMaybeSyncResultEffect(
				workerFinishResultInput({
					context: workerFinishContext({ repositoryRoot, runnerHome }),
				}),
			).pipe(
				Effect.provide(Layer.merge(localRunnerHomeLayer, runnerEventLayer)),
			),
		);

		expect(result.outcome).toBe("installed");
		expect(queuedEvents).toEqual([]);
	});

	it("swallows Worker install event queue failures after result construction", async () => {
		const repositoryRoot = "/virtual/repository";
		const runnerHome = "/virtual/runner-home";
		const credential: RunnerCredential = {
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			runnerToken: "sbs_run_queue_failure",
			apiBaseUrl: "https://runner.example.test",
			eventEndpoint: "/api/workspace/runner/events",
			updatedAt: 1,
		};
		const flushRequests: string[] = [];
		const localRunnerHomeLayer = Layer.succeed(
			LocalRunnerHomeService,
			LocalRunnerHomeService.of({
				ensureHome: (request) => Effect.succeed(request.runnerHome),
				readCredential: () => Effect.succeed(credential),
				writeCredential: () => Effect.void,
			}),
		);
		const runnerEventLayer = Layer.succeed(
			RunnerEventService,
			RunnerEventService.of({
				queue: () => Effect.fail(new Error("Runner event queue unavailable.")),
				readQueued: () => Effect.succeed([]),
				flush: (request) =>
					Effect.sync(() => {
						flushRequests.push(request.repositoryRoot);
					}).pipe(
						Effect.flatMap(() =>
							Effect.fail(new Error("Flush should not run.")),
						),
					),
			}),
		);

		const result = await Effect.runPromise(
			finishAndMaybeSyncResultEffect(
				workerFinishResultInput({
					context: workerFinishContext({ repositoryRoot, runnerHome }),
				}),
			).pipe(
				Effect.provide(Layer.merge(localRunnerHomeLayer, runnerEventLayer)),
			),
		);

		expect(result.outcome).toBe("installed");
		expect(flushRequests).toEqual([]);
	});

	it("swallows Worker install event flush failures after queueing event", async () => {
		const repositoryRoot = "/virtual/repository";
		const runnerHome = "/virtual/runner-home";
		const credential: RunnerCredential = {
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			runnerToken: "sbs_run_flush_failure",
			apiBaseUrl: "https://runner.example.test",
			eventEndpoint: "/api/workspace/runner/events",
			updatedAt: 1,
		};
		const queuedEvents: RunnerEvent[] = [];
		const flushRequests: Array<{
			repositoryRoot: string;
			runnerToken: string;
		}> = [];
		const localRunnerHomeLayer = Layer.succeed(
			LocalRunnerHomeService,
			LocalRunnerHomeService.of({
				ensureHome: (request) => Effect.succeed(request.runnerHome),
				readCredential: () => Effect.succeed(credential),
				writeCredential: () => Effect.void,
			}),
		);
		const runnerEventLayer = Layer.succeed(
			RunnerEventService,
			RunnerEventService.of({
				queue: (request) =>
					Effect.sync(() => {
						queuedEvents.push(request.event);
					}),
				readQueued: () => Effect.succeed([]),
				flush: (request) =>
					Effect.sync(() => {
						flushRequests.push({
							repositoryRoot: request.repositoryRoot,
							runnerToken: request.credential.runnerToken,
						});
					}).pipe(
						Effect.flatMap(() =>
							Effect.fail(new Error("Runner event flush unavailable.")),
						),
					),
			}),
		);

		const result = await Effect.runPromise(
			finishAndMaybeSyncResultEffect(
				workerFinishResultInput({
					context: workerFinishContext({ repositoryRoot, runnerHome }),
				}),
			).pipe(
				Effect.provide(Layer.merge(localRunnerHomeLayer, runnerEventLayer)),
			),
		);

		expect(result.outcome).toBe("installed");
		expect(queuedEvents).toHaveLength(1);
		expect(queuedEvents[0]).toMatchObject({
			eventType: "worker.install.completed",
			projectId: credential.projectId,
			runnerId: credential.runnerId,
		});
		expect(flushRequests).toEqual([
			{ repositoryRoot, runnerToken: credential.runnerToken },
		]);
	});

	it("surfaces Worker install result construction failures before event sync", async () => {
		const credentialRequests: string[] = [];
		const localRunnerHomeLayer = Layer.succeed(
			LocalRunnerHomeService,
			LocalRunnerHomeService.of({
				ensureHome: (request) => Effect.succeed(request.runnerHome),
				readCredential: (request) =>
					Effect.sync(() => {
						credentialRequests.push(request.repositoryRoot);
						return null;
					}),
				writeCredential: () => Effect.void,
			}),
		);
		const runnerEventLayer = Layer.succeed(
			RunnerEventService,
			RunnerEventService.of({
				queue: () => Effect.void,
				readQueued: () => Effect.succeed([]),
				flush: () => Effect.succeed({ delivered: 0, remaining: 0 }),
			}),
		);

		await expect(
			Effect.runPromise(
				finishAndMaybeSyncResultEffect(
					workerFinishResultInput({
						createdRefs: ["/tmp/unsafe-local-ref"],
					}),
				).pipe(
					Effect.provide(Layer.merge(localRunnerHomeLayer, runnerEventLayer)),
				),
			),
		).rejects.toThrow("worker install result is not sync-safe");
		expect(credentialRequests).toEqual([]);
	});

	it("does not sync Worker install events when runner credentials are absent", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const runnerHome = await createTemporaryDirectory("worker-runner-home-");
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response(null, { status: 200 }));

		const result = await runWorkerFoundationsInstall({
			options: {
				...workerInstallOptions({ repoPath: repositoryRoot }),
				dryRun: true,
			},
			env: {
				...process.env,
				SHIPBYSUNDAY_WORKER_HOME: workerHome,
				[RUNNER_HOME_ENV_VAR]: runnerHome,
			},
		});

		expect(result.outcome).toBe("ready");
		expect(fetchSpy).not.toHaveBeenCalled();
		expect(await readQueuedRunnerEvents(repositoryRoot)).toEqual([]);
	});

	it("queues blocked Worker install events when immediate sync fails", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome(null);
		const runnerHome = await createTemporaryDirectory("worker-runner-home-");
		const pairedRepositoryRoot = await realpath(repositoryRoot);
		const runnerEventServer = await createRunnerEventServer({ status: 503 });
		await writeRunnerCredential({
			runnerHome,
			repositoryRoot: pairedRepositoryRoot,
			credential: {
				projectId: "workspaceProjects_1",
				runnerId: "workspaceRunnerBindings_1",
				runnerToken: "sbs_run_install_blocked",
				apiBaseUrl: runnerEventServer.baseUrl,
				eventEndpoint: "/api/workspace/runner/events",
				updatedAt: 1,
			},
		});

		try {
			const result = await runWorkerFoundationsInstall({
				options: workerInstallOptions({ repoPath: repositoryRoot }),
				env: {
					...process.env,
					SHIPBYSUNDAY_WORKER_HOME: workerHome,
					[RUNNER_HOME_ENV_VAR]: runnerHome,
				},
			});

			expect(result.exitCode).toBe(2);
			expect(runnerEventServer.requests).toHaveLength(1);
			const queuedEvents = await readQueuedRunnerEvents(repositoryRoot);
			expect(queuedEvents).toHaveLength(1);
			expect(queuedEvents[0].payload).toMatchObject({
				eventType: "worker.install.blocked",
				outcome: "blocked",
				status: "blocked",
				blockerIds: ["license"],
			});
			expect(
				queuedEvents[0].payload.eventType === "worker.install.blocked"
					? queuedEvents[0].payload.blockerReasons[0]
					: "",
			).toContain("missing");
			expect(JSON.stringify(queuedEvents[0])).not.toContain(repositoryRoot);
			expect(JSON.stringify(queuedEvents[0])).not.toContain(workerHome);
		} finally {
			await runnerEventServer.close();
		}
	});

	it("shows a grouped checklist before interactive confirmation", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const stdoutWriteSpy = vi
			.spyOn(process.stdout, "write")
			.mockImplementation(() => true);
		const restoreInteractiveInput = mockInteractiveInstallInput("y\n");

		try {
			await expect(
				runInstallCommand(
					["--repo", repositoryRoot, "--no-kickoff", "--no-commit"],
					{ ...process.env, SHIPBYSUNDAY_WORKER_HOME: workerHome },
				),
			).resolves.toBe(0);
		} finally {
			restoreInteractiveInput();
		}

		const stdout = stdoutWriteSpy.mock.calls.join("\n");
		expect(stdout).toContain(
			"Shipbysunday Worker Foundations install checklist",
		);
		expect(stdout).toContain("Preflight");
		expect(stdout).toContain("Root command scripts");
		expect(stdout).toContain("Worker-managed files");
		expect(stdout).toContain("Proof");
		expect(stdout).toContain("Local commit skipped by --no-commit.");
		expect(stdout).toContain("Codex kickoff skipped by --no-kickoff.");
		expect(stdout).toContain("Continue? [y/N]");
		expect(logSpy.mock.calls.join("\n")).toContain(
			"Worker Foundations installed.",
		);
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(true);
	});

	it("cancels from the grouped checklist before repo mutation", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const stdoutWriteSpy = vi
			.spyOn(process.stdout, "write")
			.mockImplementation(() => true);
		const restoreInteractiveInput = mockInteractiveInstallInput("n\n");

		try {
			await expect(
				runInstallCommand(
					["--repo", repositoryRoot, "--no-kickoff", "--no-commit"],
					{ ...process.env, SHIPBYSUNDAY_WORKER_HOME: workerHome },
				),
			).resolves.toBe(130);
		} finally {
			restoreInteractiveInput();
		}

		expect(stdoutWriteSpy.mock.calls.join("\n")).toContain(
			"Shipbysunday Worker Foundations install checklist",
		);
		expect(logSpy.mock.calls.join("\n")).toContain(
			"Worker Foundations install cancelled.",
		);
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(false);
		expect(existsSync(path.join(repositoryRoot, "docs/worker"))).toBe(false);
	});

	it("skips the interactive checklist when --yes is set", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const stdoutWriteSpy = vi
			.spyOn(process.stdout, "write")
			.mockImplementation(() => true);

		await expect(
			runInstallCommand(
				["--repo", repositoryRoot, "--yes", "--no-kickoff", "--no-commit"],
				{ ...process.env, SHIPBYSUNDAY_WORKER_HOME: workerHome },
			),
		).resolves.toBe(0);

		expect(stdoutWriteSpy).not.toHaveBeenCalled();
		expect(logSpy.mock.calls.join("\n")).toContain(
			"Worker Foundations installed.",
		);
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
				{ command: "npm run docs:validate", status: "passed" },
				{ command: "npm run worker:test", status: "passed" },
			]),
		);

		const packageJson = JSON.parse(
			await readFile(path.join(repositoryRoot, "package.json"), "utf8"),
		) as { packageManager: string; scripts: Record<string, string> };
		expect(packageJson.packageManager).toBe("npm@11.12.1");
		expect(packageJson.scripts["docs:validate"]).toBe(
			"./scripts/run-worker.sh docs:validate",
		);
		expect(packageJson.scripts["execplan:build"]).toBe(
			"./scripts/run-worker.sh execplan:build",
		);
		expect(packageJson.scripts["worker:test"]).toBe(
			"./scripts/run-worker.sh test",
		);
		expect(
			await readFile(
				path.join(repositoryRoot, "apps/worker/src/worker-cli.mjs"),
				"utf8",
			),
		).toContain("program:write-child-plan");
		const workerCliSource = await readFile(
			path.join(repositoryRoot, "apps/worker/src/worker-cli.mjs"),
			"utf8",
		);
		expect(workerCliSource).toContain("ship-by-sunday@0.1.0");
		expect(workerCliSource).toContain("cmd.exe");
		expect(workerCliSource).toContain("isWindowsCommandScript");
		const runWorkerShell = await readFile(
			path.join(repositoryRoot, "scripts/run-worker.sh"),
			"utf8",
		);
		expect(runWorkerShell).toContain(
			'PATH="${PATH:+$PATH:}$NODE_DIR"; export PATH',
		);
		await expect(
			readFile(path.join(repositoryRoot, "README.md"), "utf8"),
		).resolves.toContain("SHIPBYSUNDAY_PACKAGE_SPEC");
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
				"npm",
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

	it("forwards installed execplan:build to the autonomous runner", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		vi.spyOn(console, "log").mockImplementation(() => undefined);

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

		const fakeRunnerBin = await createFakeShipBySundayRunnerBin();
		await expect(
			execFileAsync(
				"./scripts/run-worker.sh",
				[
					"execplan:build",
					"--program-id",
					"worker-foundations-adoption",
					"--max-slices",
					"1",
				],
				{
					cwd: repositoryRoot,
					env: {
						...process.env,
						PATH: `${fakeRunnerBin.binDirectory}${path.delimiter}${process.env.PATH ?? ""}`,
					},
				},
			),
		).resolves.toMatchObject({ stderr: "", stdout: "" });

		const forwardedRepositoryRoot = await realpath(repositoryRoot);
		await expect(readFile(fakeRunnerBin.argsPath, "utf8")).resolves.toBe(
			[
				"execplan",
				"build",
				"--repo",
				forwardedRepositoryRoot,
				"--program-id",
				"worker-foundations-adoption",
				"--max-slices",
				"1",
				"",
			].join("\n"),
		);
	});

	it("falls back to package execution after npx-style installs", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		vi.spyOn(console, "log").mockImplementation(() => undefined);

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

		const fakePackageRunnerBin = await createFakePackageRunnerBin();
		await expect(
			execFileAsync(
				"npm",
				[
					"run",
					"execplan:build",
					"--",
					"--program-id",
					"worker-foundations-adoption",
					"--max-slices",
					"1",
				],
				{
					cwd: repositoryRoot,
					env: {
						...process.env,
						PATH: fakePackageRunnerBin.binDirectory,
					},
				},
			),
		).resolves.toMatchObject({ stderr: "", stdout: "" });

		const forwardedRepositoryRoot = await realpath(repositoryRoot);
		await expect(
			readFile(fakePackageRunnerBin.npxArgsPath, "utf8"),
		).resolves.toBe(
			[
				"--yes",
				"--package",
				"ship-by-sunday@0.1.0",
				"ship-by-sunday",
				"execplan",
				"build",
				"--repo",
				forwardedRepositoryRoot,
				"--program-id",
				"worker-foundations-adoption",
				"--max-slices",
				"1",
				"",
			].join("\n"),
		);
	});

	it("auto-commits tracked install files without staging ignored Worker state", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const runnerHome = await createTemporaryDirectory("worker-runner-home-");
		const pairedRepositoryRoot = await realpath(repositoryRoot);
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const runnerEventServer = await createRunnerEventServer();
		await writeRunnerCredential({
			runnerHome,
			repositoryRoot: pairedRepositoryRoot,
			credential: {
				projectId: "workspaceProjects_1",
				runnerId: "workspaceRunnerBindings_1",
				runnerToken: "sbs_run_install_completed",
				apiBaseUrl: runnerEventServer.baseUrl,
				eventEndpoint: "/api/workspace/runner/events",
				updatedAt: 1,
			},
		});

		try {
			await expect(
				runInstallCommand(
					["--repo", repositoryRoot, "--yes", "--json", "--no-kickoff"],
					{
						...process.env,
						SHIPBYSUNDAY_WORKER_HOME: workerHome,
						[RUNNER_HOME_ENV_VAR]: runnerHome,
					},
				),
			).resolves.toBe(0);

			const result = JSON.parse(logSpy.mock.calls.join("\n")) as {
				commit: string | null;
			};
			expect(result.commit).toMatch(/^[0-9a-f]+$/);
			expect(runnerEventServer.requests).toHaveLength(1);
			const syncedEvent = JSON.parse(runnerEventServer.requests[0].body) as {
				payload: {
					eventType: string;
					outcome: string;
					status: string;
					branch: string;
					commitHash: string;
					reportRef: string;
					proofCommandResults: Array<{
						commandLabel: string;
						status: string;
					}>;
				};
			};
			expect(syncedEvent.payload).toMatchObject({
				eventType: "worker.install.completed",
				outcome: "installed",
				status: "installed",
				branch: "shipbysunday/install",
				reportRef: "docs/worker/install-report.md",
			});
			expect(syncedEvent.payload.commitHash).toMatch(/^[0-9a-f]{7,12}$/);
			expect(result.commit?.startsWith(syncedEvent.payload.commitHash)).toBe(
				true,
			);
			expect(syncedEvent.payload.proofCommandResults).toEqual(
				expect.arrayContaining([
					{ commandLabel: "npm run docs:validate", status: "passed" },
					{ commandLabel: "npm run worker:test", status: "passed" },
				]),
			);
			expect(JSON.stringify(syncedEvent)).not.toContain(repositoryRoot);
			expect(JSON.stringify(syncedEvent)).not.toContain(workerHome);

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
		} finally {
			await runnerEventServer.close();
		}
	});

	it("cuts Bun lockfile-owned roots over to npm identity", async () => {
		const repositoryRoot = await createFixtureRepository({
			files: {
				"bun.lock": "# existing owner lockfile\n",
			},
			packageJson: {
				name: "bun-lockfile-owned",
				private: true,
				scripts: {
					dev: "bun --version",
				},
			},
		});
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
			plan: { packageManager: string };
		};
		expect(result.plan.packageManager).toBe("npm");
		const packageJson = JSON.parse(
			await readFile(path.join(repositoryRoot, "package.json"), "utf8"),
		) as { packageManager: string; scripts: Record<string, string> };
		expect(packageJson.packageManager).toBe("npm@11.12.1");
		expect(packageJson.scripts.dev).toBe("bun --version");
		expect(await readFile(path.join(repositoryRoot, "bun.lock"), "utf8")).toBe(
			"# existing owner lockfile\n",
		);
	}, 45_000);

	it("cuts legacy Bun lockfile-owned roots over to npm identity", async () => {
		const repositoryRoot = await createFixtureRepository({
			files: {
				"bun.lockb": "legacy bun binary lock placeholder\n",
			},
			packageJson: {
				name: "legacy-bun-lockfile-owned",
				private: true,
				scripts: {
					dev: "bun --version",
				},
			},
		});
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
			plan: { packageManager: string };
		};
		expect(result.plan.packageManager).toBe("npm");
		const packageJson = JSON.parse(
			await readFile(path.join(repositoryRoot, "package.json"), "utf8"),
		) as { packageManager: string; scripts: Record<string, string> };
		expect(packageJson.packageManager).toBe("npm@11.12.1");
		expect(packageJson.scripts.dev).toBe("bun --version");
		expect(await readFile(path.join(repositoryRoot, "bun.lockb"), "utf8")).toBe(
			"legacy bun binary lock placeholder\n",
		);
	}, 45_000);

	it("does not write packageManager identity for npm shrinkwrap-owned roots", async () => {
		const repositoryRoot = await createFixtureRepository({
			files: {
				"npm-shrinkwrap.json": `${JSON.stringify(
					{
						lockfileVersion: 3,
						name: "npm-shrinkwrap-owned",
						packages: { "": { name: "npm-shrinkwrap-owned" } },
					},
					null,
					"\t",
				)}\n`,
			},
			packageJson: {
				name: "npm-shrinkwrap-owned",
				private: true,
				scripts: {
					dev: "node server.js",
				},
			},
		});
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
			plan: { packageManager: string };
		};
		expect(result.plan.packageManager).toBe("npm");
		const packageJson = JSON.parse(
			await readFile(path.join(repositoryRoot, "package.json"), "utf8"),
		) as { packageManager?: string; scripts: Record<string, string> };
		expect(packageJson.packageManager).toBeUndefined();
		expect(packageJson.scripts.dev).toBe("node server.js");
	});

	it("blocks missing package-manager commands before repo mutation", async () => {
		const repositoryRoot = await createFixtureRepository({
			packageJson: {
				name: "missing-pnpm-command",
				packageManager: "pnpm@9.12.0",
				private: true,
				scripts: {},
			},
		});
		const workerHome = await createWorkerHome();
		const pathWithoutPackageManagers = await createTemporaryDirectory(
			"worker-no-package-managers-",
		);
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(
				["--repo", repositoryRoot, "--yes", "--json", "--no-kickoff"],
				{
					...process.env,
					PATH: pathWithoutPackageManagers,
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
					blockerId: "package-manager-command",
					reason: expect.stringContaining("pnpm"),
				}),
			]),
		);
		expect(output).not.toContain(repositoryRoot);
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(false);
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
		const readme = await readFile(
			path.join(repositoryRoot, "README.md"),
			"utf8",
		);
		expect(countWorkerManagedStarts(readme)).toBe(1);
		const agents = await readFile(
			path.join(repositoryRoot, "AGENTS.md"),
			"utf8",
		);
		expect(countWorkerManagedStarts(agents)).toBe(1);
	}, 45_000);

	it("blocks before repo mutation when Node is not on PATH", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const pathWithoutNode = await createTemporaryDirectory(
			"worker-no-node-path-",
		);
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(
				["--repo", repositoryRoot, "--dry-run", "--json", "--no-kickoff"],
				{
					...process.env,
					PATH: pathWithoutNode,
					SHIPBYSUNDAY_WORKER_HOME: workerHome,
				},
			),
		).resolves.toBe(2);

		const result = JSON.parse(logSpy.mock.calls.join("\n")) as {
			outcome: string;
			plan: { blockers: Array<{ blockerId: string }> };
		};
		expect(result.outcome).toBe("blocked");
		expect(result.plan.blockers).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ blockerId: "worker-node-runtime" }),
			]),
		);
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(false);
		expect(existsSync(path.join(repositoryRoot, "docs/worker"))).toBe(false);
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
			licenseSignature:
				"_-0uFWcv1HgkqxeZeCHDtV4_okmrxHRMOImCysbOdLKp0eiS5RKi_NYkyYTLxRJMA2nn86rGLKn4GEgfgp46DQ",
			machineId: "machine_test",
			issued_at: "2026-05-08T00:00:00.000Z",
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

	it("blocks forged local licenses before repo mutation", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome({
			...activeWorkerLicense(),
			machineCredential: "sbs_machine_forged_test",
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
					reason: expect.stringContaining("signature"),
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
		const restoreInteractiveInput = mockInteractiveInstallInput("y\n");

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
			restoreInteractiveInput();
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

	it("reports fixed activation denial reasons without server-controlled text", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome(null);
		const activationServer = await createActivationServer({
			status: "denied",
			reason:
				"visit https://example.test/secret?token=sbs_run_should_not_leak sk-should-not-leak",
		});
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		vi.spyOn(process.stderr, "write").mockImplementation(() => true);
		vi.spyOn(process.stdout, "write").mockImplementation(() => true);
		const restoreInteractiveInput = mockInteractiveInstallInput("y\n");

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
			).resolves.toBe(2);
		} finally {
			restoreInteractiveInput();
			await activationServer.close();
		}

		const output = logSpy.mock.calls.join("\n");
		expect(output).toContain("Worker license activation was denied.");
		expect(output).not.toContain("https://example.test/secret");
		expect(output).not.toContain("sbs_run_should_not_leak");
		expect(output).not.toContain("sk-should-not-leak");
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(false);
	});

	it("blocks JSON installs without --yes before prompting", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const stdoutWriteSpy = vi
			.spyOn(process.stdout, "write")
			.mockImplementation(() => true);

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
		expect(stdoutWriteSpy).not.toHaveBeenCalled();
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(false);
	});

	it("blocks JSON actual installs unless kickoff is explicitly disabled", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const codexHome = await createTemporaryDirectory("worker-codex-home-");
		const kickoffProbeFile = path.join(codexHome, "kickoff-probe.txt");
		const fakeBinDirectory = await createSuccessfulCodexBin({
			kickoffProbeFile,
		});
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(["--repo", repositoryRoot, "--yes", "--json"], {
				...process.env,
				CODEX_HOME: codexHome,
				PATH: `${fakeBinDirectory}${path.delimiter}${process.env.PATH ?? ""}`,
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
					blockerId: "json-kickoff",
					reason: expect.stringContaining("JSON install requires --no-kickoff"),
				}),
			]),
		);
		expect(existsSync(kickoffProbeFile)).toBe(false);
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

	it("blocks duplicate managed README markers during preflight", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const duplicateManagedBlock = [
			"# Existing README",
			"",
			"<!-- shipbysunday-worker:start -->",
			"## Shipbysunday Worker",
			"<!-- shipbysunday-worker:end -->",
			"",
			"Owner content",
			"",
			"<!-- shipbysunday-worker:start -->",
			"## Shipbysunday Worker",
			"<!-- shipbysunday-worker:end -->",
			"",
		].join("\n");
		await writeFixtureFile(repositoryRoot, "README.md", duplicateManagedBlock);
		await commitFixtureFiles(repositoryRoot, ["README.md"]);
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
		expect(output).toContain("duplicate Worker managed markers");
		expect(await readFile(path.join(repositoryRoot, "README.md"), "utf8")).toBe(
			duplicateManagedBlock,
		);
		expect(existsSync(path.join(repositoryRoot, "apps/worker"))).toBe(false);
	});

	it("blocks owner-authored apps/worker files before mutation", async () => {
		const repositoryRoot = await createFixtureRepository({
			files: {
				"apps/worker/README.md": "# Owner Worker Area\n",
			},
		});
		const workerHome = await createWorkerHome();
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
		expect(output).toContain("Existing apps/worker file");
		expect(output).not.toContain("# Owner Worker Area");
		expect(
			await readFile(
				path.join(repositoryRoot, "apps/worker/README.md"),
				"utf8",
			),
		).toBe("# Owner Worker Area\n");
		expect(
			existsSync(path.join(repositoryRoot, "apps/worker/src/worker-cli.mjs")),
		).toBe(false);
	});

	it("blocks owner-authored apps/worker file before mutation", async () => {
		const repositoryRoot = await createFixtureRepository({
			files: {
				"apps/worker": "owner worker file\n",
			},
		});
		const workerHome = await createWorkerHome();
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
		expect(output).toContain("apps/worker");
		expect(output).not.toContain(repositoryRoot);
		expect(
			await readFile(path.join(repositoryRoot, "apps/worker"), "utf8"),
		).toBe("owner worker file\n");
		expect(
			existsSync(path.join(repositoryRoot, "apps/worker/src/worker-cli.mjs")),
		).toBe(false);
	});

	it("blocks lone legacy placeholder lockfile before mutation", async () => {
		const repositoryRoot = await createFixtureRepository({
			files: {
				"apps/worker/bun.lock": "# Worker package lockfile placeholder.\n",
			},
		});
		const workerHome = await createWorkerHome();
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
		expect(output).toContain("apps/worker/bun.lock");
		expect(existsSync(path.join(repositoryRoot, "apps/worker/bun.lock"))).toBe(
			true,
		);
		expect(
			existsSync(path.join(repositoryRoot, "apps/worker/src/worker-cli.mjs")),
		).toBe(false);
	});

	it("removes the legacy Worker placeholder lockfile during recognized reruns", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const env = { ...process.env, SHIPBYSUNDAY_WORKER_HOME: workerHome };
		vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(
				["--repo", repositoryRoot, "--yes", "--json", "--no-kickoff"],
				env,
			),
		).resolves.toBe(0);
		await writeFixtureFile(
			repositoryRoot,
			"apps/worker/bun.lock",
			"# Worker package lockfile placeholder.\n",
		);
		await commitFixtureFiles(repositoryRoot, ["apps/worker/bun.lock"]);

		await expect(
			runInstallCommand(
				["--repo", repositoryRoot, "--yes", "--json", "--no-kickoff"],
				env,
			),
		).resolves.toBe(0);

		expect(existsSync(path.join(repositoryRoot, "apps/worker/bun.lock"))).toBe(
			false,
		);
		const status = await execFileAsync("git", ["status", "--porcelain"], {
			cwd: repositoryRoot,
		});
		expect(status.stdout.trim()).toBe("");
		await expect(
			execFileAsync("git", ["cat-file", "-e", "HEAD:apps/worker/bun.lock"], {
				cwd: repositoryRoot,
			}),
		).rejects.toThrow();
	}, 45_000);

	it("starts foreground Codex kickoff after proof and commit", async () => {
		const repositoryRoot = await createFixtureRepository();
		const workerHome = await createWorkerHome();
		const codexHome = await createTemporaryDirectory("worker-codex-home-");
		const kickoffProbeFile = path.join(codexHome, "kickoff-probe.txt");
		const fakeBinDirectory = await createSuccessfulCodexBin({
			kickoffProbeFile,
		});
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runInstallCommand(["--repo", repositoryRoot, "--yes"], {
				...process.env,
				CODEX_HOME: codexHome,
				PATH: `${fakeBinDirectory}${path.delimiter}${process.env.PATH ?? ""}`,
				SHIPBYSUNDAY_WORKER_HOME: workerHome,
			}),
		).resolves.toBe(0);

		expect(logSpy.mock.calls.join("\n")).toContain(
			"Worker Foundations installed.",
		);
		expect(await readFile(kickoffProbeFile, "utf8")).toBe("present\n");

		const installReport = await readFile(
			path.join(repositoryRoot, "docs/worker/install-report.md"),
			"utf8",
		);
		expect(installReport).toContain("Outcome: `installed`");
		expect(installReport).toContain("Status: `started`");

		const status = await execFileAsync("git", ["status", "--porcelain"], {
			cwd: repositoryRoot,
		});
		expect(status.stdout.trim()).toBe("");
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
			runInstallCommand(["--repo", repositoryRoot, "--yes"], {
				...process.env,
				CODEX_HOME: codexHome,
				GITHUB_TOKEN: "gho_should_not_leak",
				OPENAI_API_KEY: "sk-should-not-leak",
				PATH: `${fakeBinDirectory}${path.delimiter}${process.env.PATH ?? ""}`,
				SHIPBYSUNDAY_WORKER_HOME: workerHome,
			}),
		).resolves.toBe(1);

		expect(logSpy.mock.calls.join("\n")).toContain(
			"Worker Foundations kickoff failed.",
		);
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
	files = {},
	packageJson,
	scripts = {},
}: {
	files?: Record<string, string>;
	packageJson?: Record<string, unknown>;
	scripts?: Record<string, string>;
} = {}) {
	const repositoryRoot = await createTemporaryDirectory("worker-install-repo-");
	await initializeGitRepository(repositoryRoot);
	const rootPackageJson =
		packageJson ??
		({
			name: "worker-install-fixture",
			private: true,
			packageManager: "npm@11.12.1",
			scripts,
		} as Record<string, unknown>);
	await writeFile(
		path.join(repositoryRoot, "package.json"),
		`${JSON.stringify(rootPackageJson, null, "\t")}\n`,
	);
	for (const [ref, contents] of Object.entries(files)) {
		await writeFixtureFile(repositoryRoot, ref, contents);
	}
	await execFileAsync("git", ["add", "."], { cwd: repositoryRoot });
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
		licenseSignature:
			"xyZ_Fw-aFmRO1PY4EQvEvCAR-GOwAP0Ekw5oFeN65uXb0WC_HUz99X1u0FtNgVFD2lA0RXEXq4l7XkiRRUGDBw",
		machineCredential: "sbs_machine_test_credential",
		machineId: "machine_test",
		schemaVersion: "shipbysunday-worker-license.v1",
		status: "active",
	};
}

function workerInstallOptions(
	options: Pick<WorkerInstallOptions, "repoPath">,
): WorkerInstallOptions {
	return {
		dryRun: false,
		json: true,
		noCommit: true,
		noKickoff: true,
		yes: true,
		...options,
	};
}

function workerFinishContext({
	repositoryRoot = "/virtual/repository",
	runnerHome = "/virtual/runner-home",
}: {
	repositoryRoot?: string;
	runnerHome?: string;
} = {}): FinishResultInput["context"] {
	return {
		env: { [RUNNER_HOME_ENV_VAR]: runnerHome },
		now: 123,
		options: workerInstallOptions({ repoPath: repositoryRoot }),
		repositoryRoot,
		workerHome: "/virtual/worker-home",
		runId: "worker-install-injected",
	};
}

function workerFinishResultInput(
	overrides: Partial<FinishResultInput> = {},
): FinishResultInput {
	return {
		outcome: "installed",
		exitCode: 0,
		summary: "Worker Foundations installed.",
		context: workerFinishContext(),
		plan: buildBlockedPlan({ packageManager: "npm", blockers: [] }),
		proof: [{ command: "npm run docs:validate", status: "passed" }],
		createdRefs: ["apps/worker/package.json"],
		changedRefs: [],
		branch: "worker-foundations/install",
		commit: "0123456789abcdef",
		localProofRef: "docs/worker/local-proof.json",
		reportRef: "docs/worker/install-report.md",
		kickoff: buildSkippedKickoff("disabled"),
		...overrides,
	};
}

function mockInteractiveInstallInput(answer: string) {
	const originalIsTty = process.stdin.isTTY;
	const stdinOnceSpy = vi
		.spyOn(process.stdin, "once")
		.mockImplementation((eventName, listener) => {
			if (eventName === "data") {
				queueMicrotask(() => {
					if (typeof listener === "function") {
						listener(Buffer.from(answer));
					}
				});
			}
			return process.stdin;
		});
	Object.defineProperty(process.stdin, "isTTY", {
		configurable: true,
		value: true,
	});
	return () => {
		stdinOnceSpy.mockRestore();
		Object.defineProperty(process.stdin, "isTTY", {
			configurable: true,
			value: originalIsTty,
		});
	};
}

async function createActivationServer(
	pollResponse: Record<string, unknown> | null = null,
) {
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
				JSON.stringify(
					pollResponse ?? {
						status: "approved",
						license: {
							...activeWorkerLicense(),
							licenseSignature:
								"WMWr9OTUunxzuDvB96V3pQeVE8oiiZZO3-bT4jSewRD--bsoO06s_6Dgm4tZWVQYx2XAAvZgOyc4gS-j_b7iDg",
							machineCredential: "sbs_machine_activated_test",
						},
					},
				),
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

async function createRunnerEventServer(options: { status?: number } = {}) {
	const requests: Array<{
		authorization: string;
		body: string;
		method: string | undefined;
		url: string | undefined;
	}> = [];
	const status = options.status ?? 200;
	const server = createServer(async (request, response) => {
		const body = await readRequestBody(request);
		requests.push({
			authorization: request.headers.authorization ?? "",
			body,
			method: request.method,
			url: request.url,
		});
		response.writeHead(status, { "Content-Type": "application/json" });
		response.end("{}");
	});
	await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
	const address = server.address();
	if (!address || typeof address === "string") {
		throw new Error("Runner event test server did not expose a TCP port.");
	}
	return {
		requests,
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

async function createFakeShipBySundayRunnerBin() {
	const binDirectory = await createTemporaryDirectory("worker-runner-bin-");
	const argsPath = path.join(binDirectory, "runner-args.txt");
	const runnerPath = path.join(binDirectory, "ship-by-sunday");
	await writeFile(
		runnerPath,
		[
			"#!/bin/sh",
			`printf '%s\\n' "$@" > ${shellQuote(argsPath)}`,
			"exit 0",
			"",
		].join("\n"),
	);
	await chmod(runnerPath, 0o755);
	return { argsPath, binDirectory };
}

async function createFakePackageRunnerBin() {
	const binDirectory = await createTemporaryDirectory(
		"worker-package-runner-bin-",
	);
	const npxArgsPath = path.join(binDirectory, "npx-args.txt");
	await symlink(process.execPath, path.join(binDirectory, "node"));
	await writeFile(
		path.join(binDirectory, "npm"),
		[
			"#!/bin/sh",
			'if [ "$1" = "run" ] && [ "$2" = "execplan:build" ]; then',
			"  shift 2",
			'  if [ "${1:-}" = "--" ]; then shift; fi',
			'  exec ./scripts/run-worker.sh execplan:build "$@"',
			"fi",
			'echo "unexpected npm args: $*" >&2',
			"exit 1",
			"",
		].join("\n"),
	);
	await writeFile(
		path.join(binDirectory, "npx"),
		[
			"#!/bin/sh",
			`printf '%s\\n' "$@" > ${shellQuote(npxArgsPath)}`,
			"exit 0",
			"",
		].join("\n"),
	);
	await chmod(path.join(binDirectory, "npm"), 0o755);
	await chmod(path.join(binDirectory, "npx"), 0o755);
	return { binDirectory, npxArgsPath };
}

async function createSuccessfulCodexBin({
	kickoffProbeFile,
}: {
	kickoffProbeFile: string;
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
			`  echo "present" > ${shellQuote(kickoffProbeFile)}`,
			"else",
			`  echo "missing" > ${shellQuote(kickoffProbeFile)}`,
			"fi",
			"exit 0",
			"",
		].join("\n"),
	);
	await chmod(codexPath, 0o755);
	return binDirectory;
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

function countWorkerManagedStarts(content: string) {
	return content.match(/<!-- shipbysunday-worker:start -->/gu)?.length ?? 0;
}
