import { stat } from "node:fs/promises";
import path from "node:path";
import { Effect, Layer } from "effect";

import {
	DoctorArtifactService,
	readJsonArtifactEffect,
	writeJsonArtifactEffect,
} from "../src/core/doctor-pass/artifacts";
import {
	ensureLocalProjectStateDirectory,
	type LocalProjectState,
	LocalProjectStateService,
	readLocalProjectStateEffect,
	readLocalProjectState,
	writeLocalProjectStateEffect,
	writeLocalProjectState,
} from "../src/core/local-project-state";
import {
	LocalRunnerHomeService,
	resolveLocalRunnerHome,
	readRunnerCredentialEffect,
	readRunnerCredential,
	writeRunnerCredentialEffect,
	writeRunnerCredential,
} from "../src/core/local-runner-home";
import {
	ensureRepositoryDirectoryEffect,
	RepositoryBoundaryService,
	writeRepositoryTextFileEffect,
} from "../src/core/repository-boundary";
import {
	createTemporaryDirectory,
	initializeGitRepository,
} from "./test-utils";

describe("local runner state", () => {
	it("uses the short SBS runner home by default", () => {
		expect(
			resolveLocalRunnerHome({ HOME: "/Users/tester" } as NodeJS.ProcessEnv),
		).toBe(path.resolve("/Users/tester/.sbs/runner"));
	});

	it("falls back to the OS home directory when HOME is empty", () => {
		const runnerHome = resolveLocalRunnerHome({
			HOME: "",
		} as NodeJS.ProcessEnv);

		expect(runnerHome).not.toBe(path.resolve(".sbs/runner"));
		expect(runnerHome.endsWith(path.join(".sbs", "runner"))).toBe(true);
	});

	it("keeps repo-local metadata separate from user-home credentials", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-runner-repo-");
		const runnerHome = await createTemporaryDirectory("sbs-runner-home-");
		await initializeGitRepository(repositoryRoot);

		await ensureLocalProjectStateDirectory(repositoryRoot);
		await writeLocalProjectState(repositoryRoot, {
			schemaVersion: 1,
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			runnerMode: "daemon",
			apiBaseUrl: "https://example.com/",
			eventEndpoint: "/api/workspace/runner/events",
			repositoryDisplayName: "repo",
			machineDisplayName: "machine",
			runnerVersion: "0.1.0",
			pairedAt: 1,
			updatedAt: 2,
		});
		await writeRunnerCredential({
			runnerHome,
			repositoryRoot,
			credential: {
				projectId: "workspaceProjects_1",
				runnerId: "workspaceRunnerBindings_1",
				runnerToken: "sbs_run_secret",
				apiBaseUrl: "https://example.com/",
				eventEndpoint: "/api/workspace/runner/events",
				updatedAt: 3,
			},
		});

		const projectState = await readLocalProjectState(repositoryRoot);
		const credential = await readRunnerCredential({
			runnerHome,
			repositoryRoot,
		});
		const credentialMode =
			(await stat(path.join(runnerHome, "credentials.json"))).mode & 0o777;

		expect(projectState?.runnerId).toBe("workspaceRunnerBindings_1");
		expect(JSON.stringify(projectState)).not.toContain("sbs_run_secret");
		expect(credential?.runnerToken).toBe("sbs_run_secret");
		expect(credentialMode).toBe(0o600);
	});

	it("supports injecting repository and local project state services", async () => {
		const repositoryCalls: string[] = [];
		const stubRepositoryBoundaryService = Layer.succeed(
			RepositoryBoundaryService,
			RepositoryBoundaryService.of({
				assertNoSymlinkPath: (request) =>
					Effect.sync(() => {
						repositoryCalls.push(`assert:${request.repoRelativePath}`);
					}),
				ensureDirectory: (request) =>
					Effect.sync(() => {
						repositoryCalls.push(`mkdir:${request.repoRelativePath}`);
						return path.join(request.repositoryRoot, request.repoRelativePath);
					}),
				writeTextFile: (request) =>
					Effect.sync(() => {
						repositoryCalls.push(
							`write:${request.repoRelativePath}:${request.value.trim()}`,
						);
					}),
			}),
		);

		const repositoryDirectory = await Effect.runPromise(
			ensureRepositoryDirectoryEffect("/repo", ".sbs/runs").pipe(
				Effect.provide(stubRepositoryBoundaryService),
			),
		);
		await Effect.runPromise(
			writeRepositoryTextFileEffect("/repo", ".sbs/.gitignore", "*\n").pipe(
				Effect.provide(stubRepositoryBoundaryService),
			),
		);

		expect(repositoryDirectory).toBe(path.join("/repo", ".sbs/runs"));
		expect(repositoryCalls).toEqual([
			"mkdir:.sbs/runs",
			"write:.sbs/.gitignore:*",
		]);

		const projectState: LocalProjectState = {
			schemaVersion: 1,
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			runnerMode: "daemon",
			apiBaseUrl: "https://example.com/",
			eventEndpoint: "/api/workspace/runner/events",
			repositoryDisplayName: "repo",
			machineDisplayName: "machine",
			runnerVersion: "0.1.0",
			pairedAt: 1,
			updatedAt: 2,
		};
		let storedProjectState: typeof projectState | null = null;
		const stubLocalProjectStateService = Layer.succeed(
			LocalProjectStateService,
			LocalProjectStateService.of({
				ensureDirectory: (request) =>
					Effect.succeed(path.join(request.repositoryRoot, ".sbs")),
				readProjectState: () => Effect.succeed(storedProjectState),
				writeProjectState: (request) =>
					Effect.sync(() => {
						storedProjectState = request.state;
					}),
				readDaemonStatus: () => Effect.succeed(null),
				writeDaemonStatus: () => Effect.void,
				readCodexThreadState: () => Effect.succeed(null),
				writeCodexThreadState: () => Effect.void,
				requestDaemonStop: () => Effect.void,
				clearDaemonStop: () => Effect.void,
				shouldStopDaemon: () => Effect.succeed(false),
			}),
		);

		await Effect.runPromise(
			writeLocalProjectStateEffect("/repo", projectState).pipe(
				Effect.provide(stubLocalProjectStateService),
			),
		);
		const readProjectState = await Effect.runPromise(
			readLocalProjectStateEffect("/repo").pipe(
				Effect.provide(stubLocalProjectStateService),
			),
		);

		expect(readProjectState).toEqual(projectState);
	});

	it("supports injecting runner-home and doctor artifact services", async () => {
		const credential = {
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			runnerToken: "sbs_run_secret",
			apiBaseUrl: "https://example.com/",
			eventEndpoint: "/api/workspace/runner/events",
			updatedAt: 3,
		};
		let storedCredential: typeof credential | null = null;
		const stubLocalRunnerHomeService = Layer.succeed(
			LocalRunnerHomeService,
			LocalRunnerHomeService.of({
				ensureHome: (request) => Effect.succeed(request.runnerHome),
				readCredential: () => Effect.succeed(storedCredential),
				writeCredential: (request) =>
					Effect.sync(() => {
						storedCredential = request.credential;
					}),
			}),
		);

		await Effect.runPromise(
			writeRunnerCredentialEffect({
				runnerHome: "/runner-home",
				repositoryRoot: "/repo",
				credential,
			}).pipe(Effect.provide(stubLocalRunnerHomeService)),
		);
		const readCredential = await Effect.runPromise(
			readRunnerCredentialEffect({
				runnerHome: "/runner-home",
				repositoryRoot: "/repo",
			}).pipe(Effect.provide(stubLocalRunnerHomeService)),
		);

		expect(readCredential).toEqual(credential);

		const artifacts = new Map<string, unknown>();
		const stubDoctorArtifactService = Layer.succeed(
			DoctorArtifactService,
			DoctorArtifactService.of({
				ensureReportDirectory: (request) =>
					Effect.succeed(
						path.join(request.repositoryRoot, ".sbs", request.runId),
					),
				writeJson: (request) =>
					Effect.sync(() => {
						artifacts.set(request.filePath, request.value);
					}),
				readJson: <T>(request: { filePath: string }) =>
					Effect.succeed(artifacts.get(request.filePath) as T),
			}),
		);

		await Effect.runPromise(
			writeJsonArtifactEffect({
				filePath: "/repo/.sbs/report.json",
				value: { ok: true },
			}).pipe(Effect.provide(stubDoctorArtifactService)),
		);
		const artifact = await Effect.runPromise(
			readJsonArtifactEffect<{ ok: boolean }>("/repo/.sbs/report.json").pipe(
				Effect.provide(stubDoctorArtifactService),
			),
		);

		expect(artifact).toEqual({ ok: true });
	});
});
