import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type { RunnerCredential } from "../src/core/local-runner-home";
import type { LocalProjectState } from "../src/core/local-project-state";
import { runSourceTruthWorkflow } from "../src/core/source-truth-workflow";
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
		workflowRunId: "workflowRuns_1",
		workflowId: "source-truth-agent-readiness",
		workflowVersion: "v1",
		branchName: "sbs/source-truth-readiness-20260504-2100",
		profileName: "sbs-workspace-write",
		writeLeaseId: "lease_workflowRuns_1",
		writeLeaseExpiresAt: 4_102_444_800_000,
		writeLeaseDurationMinutes: 30,
		dirtyStatePolicy: "require_clean_worktree",
		expectedOutputs: ["source-truth workflow packet"],
		allowedTouchTargets: ["AGENTS.md", ".sbs/runs/<workflow-run-id>/**"],
		disallowedTouchTargets: ["runtime app code"],
		proofCommands: ["git status --short", "git diff --check"],
		syncPolicySummary: "Only structured proof metadata syncs.",
		stopConditions: ["worktree dirty before writes"],
		rollbackNotes: "Delete the local source-truth branch after review.",
		localWorkflowPacketRef: ".sbs/runs/workflowRuns_1/workflow-packet.json",
		localProofRef: ".sbs/runs/workflowRuns_1/proof.json",
		...overrides,
	};
}

async function createCleanRepository() {
	const repositoryRoot = await createTemporaryDirectory("sbs-source-truth-");
	await initializeGitRepository(repositoryRoot);
	await writeFile(
		path.join(repositoryRoot, "package.json"),
		`${JSON.stringify({ scripts: { typecheck: "tsc --noEmit" } }, null, 2)}\n`,
	);
	await execFileAsync("git", ["add", "package.json"], {
		cwd: repositoryRoot,
	});
	await execFileAsync("git", ["commit", "-m", "Initial commit"], {
		cwd: repositoryRoot,
	});
	return repositoryRoot;
}

describe("source-truth workflow", () => {
	it("creates a branch, local proof artifacts, and sync-safe workflow events", async () => {
		const repositoryRoot = await createCleanRepository();
		const sentEvents: unknown[] = [];

		const result = await runSourceTruthWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmLocalWrites: true,
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
		const agentsContents = await readFile(
			path.join(repositoryRoot, "AGENTS.md"),
			"utf8",
		);
		const proof = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_1",
					"proof.json",
				),
				"utf8",
			),
		);

		expect(result).toMatchObject({
			status: "proof_completed",
			proofStatus: "passed",
			branchName: "sbs/source-truth-readiness-20260504-2100",
			deliveredEvents: 2,
			remainingEvents: 0,
		});
		expect(branch).toBe("sbs/source-truth-readiness-20260504-2100");
		expect(agentsContents).toContain("Ship by Sunday Source Truth");
		expect(proof.touchedFiles).toEqual(["AGENTS.md"]);
		expect(proof.createdArtifacts).toContain(
			".sbs/runs/workflowRuns_1/workflow-packet.json",
		);
		expect(sentEvents).toHaveLength(2);
		expect(sentEvents).toEqual([
			expect.objectContaining({
				eventType: "workflow.started",
				workflowRunId: "workflowRuns_1",
			}),
			expect.objectContaining({
				eventType: "workflow.proof.completed",
				workflowRunId: "workflowRuns_1",
			}),
		]);
		expect(JSON.stringify(sentEvents)).not.toContain(repositoryRoot);
		expect(JSON.stringify(sentEvents)).not.toContain("sbs_run_secret");
	});

	it("writes blocked proof and avoids branch creation when the worktree is dirty", async () => {
		const repositoryRoot = await createCleanRepository();
		await writeFile(
			path.join(repositoryRoot, "package.json"),
			`${JSON.stringify({ scripts: { test: "vitest" } }, null, 2)}\n`,
		);
		const sentEvents: unknown[] = [];

		const result = await runSourceTruthWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_blocked",
				branchName: "sbs/source-truth-readiness-20260504-2101",
				writeLeaseId: "lease_workflowRuns_blocked",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_blocked/workflow-packet.json",
				localProofRef: ".sbs/runs/workflowRuns_blocked/proof.json",
			}),
			confirmLocalWrites: true,
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
					"workflowRuns_blocked",
					"proof.json",
				),
				"utf8",
			),
		);

		expect(result).toMatchObject({
			status: "blocked",
			proofStatus: "blocked",
			deliveredEvents: 1,
		});
		expect(branch).not.toBe("sbs/source-truth-readiness-20260504-2101");
		expect(proof.blockedProof.reason).toContain("Worktree is dirty");
		expect(sentEvents).toEqual([
			expect.objectContaining({
				eventType: "workflow.blocked",
				workflowRunId: "workflowRuns_blocked",
			}),
		]);
	});

	it("blocks expired leases before local writes start", async () => {
		const repositoryRoot = await createCleanRepository();
		const sentEvents: unknown[] = [];

		const result = await runSourceTruthWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				writeLeaseExpiresAt: 999,
			}),
			confirmLocalWrites: true,
			now: 1_000,
			fetchRunnerEvent: async (_url, init) => {
				sentEvents.push(JSON.parse(String(init?.body)));
				return new Response(null, { status: 200 });
			},
		});

		const proof = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_1",
					"proof.json",
				),
				"utf8",
			),
		);
		expect(result).toMatchObject({
			status: "blocked",
			proofStatus: "blocked",
			blockedReason:
				"Approved write lease expired before local writes started.",
		});
		expect(proof.blockedProof.stage).toBe("write-lease");
		expect(sentEvents).toEqual([
			expect.objectContaining({
				eventType: "workflow.blocked",
				workflowRunId: "workflowRuns_1",
			}),
		]);
	});

	it("blocks existing approved branch reuse from another branch", async () => {
		const repositoryRoot = await createCleanRepository();
		const baseBranch = (
			await execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
				cwd: repositoryRoot,
			})
		).stdout.trim();
		await execFileAsync(
			"git",
			["checkout", "-b", "sbs/source-truth-readiness-20260504-2100"],
			{ cwd: repositoryRoot },
		);
		await writeFile(
			path.join(repositoryRoot, "runtime.ts"),
			"export const x = 1;\n",
		);
		await execFileAsync("git", ["add", "runtime.ts"], { cwd: repositoryRoot });
		await execFileAsync("git", ["commit", "-m", "Existing runtime change"], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["checkout", baseBranch], {
			cwd: repositoryRoot,
		});

		const result = await runSourceTruthWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmLocalWrites: true,
			now: 1_000,
			fetchRunnerEvent: async () => new Response(null, { status: 200 }),
		});

		expect(result).toMatchObject({
			status: "blocked",
			proofStatus: "blocked",
		});
		expect(result.blockedReason).toContain("branch already exists");
	});

	it("does not edit git exclude when a dirty worktree blocks the workflow", async () => {
		const repositoryRoot = await createCleanRepository();
		const gitExcludePath = path.join(repositoryRoot, ".git", "info", "exclude");
		await writeFile(gitExcludePath, "# local excludes\n");
		await writeFile(path.join(repositoryRoot, "package.json"), "{}\n");

		await runSourceTruthWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_dirty_exclude",
				branchName: "sbs/source-truth-readiness-20260504-2102",
				writeLeaseId: "lease_workflowRuns_dirty_exclude",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_dirty_exclude/workflow-packet.json",
				localProofRef: ".sbs/runs/workflowRuns_dirty_exclude/proof.json",
			}),
			confirmLocalWrites: true,
			fetchRunnerEvent: async () => new Response(null, { status: 200 }),
		});

		await expect(readFile(gitExcludePath, "utf8")).resolves.toBe(
			"# local excludes\n",
		);
	});
});
