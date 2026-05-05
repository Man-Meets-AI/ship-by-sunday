import { stat } from "node:fs/promises";
import path from "node:path";

import {
	ensureLocalProjectStateDirectory,
	readLocalProjectState,
	writeLocalProjectState,
} from "../src/core/local-project-state";
import {
	resolveLocalRunnerHome,
	readRunnerCredential,
	writeRunnerCredential,
} from "../src/core/local-runner-home";
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
});
