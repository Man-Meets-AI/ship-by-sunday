import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type { RunnerCredential } from "../src/core/local-runner-home";
import type { LocalProjectState } from "../src/core/local-project-state";
import { runDocsOperatingSystemAdoptionWorkflow } from "../src/core/docs-operating-system-adoption-workflow";
import type { ApprovedWorkflowRunPacket } from "../src/core/workflow-run-api";
import {
	DOCS_OPERATING_SYSTEM_ADOPTION_ALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_ADOPTION_DISALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_ADOPTION_EXPECTED_OUTPUTS,
	DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
	DOCS_OPERATING_SYSTEM_ADOPTION_PROOF_COMMANDS,
	DOCS_OPERATING_SYSTEM_ADOPTION_ROLLBACK_NOTES,
	DOCS_OPERATING_SYSTEM_ADOPTION_STOP_CONDITIONS,
	DOCS_OPERATING_SYSTEM_ADOPTION_SYNC_POLICY_SUMMARY,
} from "../src/workflows/docs-operating-system-adoption/manifest";
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
		workflowRunId: "workflowRuns_docs_os",
		workflowId: "docs-operating-system-adoption",
		workflowVersion: "v1",
		branchName: "sbs/docs-operating-system-adoption-20260506-1400",
		profileName: "sbs-workspace-write",
		installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
		writeLeaseId: "lease_workflowRuns_docs_os",
		writeLeaseExpiresAt: 4_102_444_800_000,
		writeLeaseDurationMinutes: 30,
		dirtyStatePolicy: "require_clean_worktree",
		expectedOutputs: [...DOCS_OPERATING_SYSTEM_ADOPTION_EXPECTED_OUTPUTS],
		allowedTouchTargets: [
			...DOCS_OPERATING_SYSTEM_ADOPTION_ALLOWED_TOUCH_TARGETS,
		],
		disallowedTouchTargets: [
			...DOCS_OPERATING_SYSTEM_ADOPTION_DISALLOWED_TOUCH_TARGETS,
		],
		proofCommands: [...DOCS_OPERATING_SYSTEM_ADOPTION_PROOF_COMMANDS],
		syncPolicySummary: DOCS_OPERATING_SYSTEM_ADOPTION_SYNC_POLICY_SUMMARY,
		stopConditions: [...DOCS_OPERATING_SYSTEM_ADOPTION_STOP_CONDITIONS],
		rollbackNotes: DOCS_OPERATING_SYSTEM_ADOPTION_ROLLBACK_NOTES,
		localWorkflowPacketRef:
			".sbs/runs/workflowRuns_docs_os/workflow-packet.json",
		localProofRef: ".sbs/runs/workflowRuns_docs_os/proof.json",
		...overrides,
	};
}

async function createDocsOperatingSystemRepository({
	scripts = {
		lint: "echo SECRET_SCRIPT_BODY_SHOULD_NOT_SYNC",
	},
}: {
	scripts?: Record<string, string>;
} = {}) {
	const repositoryRoot = await createTemporaryDirectory("sbs-docs-os-");
	await initializeGitRepository(repositoryRoot);
	await mkdir(path.join(repositoryRoot, "docs", "programs"), {
		recursive: true,
	});
	await mkdir(path.join(repositoryRoot, "docs", "exec-plans"), {
		recursive: true,
	});
	await mkdir(path.join(repositoryRoot, "docs", "prompts"), {
		recursive: true,
	});
	await mkdir(path.join(repositoryRoot, ".github", "workflows"), {
		recursive: true,
	});
	const packageManifest = {
		name: "customer-repo",
		scripts,
		workspaces: ["packages/*"],
		devDependencies: {
			vitest: "1.0.0",
		},
	};
	await writeFile(
		path.join(repositoryRoot, "package.json"),
		`${JSON.stringify(packageManifest, null, 2)}\n`,
	);
	await writeFile(path.join(repositoryRoot, "bun.lock"), "");
	await writeFile(path.join(repositoryRoot, "README.md"), "# Customer Repo\n");
	await writeFile(
		path.join(repositoryRoot, "AGENTS.md"),
		"# Agent Instructions\n",
	);
	await writeFile(path.join(repositoryRoot, "docs", "index.md"), "# Docs\n");
	await writeFile(
		path.join(repositoryRoot, "docs", "programs", "PROGRAMS.md"),
		"# Programs\n",
	);
	await writeFile(
		path.join(repositoryRoot, "docs", "exec-plans", "PLANS.md"),
		"# Plans\n",
	);
	await writeFile(
		path.join(repositoryRoot, "docs", "prompts", "README.md"),
		"# Prompts\n",
	);
	await writeFile(
		path.join(repositoryRoot, ".github", "workflows", "ci.yml"),
		"name: ci\n",
	);
	await execFileAsync("git", ["add", "."], { cwd: repositoryRoot });
	await execFileAsync("git", ["commit", "-m", "initial"], {
		cwd: repositoryRoot,
	});
	return {
		repositoryRoot,
		packageManifestBefore: `${JSON.stringify(packageManifest, null, 2)}\n`,
	};
}

async function readJsonArtifact<T>(
	repositoryRoot: string,
	artifactRef: string,
) {
	return JSON.parse(
		await readFile(path.join(repositoryRoot, artifactRef), "utf8"),
	) as T;
}

const successfulEventFetch = async () => new Response(null, { status: 204 });

describe("docs operating system adoption workflow", () => {
	it("blocks without both explicit dry-run confirmations", async () => {
		const { repositoryRoot } = await createDocsOperatingSystemRepository();
		const result = await runDocsOperatingSystemAdoptionWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_docs_os_blocked",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_docs_os_blocked/workflow-packet.json",
				localProofRef: ".sbs/runs/workflowRuns_docs_os_blocked/proof.json",
			}),
			confirmDocsOperatingSystemScan: false,
			confirmDocsOperatingSystemToolingPlan: true,
			fetchRunnerEvent: successfulEventFetch,
		});

		expect(result.status).toBe("blocked");
		expect(result.proofStatus).toBe("blocked");
		expect(result.blockedReason).toContain(
			"--confirm-docs-operating-system-scan",
		);
		const proof = await readJsonArtifact<{
			blockedProof: Array<{ stage: string; reason: string }>;
		}>(repositoryRoot, ".sbs/runs/workflowRuns_docs_os_blocked/proof.json");
		expect(proof.blockedProof[0]).toEqual(
			expect.objectContaining({
				stage: "terminal-confirmation",
			}),
		);
	});

	it("blocks before dry-run writes when any file is already dirty", async () => {
		const { repositoryRoot } = await createDocsOperatingSystemRepository();
		await writeFile(
			path.join(repositoryRoot, "package.json"),
			'{"name":"customer-repo","scripts":{"lint":"echo dirty"}}\n',
		);

		const result = await runDocsOperatingSystemAdoptionWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_docs_os_dirty",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_docs_os_dirty/workflow-packet.json",
				localProofRef: ".sbs/runs/workflowRuns_docs_os_dirty/proof.json",
			}),
			confirmDocsOperatingSystemScan: true,
			confirmDocsOperatingSystemToolingPlan: true,
			fetchRunnerEvent: successfulEventFetch,
		});

		expect(result.status).toBe("blocked");
		expect(result.proofStatus).toBe("blocked");
		expect(result.blockedReason).toBe(
			"Worktree must be clean before docs operating system dry-run writes.",
		);
		const proof = await readJsonArtifact<{
			blockedProof: Array<{ stage: string; reason: string }>;
		}>(repositoryRoot, ".sbs/runs/workflowRuns_docs_os_dirty/proof.json");
		expect(proof.blockedProof[0]).toEqual(
			expect.objectContaining({
				stage: "dirty-state",
				reason:
					"Worktree must be clean before docs operating system dry-run writes.",
			}),
		);
	});

	it("writes only approved dry-run artifacts and leaves package.json unchanged", async () => {
		const { repositoryRoot, packageManifestBefore } =
			await createDocsOperatingSystemRepository();
		const result = await runDocsOperatingSystemAdoptionWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsOperatingSystemScan: true,
			confirmDocsOperatingSystemToolingPlan: true,
			now: 1_777_777,
			fetchRunnerEvent: successfulEventFetch,
		});

		expect(result.status).toBe("proof_completed");
		expect(result.proofStatus).toBe("passed");
		expect(result.touchedFiles).toEqual([]);
		await expect(
			readFile(path.join(repositoryRoot, "package.json"), "utf8"),
		).resolves.toBe(packageManifestBefore);

		const installPlanRef =
			".sbs/docs-operating-system-adoption/tooling-plan/install-plan.json";
		const installPlan = await readJsonArtifact<{
			workflowId: string;
			installProfile: string;
			packageScriptOperations: Array<{
				scriptName: string;
				status: string;
			}>;
			validatorFileOperations: Array<{ status: string }>;
			privacyBoundary: Record<string, boolean>;
		}>(repositoryRoot, installPlanRef);
		expect(installPlan).toMatchObject({
			workflowId: "docs-operating-system-adoption",
			installProfile: "worker-grade",
		});
		expect(
			installPlan.packageScriptOperations.every(
				(operation) => operation.status === "add",
			),
		).toBe(true);
		expect(
			installPlan.validatorFileOperations.every(
				(operation) => operation.status === "installable",
			),
		).toBe(true);
		expect(installPlan.privacyBoundary.packageScriptBodiesIncluded).toBe(false);
		expect(JSON.stringify(installPlan)).not.toContain(
			"SECRET_SCRIPT_BODY_SHOULD_NOT_SYNC",
		);

		const proof = await readJsonArtifact<{
			createdArtifacts: string[];
			proofCommandResults: Array<{ commandName: string; status: string }>;
			touchedFiles: string[];
		}>(repositoryRoot, ".sbs/runs/workflowRuns_docs_os/proof.json");
		expect(proof.createdArtifacts).toContain(installPlanRef);
		expect(proof.touchedFiles).toEqual([]);
		expect(proof.proofCommandResults).toEqual([
			{
				commandName: "git status --short",
				status: "passed",
				exitCodeSummary: "passed",
			},
			{
				commandName: "git diff --name-only",
				status: "passed",
				exitCodeSummary: "passed",
			},
			{
				commandName: "git diff --check",
				status: "passed",
				exitCodeSummary: "passed",
			},
		]);
	});

	it("records same-name package script conflicts as blocked proof without failing the dry run", async () => {
		const { repositoryRoot } = await createDocsOperatingSystemRepository({
			scripts: {
				"docs:validate": "echo SECRET_CONFLICT_BODY",
			},
		});
		const result = await runDocsOperatingSystemAdoptionWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_docs_os_conflict",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_docs_os_conflict/workflow-packet.json",
				localProofRef: ".sbs/runs/workflowRuns_docs_os_conflict/proof.json",
			}),
			confirmDocsOperatingSystemScan: true,
			confirmDocsOperatingSystemToolingPlan: true,
			now: 1_777_888,
			fetchRunnerEvent: successfulEventFetch,
		});

		expect(result.status).toBe("proof_completed");
		expect(result.proofStatus).toBe("passed");

		const installPlan = await readJsonArtifact<{
			blockedOperations: Array<{ operationId: string; surface: string }>;
		}>(
			repositoryRoot,
			".sbs/docs-operating-system-adoption/tooling-plan/install-plan.json",
		);
		expect(installPlan.blockedOperations).toEqual([
			expect.objectContaining({
				operationId: "package-script:docs:validate",
				surface: "package-script",
			}),
		]);
		expect(JSON.stringify(installPlan)).not.toContain("SECRET_CONFLICT_BODY");

		const proof = await readJsonArtifact<{
			blockedProof: Array<{ stage: string }>;
		}>(repositoryRoot, ".sbs/runs/workflowRuns_docs_os_conflict/proof.json");
		expect(proof.blockedProof).toEqual([
			expect.objectContaining({
				stage: "package-script:docs:validate",
			}),
		]);
	});
});
