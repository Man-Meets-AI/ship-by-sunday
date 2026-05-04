import { chmod, writeFile } from "node:fs/promises";
import path from "node:path";

import { collectSetupChecks } from "../src/commands/setup-check";
import {
	createCodexHome,
	createFakeRunnerBin,
	createTemporaryDirectory,
	initializeGitRepository,
} from "./test-utils";

describe("setup check", () => {
	const originalPath = process.env.PATH;
	const originalCodexHome = process.env.CODEX_HOME;
	const originalProbeTimeout = process.env.SBS_RUNNER_PROBE_TIMEOUT_MS;

	afterEach(() => {
		process.env.PATH = originalPath;
		if (originalCodexHome === undefined) {
			delete process.env.CODEX_HOME;
		} else {
			process.env.CODEX_HOME = originalCodexHome;
		}
		if (originalProbeTimeout === undefined) {
			delete process.env.SBS_RUNNER_PROBE_TIMEOUT_MS;
		} else {
			process.env.SBS_RUNNER_PROBE_TIMEOUT_MS = originalProbeTimeout;
		}
	});

	it("reports machine and project readiness without reading Codex credentials", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-setup-check-");
		await initializeGitRepository(repositoryRoot);
		const codexHome = await createCodexHome();
		const { binDirectory } = await createFakeRunnerBin();
		process.env.PATH = `${binDirectory}${path.delimiter}${originalPath}`;
		process.env.CODEX_HOME = codexHome;

		const result = await collectSetupChecks({
			repositoryRoot,
			isGitRepository: true,
		});

		expect(result.checks).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					checkKey: "codex-cli",
					status: "ready",
				}),
				expect.objectContaining({
					checkKey: "codex-auth",
					status: "ready",
				}),
				expect.objectContaining({
					checkKey: "git-repository",
					status: "ready",
				}),
			]),
		);
	});

	it("bounds hanging readiness probes", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-setup-timeout-");
		await initializeGitRepository(repositoryRoot);
		const binDirectory = await createTemporaryDirectory("sbs-hanging-bin-");
		const codexPath = path.join(binDirectory, "codex");
		await writeFile(codexPath, ["#!/bin/sh", "sleep 5", ""].join("\n"));
		await chmod(codexPath, 0o755);
		process.env.PATH = `${binDirectory}${path.delimiter}${originalPath}`;
		process.env.SBS_RUNNER_PROBE_TIMEOUT_MS = "100";

		const result = await collectSetupChecks({
			repositoryRoot,
			isGitRepository: true,
		});

		expect(result.checks).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					checkKey: "codex-cli",
					status: "blocked",
				}),
			]),
		);
	});
});
