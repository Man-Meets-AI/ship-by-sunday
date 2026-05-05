import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { runBrokenAppTriageWorkflow } from "../src/core/broken-app-triage-workflow";
import type { RunnerCredential } from "../src/core/local-runner-home";
import type { LocalProjectState } from "../src/core/local-project-state";
import type { ApprovedWorkflowRunPacket } from "../src/core/workflow-run-api";
import {
	createTemporaryDirectory,
	initializeGitRepository,
} from "./test-utils";

const execFileAsync = promisify(execFile);

function createState(): LocalProjectState {
	return {
		schemaVersion: 1,
		projectId: "workspaceProjects_1",
		runnerId: "workspaceRunnerBindings_1",
		runnerMode: "daemon",
		apiBaseUrl: "https://example.com/",
		eventEndpoint: "/api/workspace/runner/events",
		repositoryDisplayName: "repo",
		machineDisplayName: "Runner Test",
		runnerVersion: "0.1.0",
		pairedAt: 1,
		updatedAt: 1,
	};
}

function createCredential(): RunnerCredential {
	return {
		projectId: "workspaceProjects_1",
		runnerId: "workspaceRunnerBindings_1",
		runnerToken: "sbs_run_secret",
		apiBaseUrl: "https://example.com/",
		eventEndpoint: "/api/workspace/runner/events",
		updatedAt: 1,
	};
}

function createApprovedWorkflowRun(
	overrides: Partial<ApprovedWorkflowRunPacket> = {},
): ApprovedWorkflowRunPacket {
	return {
		workflowRunId: "workflowRuns_broken",
		workflowId: "broken-app-triage",
		workflowVersion: "v1",
		branchName: "sbs/broken-app-triage-20260504-2100",
		profileName: "sbs-doctor-readonly",
		writeLeaseId: "lease_workflowRuns_broken",
		writeLeaseExpiresAt: 4_102_444_800_000,
		writeLeaseDurationMinutes: 30,
		dirtyStatePolicy: "require_clean_worktree",
		expectedOutputs: ["read-only reproduction packet"],
		allowedTouchTargets: [".sbs/runs/<workflow-run-id>/**"],
		disallowedTouchTargets: ["runtime app code"],
		proofCommands: ["git status --short", "git diff --name-only"],
		syncPolicySummary: "Only structured proof metadata syncs.",
		stopConditions: ["worktree dirty before reproduction"],
		rollbackNotes: "No source files are patched in this phase.",
		localWorkflowPacketRef:
			".sbs/runs/workflowRuns_broken/workflow-packet.json",
		localProofRef: ".sbs/runs/workflowRuns_broken/proof.json",
		...overrides,
	};
}

async function createRepositoryWithPackageScript(script: string) {
	const repositoryRoot = await createTemporaryDirectory("sbs-broken-app-");
	await initializeGitRepository(repositoryRoot);
	await writeFile(
		path.join(repositoryRoot, "package.json"),
		`${JSON.stringify({ scripts: { test: script } }, null, 2)}\n`,
	);
	await execFileAsync("git", ["add", "package.json"], {
		cwd: repositoryRoot,
	});
	await execFileAsync("git", ["commit", "-m", "Initial commit"], {
		cwd: repositoryRoot,
	});
	return repositoryRoot;
}

describe("broken-app triage workflow", () => {
	it("runs only read-only diagnostics and writes proof without patching source files", async () => {
		const repositoryRoot = await createRepositoryWithPackageScript("exit 1");
		const sentEvents: unknown[] = [];

		const result = await runBrokenAppTriageWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmReadOnlyReproduction: true,
			now: 1_000,
			fetchRunnerEvent: async (_url, init) => {
				sentEvents.push(JSON.parse(String(init?.body)));
				return new Response(null, { status: 200 });
			},
		});
		const branch = (
			await execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
				cwd: repositoryRoot,
			})
		).stdout.trim();
		const proof = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_broken",
					"proof.json",
				),
				"utf8",
			),
		);

		expect(result).toMatchObject({
			status: "proof_completed",
			proofStatus: "failed",
			touchedFiles: [],
		});
		expect(branch).not.toBe("sbs/broken-app-triage-20260504-2100");
		expect(proof).toMatchObject({
			reproductionStatus: "not_reproduced",
			patchApprovalRequired: true,
			touchedFiles: [],
		});
		expect(sentEvents).toEqual([
			expect.objectContaining({
				eventType: "workflow.started",
				workflowRunId: "workflowRuns_broken",
			}),
			expect.objectContaining({
				eventType: "workflow.proof.completed",
				workflowRunId: "workflowRuns_broken",
			}),
		]);
		expect(JSON.stringify(sentEvents)).not.toContain(repositoryRoot);
		expect(JSON.stringify(sentEvents)).not.toContain("sbs_run_secret");
	});

	it("blocks before reproduction when no approved command is runnable", async () => {
		const repositoryRoot = await createRepositoryWithPackageScript("exit 1");
		const sentEvents: unknown[] = [];

		const result = await runBrokenAppTriageWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				proofCommands: ["manual reproduction only"],
			}),
			confirmReadOnlyReproduction: true,
			fetchRunnerEvent: async (_url, init) => {
				sentEvents.push(JSON.parse(String(init?.body)));
				return new Response(null, { status: 200 });
			},
		});

		expect(result).toMatchObject({
			status: "blocked",
			proofStatus: "blocked",
			blockedReason:
				"No approved read-only diagnostic command was available to run.",
		});
		expect(sentEvents).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					eventType: "workflow.blocked",
					workflowRunId: "workflowRuns_broken",
				}),
			]),
		);
	});

	it("blocks package scripts without executing them", async () => {
		const repositoryRoot = await createRepositoryWithPackageScript(
			"node -e \"require('fs').writeFileSync('MUTATED.txt', 'mutated')\"",
		);

		const result = await runBrokenAppTriageWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				proofCommands: ["package script: test"],
			}),
			confirmReadOnlyReproduction: true,
			fetchRunnerEvent: async () => new Response(null, { status: 200 }),
		});

		expect(result.status).toBe("blocked");
		expect(existsSync(path.join(repositoryRoot, "MUTATED.txt"))).toBe(false);
	});
});
