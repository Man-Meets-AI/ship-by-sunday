import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type { RunnerCredential } from "../src/core/local-runner-home";
import type { LocalProjectState } from "../src/core/local-project-state";
import { runMatureRepoAdoptionWorkflow } from "../src/core/mature-repo-adoption-workflow";
import type { ApprovedWorkflowRunPacket } from "../src/core/workflow-run-api";
import {
	createTemporaryDirectory,
	initializeGitRepository,
} from "./test-utils";

const execFileAsync = promisify(execFile);
const expectedOutputs = [
	"mature repo adoption workflow packet",
	"sync-safe repo convention audit",
	"adoption Program packet draft",
	"first child ExecPlan draft",
	"local proof or blocked-proof summary",
];
const allowedTouchTargets = [
	".sbs/runs/<workflow-run-id>/**",
	".sbs/mature-repo/**",
	"repo convention metadata only",
];
const disallowedTouchTargets = [
	"runtime app code",
	"environment files",
	"dependency manifests",
	"dependency locks",
	"database migrations",
	"provider configuration",
	"generated folders",
	"package scripts",
	"root agent instructions",
	"CI configuration",
	"CI-affecting commands",
	"branch pushes",
	"pull requests",
	"raw logs",
	"raw source",
	"Codex transcripts",
];
const proofCommands = [
	"git status --short",
	"git diff --name-only",
	"git diff --check",
];
const syncPolicySummary =
	"Only approved structured workflow metadata, proof status, command names, artifact names, and repo-relative refs sync. Local code, command output, and Codex session history stay on the machine.";
const stopConditions = [
	"worktree is dirty before branch creation",
	"write lease expires before adoption audit starts",
	"requested work needs generated-starter rewrites, provider setup, package installs, migrations, CI, PRs, branch pushes, raw source, raw logs, or Codex transcripts",
	"proof command fails",
];
const rollbackNotes =
	"Keep the branch local by default. Roll back with git switch back to the base branch and git branch -D the mature adoption branch after reviewing local proof.";
const providerAccessPolicy =
	"Provider access is disabled. Missing provider setup, dashboard access, dependency installs, migrations, CI changes, branch pushes, and pull requests require a later explicit workflow packet.";
const proofDelivery =
	"Proof stays local under .sbs/runs/<workflow-run-id>/** and .sbs/mature-repo/**. Hosted sync receives only sync-safe proof metadata and artifact refs.";
const revocationBehavior =
	"Runner revocation, write lease expiry, dirty worktree, unsafe branch state, or work needing wider authority stops execution and writes blocked proof instead of escalating permissions.";

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
		workflowRunId: "workflowRuns_mature",
		workflowId: "mature-repo-adoption",
		workflowVersion: "v1",
		branchName: "sbs/mature-repo-adoption-20260505-1100",
		profileName: "sbs-workspace-write",
		writeLeaseId: "lease_workflowRuns_mature",
		writeLeaseExpiresAt: 4_102_444_800_000,
		writeLeaseDurationMinutes: 30,
		dirtyStatePolicy: "require_clean_worktree",
		expectedOutputs,
		allowedTouchTargets,
		disallowedTouchTargets,
		proofCommands,
		syncPolicySummary,
		stopConditions,
		rollbackNotes,
		localWorkflowPacketRef:
			".sbs/runs/workflowRuns_mature/workflow-packet.json",
		localProofRef: ".sbs/runs/workflowRuns_mature/proof.json",
		...overrides,
	};
}

async function createMatureRepository() {
	const repositoryRoot = await createTemporaryDirectory("sbs-mature-repo-");
	await initializeGitRepository(repositoryRoot);
	await mkdir(path.join(repositoryRoot, "docs"), { recursive: true });
	await mkdir(path.join(repositoryRoot, ".github", "workflows"), {
		recursive: true,
	});
	await writeFile(
		path.join(repositoryRoot, "package.json"),
		`${JSON.stringify(
			{
				scripts: { lint: "eslint .", test: "vitest run" },
				dependencies: { next: "latest" },
				devDependencies: { vitest: "latest" },
			},
			null,
			2,
		)}\n`,
	);
	await writeFile(path.join(repositoryRoot, "AGENTS.md"), "# Agents\n");
	await writeFile(path.join(repositoryRoot, "docs", "ARCHITECTURE.md"), "# Arch\n");
	await writeFile(
		path.join(repositoryRoot, ".github", "workflows", "ci.yml"),
		"name: ci\n",
	);
	await execFileAsync("git", ["add", "."], { cwd: repositoryRoot });
	await execFileAsync("git", ["commit", "-m", "Initial commit"], {
		cwd: repositoryRoot,
	});
	return repositoryRoot;
}

describe("mature repo adoption workflow", () => {
	it("creates a local branch and writes sync-safe adoption proof", async () => {
		const repositoryRoot = await createMatureRepository();
		const sentEvents: unknown[] = [];

		const result = await runMatureRepoAdoptionWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmAdoptionAudit: true,
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
		const audit = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"mature-repo",
					"adoption-audit.json",
				),
				"utf8",
			),
		);
		const proof = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_mature",
					"proof.json",
				),
				"utf8",
			),
		);
		const workflowPacket = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_mature",
					"workflow-packet.json",
				),
				"utf8",
			),
		);
		const program = await readFile(
			path.join(repositoryRoot, ".sbs", "mature-repo", "adoption-program.md"),
			"utf8",
		);

		expect(result).toMatchObject({
			status: "proof_completed",
			workflowId: "mature-repo-adoption",
			branchName: "sbs/mature-repo-adoption-20260505-1100",
			proofStatus: "passed",
		});
		expect(branch).toBe("sbs/mature-repo-adoption-20260505-1100");
		expect(audit.repositoryShape.packageManager).toBe("unknown-node");
		expect(audit.repositoryShape.packageScripts).toEqual(["lint", "test"]);
		expect(audit.sourceTruth.agentInstructionRefs).toEqual(["AGENTS.md"]);
		expect(audit.sourceTruth.ciRefs).toEqual([".github/workflows/ci.yml"]);
		expect(proof.createdArtifacts).toEqual(
			expect.arrayContaining([
				".sbs/mature-repo/adoption-audit.json",
				".sbs/mature-repo/adoption-program.md",
				".sbs/mature-repo/first-execplan.md",
			]),
		);
		expect(workflowPacket).toMatchObject({
			executionSurface: "local_runner",
			allowedTouchTargets,
			disallowedTouchTargets,
			providerAccessPolicy,
			proofCommands,
			syncPolicy: syncPolicySummary,
			stopConditions,
			expectedOutputs,
			rollbackNotes,
			proofDelivery,
			revocationBehavior,
		});
		expect(program).toContain("Mature Repo Adoption Program");
		expect(program).toContain("Package manager: unknown-node");
		expect(JSON.stringify(audit).toLowerCase()).not.toContain("secret");
		expect(JSON.stringify(proof).toLowerCase()).not.toContain("raw source");
		expect(sentEvents).toHaveLength(2);
	});

	it("blocks without terminal adoption confirmation", async () => {
		const repositoryRoot = await createMatureRepository();
		const sentEvents: unknown[] = [];

		const result = await runMatureRepoAdoptionWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_blocked",
			}),
			confirmAdoptionAudit: false,
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
					"workflowRuns_blocked",
					"proof.json",
				),
				"utf8",
			),
		);

		expect(result).toMatchObject({
			status: "blocked",
			proofStatus: "blocked",
			blockedReason:
				"mature-repo-adoption requires --confirm-adoption-audit because it creates a local branch and .sbs adoption proof.",
		});
		expect(
			existsSync(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_blocked",
					"proof.json",
				),
			),
		).toBe(true);
		expect(proof.blockedProof).toEqual([
			expect.objectContaining({
				stage: "terminal-confirmation",
				nextApprovalRequired: true,
			}),
		]);
		expect(sentEvents).toEqual([
			expect.objectContaining({
				payload: expect.objectContaining({
					eventType: "workflow.blocked",
					blockedStage: "terminal-confirmation",
				}),
			}),
		]);
	});

	it("fails proof when a post-checkout hook mutates runtime files", async () => {
		const repositoryRoot = await createMatureRepository();
		const hookPath = path.join(repositoryRoot, ".git", "hooks", "post-checkout");
		await writeFile(
			hookPath,
			[
				"#!/bin/sh",
				"mkdir -p src",
				"printf 'export const unsafe = true;\\n' > src/runtime.ts",
				"",
			].join("\n"),
		);
		await chmod(hookPath, 0o755);

		const result = await runMatureRepoAdoptionWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_dirty_after_checkout",
				branchName: "sbs/mature-repo-adoption-20260505-1115",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_dirty_after_checkout/workflow-packet.json",
				localProofRef:
					".sbs/runs/workflowRuns_dirty_after_checkout/proof.json",
			}),
			confirmAdoptionAudit: true,
			fetchRunnerEvent: async () => new Response(null, { status: 200 }),
		});
		const proof = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_dirty_after_checkout",
					"proof.json",
				),
				"utf8",
			),
		);

		expect(result).toMatchObject({
			status: "proof_completed",
			proofStatus: "failed",
			touchedFiles: ["src/runtime.ts"],
		});
		expect(proof.touchedFiles).toEqual(["src/runtime.ts"]);
		expect(proof.proofCommandResults).toContainEqual(
			expect.objectContaining({
				commandName: "git status --short",
				status: "failed",
			}),
		);
	});

	it("blocks when the approved packet drifts from the mature adoption contract", async () => {
		const repositoryRoot = await createMatureRepository();

		const result = await runMatureRepoAdoptionWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_drift",
				disallowedTouchTargets: ["runtime app code"],
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_drift/workflow-packet.json",
				localProofRef: ".sbs/runs/workflowRuns_drift/proof.json",
			}),
			confirmAdoptionAudit: true,
			fetchRunnerEvent: async () => new Response(null, { status: 200 }),
		});

		expect(result).toMatchObject({
			status: "blocked",
			proofStatus: "blocked",
			blockedReason:
				"Mature repo adoption disallowed touch targets are not approved.",
		});
	});
});
