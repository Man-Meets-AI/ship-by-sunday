import { execFile } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type { RunnerCredential } from "../src/core/local-runner-home";
import type { LocalProjectState } from "../src/core/local-project-state";
import { runObservabilityDebuggabilityWorkflow } from "../src/core/observability-debuggability-workflow";
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
		workflowRunId: "workflowRuns_observability",
		workflowId: "observability-debuggability",
		workflowVersion: "v1",
		branchName: "sbs/observability-debuggability-20260505-1000",
		profileName: "sbs-workspace-write",
		writeLeaseId: "lease_workflowRuns_observability",
		writeLeaseExpiresAt: 4_102_444_800_000,
		writeLeaseDurationMinutes: 30,
		dirtyStatePolicy: "require_clean_worktree",
		expectedOutputs: ["observability workflow packet"],
		allowedTouchTargets: [
			".sbs/runs/<workflow-run-id>/**",
			".sbs/observability/**",
		],
		disallowedTouchTargets: ["runtime app code"],
		proofCommands: [
			"git status --short",
			"git diff --name-only",
			"git diff --check",
		],
		syncPolicySummary: "Only structured proof metadata syncs.",
		stopConditions: ["worktree dirty before observability audit"],
		rollbackNotes: "Delete the local observability branch after review.",
		localWorkflowPacketRef:
			".sbs/runs/workflowRuns_observability/workflow-packet.json",
		localProofRef: ".sbs/runs/workflowRuns_observability/proof.json",
		...overrides,
	};
}

async function createRepositoryWithObservabilitySignals() {
	const repositoryRoot = await createTemporaryDirectory("sbs-observability-");
	await initializeGitRepository(repositoryRoot);
	await mkdir(path.join(repositoryRoot, "app", "api", "observability"), {
		recursive: true,
	});
	await mkdir(path.join(repositoryRoot, "lib"), { recursive: true });
	await writeFile(
		path.join(repositoryRoot, "package.json"),
		`${JSON.stringify(
			{
				dependencies: { "posthog-js": "latest" },
				scripts: { "observability:export": "node scripts/export.js" },
			},
			null,
			2,
		)}\n`,
	);
	await writeFile(
		path.join(repositoryRoot, "app", "api", "observability", "route.ts"),
		"export const provider = 'posthog';\n",
	);
	await writeFile(
		path.join(repositoryRoot, "lib", "logger.ts"),
		"const secretSample = 'SECRET_TOKEN_VALUE';\nexport const logger = console;\n",
	);
	await execFileAsync("git", ["add", "package.json", "app", "lib"], {
		cwd: repositoryRoot,
	});
	await execFileAsync("git", ["commit", "-m", "Initial commit"], {
		cwd: repositoryRoot,
	});
	return repositoryRoot;
}

describe("observability debuggability workflow", () => {
	it("creates a branch and writes sync-safe local audit proof", async () => {
		const repositoryRoot = await createRepositoryWithObservabilitySignals();
		const sentEvents: unknown[] = [];

		const result = await runObservabilityDebuggabilityWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmObservabilityAudit: true,
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
					"observability",
					"debuggability-audit.json",
				),
				"utf8",
			),
		);
		const proofContents = await readFile(
			path.join(
				repositoryRoot,
				".sbs",
				"runs",
				"workflowRuns_observability",
				"proof.json",
			),
			"utf8",
		);
		const proof = JSON.parse(proofContents);

		expect(result).toMatchObject({
			status: "proof_completed",
			proofStatus: "passed",
			branchName: "sbs/observability-debuggability-20260505-1000",
			touchedFiles: [],
			deliveredEvents: 2,
			remainingEvents: 0,
		});
		expect(branch).toBe("sbs/observability-debuggability-20260505-1000");
		expect(audit.signals).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					kind: "package_dependency",
					label: "posthog",
					repoRelativePath: "package.json",
				}),
				expect.objectContaining({
					kind: "file",
					repoRelativePath: "app/api/observability/route.ts",
				}),
			]),
		);
		expect(proof.createdArtifacts).toContain(
			".sbs/observability/debuggability-audit.json",
		);
		expect(proof.blockedProof).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					capabilityId: "dashboard_access",
					nextApprovalRequired: true,
				}),
			]),
		);
		expect(proofContents).not.toContain("SECRET_TOKEN_VALUE");
		expect(JSON.stringify(sentEvents)).not.toContain(repositoryRoot);
		expect(JSON.stringify(sentEvents)).not.toContain("sbs_run_secret");
	});

	it("writes blocked proof and avoids branch creation when the worktree is dirty", async () => {
		const repositoryRoot = await createRepositoryWithObservabilitySignals();
		await writeFile(path.join(repositoryRoot, "runtime.ts"), "export {};\n");
		const sentEvents: unknown[] = [];

		const result = await runObservabilityDebuggabilityWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_observability_blocked",
				branchName: "sbs/observability-debuggability-20260505-1001",
				writeLeaseId: "lease_workflowRuns_observability_blocked",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_observability_blocked/workflow-packet.json",
				localProofRef:
					".sbs/runs/workflowRuns_observability_blocked/proof.json",
			}),
			confirmObservabilityAudit: true,
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
					"workflowRuns_observability_blocked",
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
		expect(branch).not.toBe("sbs/observability-debuggability-20260505-1001");
		expect(proof.blockedProof[0].reason).toContain("Worktree is dirty");
		expect(sentEvents).toEqual([
			expect.objectContaining({
				eventType: "workflow.blocked",
				workflowRunId: "workflowRuns_observability_blocked",
			}),
		]);
	});

	it("writes blocked proof when terminal confirmation is missing", async () => {
		const repositoryRoot = await createRepositoryWithObservabilitySignals();
		const sentEvents: unknown[] = [];

		const result = await runObservabilityDebuggabilityWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_observability_no_confirm",
				branchName: "sbs/observability-debuggability-20260505-1002",
				writeLeaseId: "lease_workflowRuns_observability_no_confirm",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_observability_no_confirm/workflow-packet.json",
				localProofRef:
					".sbs/runs/workflowRuns_observability_no_confirm/proof.json",
			}),
			confirmObservabilityAudit: false,
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
					"workflowRuns_observability_no_confirm",
					"proof.json",
				),
				"utf8",
			),
		);

		expect(result).toMatchObject({
			status: "blocked",
			proofStatus: "blocked",
			blockedReason: expect.stringContaining("--confirm-observability-audit"),
		});
		expect(branch).not.toBe("sbs/observability-debuggability-20260505-1002");
		expect(proof.blockedProof[0]).toMatchObject({
			stage: "terminal-confirmation",
		});
		expect(sentEvents).toEqual([
			expect.objectContaining({
				eventType: "workflow.blocked",
				workflowRunId: "workflowRuns_observability_no_confirm",
			}),
		]);
	});

	it("writes blocked proof when approval metadata uses an unsafe profile", async () => {
		const repositoryRoot = await createRepositoryWithObservabilitySignals();

		const result = await runObservabilityDebuggabilityWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_observability_bad_profile",
				branchName: "sbs/observability-debuggability-20260505-1003",
				profileName: "sbs-workspace-write; gh pr create",
				writeLeaseId: "lease_workflowRuns_observability_bad_profile",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_observability_bad_profile/workflow-packet.json",
				localProofRef:
					".sbs/runs/workflowRuns_observability_bad_profile/proof.json",
			}),
			confirmObservabilityAudit: true,
			fetchRunnerEvent: async () => new Response(null, { status: 200 }),
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
					"workflowRuns_observability_bad_profile",
					"proof.json",
				),
				"utf8",
			),
		);

		expect(result).toMatchObject({
			status: "blocked",
			proofStatus: "blocked",
			blockedReason:
				"profileName must match the approved SBS workspace profile.",
		});
		expect(branch).not.toBe("sbs/observability-debuggability-20260505-1003");
		expect(proof.blockedProof[0]).toMatchObject({
			stage: "approval-packet",
		});
	});

	it("writes blocked proof when package metadata cannot be parsed", async () => {
		const repositoryRoot = await createRepositoryWithObservabilitySignals();
		await writeFile(path.join(repositoryRoot, "package.json"), "{ invalid\n");
		await execFileAsync("git", ["add", "package.json"], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["commit", "-m", "Break package metadata"], {
			cwd: repositoryRoot,
		});

		const result = await runObservabilityDebuggabilityWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_observability_bad_package",
				branchName: "sbs/observability-debuggability-20260505-1004",
				writeLeaseId: "lease_workflowRuns_observability_bad_package",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_observability_bad_package/workflow-packet.json",
				localProofRef:
					".sbs/runs/workflowRuns_observability_bad_package/proof.json",
			}),
			confirmObservabilityAudit: true,
			fetchRunnerEvent: async () => new Response(null, { status: 200 }),
		});
		const proof = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_observability_bad_package",
					"proof.json",
				),
				"utf8",
			),
		);

		expect(result).toMatchObject({
			status: "blocked",
			proofStatus: "blocked",
		});
		expect(proof.blockedProof[0]).toMatchObject({
			stage: "audit-scan",
		});
	});
});
