import { execFile } from "node:child_process";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type { RunnerCredential } from "../src/core/local-runner-home";
import type { LocalProjectState } from "../src/core/local-project-state";
import { runDocsOperatingSystemLockfileRefreshWorkflow } from "../src/core/docs-operating-system-lockfile-refresh-workflow";
import { runDocsOperatingSystemPackageScriptPatchingWorkflow } from "../src/core/docs-operating-system-package-script-patching-workflow";
import type { ApprovedWorkflowRunPacket } from "../src/core/workflow-run-api";
import { buildDocsOperatingSystemInstallPlan } from "../src/workflows/docs-operating-system-adoption/install-plan";
import {
	DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_DISALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_EXPECTED_OUTPUTS,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROOF_COMMANDS,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ROLLBACK_NOTES,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_STOP_CONDITIONS,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_SYNC_POLICY_SUMMARY,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_DISALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_EXPECTED_OUTPUTS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROOF_COMMANDS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ROLLBACK_NOTES,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_STOP_CONDITIONS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_SYNC_POLICY_SUMMARY,
} from "../src/workflows/docs-operating-system-adoption/manifest";
import type { DocsSpineRepoFacts } from "../src/workflows/docs-spine-adoption/schemas";
import {
	createTemporaryDirectory,
	initializeGitRepository,
} from "./test-utils";

const execFileAsync = promisify(execFile);
const installPlanRef =
	".sbs/docs-operating-system-adoption/tooling-plan/install-plan.json";
const applySummaryRef =
	".sbs/docs-operating-system-adoption/tooling-apply/package-script-patching.json";

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

function createApprovedPackageScriptPatchingRun(
	overrides: Partial<ApprovedWorkflowRunPacket> = {},
): ApprovedWorkflowRunPacket {
	return {
		workflowRunId: "workflowRuns_docs_os_package",
		workflowId: "docs-operating-system-package-script-patching",
		workflowVersion: "v1",
		branchName: "sbs/docs-operating-system-package-scripts-20260506-1500",
		profileName: "sbs-workspace-write",
		installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
		writeLeaseId: "lease_workflowRuns_docs_os_package",
		writeLeaseExpiresAt: 4_102_444_800_000,
		writeLeaseDurationMinutes: 30,
		dirtyStatePolicy: "require_clean_worktree",
		expectedOutputs: [
			...DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_EXPECTED_OUTPUTS,
		],
		allowedTouchTargets: [
			...DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ALLOWED_TOUCH_TARGETS,
		],
		disallowedTouchTargets: [
			...DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_DISALLOWED_TOUCH_TARGETS,
		],
		proofCommands: [
			...DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROOF_COMMANDS,
		],
		syncPolicySummary:
			DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_SYNC_POLICY_SUMMARY,
		stopConditions: [
			...DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_STOP_CONDITIONS,
		],
		rollbackNotes: DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ROLLBACK_NOTES,
		localWorkflowPacketRef:
			".sbs/runs/workflowRuns_docs_os_package/workflow-packet.json",
		localProofRef: ".sbs/runs/workflowRuns_docs_os_package/proof.json",
		...overrides,
	};
}

function createApprovedLockfileRefreshRun(
	overrides: Partial<ApprovedWorkflowRunPacket> = {},
): ApprovedWorkflowRunPacket {
	return {
		workflowRunId: "workflowRuns_docs_os_lockfile",
		workflowId: "docs-operating-system-lockfile-refresh",
		workflowVersion: "v1",
		branchName: "sbs/docs-operating-system-lockfile-refresh-20260506-1600",
		profileName: "sbs-workspace-write",
		installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
		writeLeaseId: "lease_workflowRuns_docs_os_lockfile",
		writeLeaseExpiresAt: 4_102_444_800_000,
		writeLeaseDurationMinutes: 30,
		dirtyStatePolicy: "require_clean_worktree",
		expectedOutputs: [
			...DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_EXPECTED_OUTPUTS,
		],
		allowedTouchTargets: [
			...DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ALLOWED_TOUCH_TARGETS,
		],
		disallowedTouchTargets: [
			...DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_DISALLOWED_TOUCH_TARGETS,
		],
		proofCommands: [...DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROOF_COMMANDS],
		syncPolicySummary:
			DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_SYNC_POLICY_SUMMARY,
		stopConditions: [...DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_STOP_CONDITIONS],
		rollbackNotes: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ROLLBACK_NOTES,
		localWorkflowPacketRef:
			".sbs/runs/workflowRuns_docs_os_lockfile/workflow-packet.json",
		localProofRef: ".sbs/runs/workflowRuns_docs_os_lockfile/proof.json",
		...overrides,
	};
}

function createRepoFacts(packageScripts: string[] = []): DocsSpineRepoFacts {
	return {
		schemaVersion: "docs-spine-repo-facts.v1",
		workflowId: "docs-spine-adoption",
		workflowVersion: "v1",
		repositoryShape: {
			packageManager: "bun",
			packageScripts,
			workspaceGlobs: [],
			workspacePackageRefs: [],
			dependencyNames: [],
		},
		instructionSurface: {
			agentInstructionRefs: [],
			assistantShimRefs: [],
			secondaryInstructionRefs: [],
			ignoredInstructionRefs: [],
			skillRefs: [],
		},
		docsSurface: {
			docsRefs: ["docs/index.md"],
			programRefs: ["docs/programs/PROGRAMS.md"],
			execPlanRefs: ["docs/exec-plans/PLANS.md"],
			promptRefs: ["docs/prompts/README.md"],
			specRefs: [],
			generatedRefs: [],
		},
		validationSurface: {
			validationRefs: [],
			ciRefs: [],
			releaseRefs: [],
		},
		blockedFacts: [],
		createdAt: 1,
	};
}

async function createPackagePatchRepository() {
	const repositoryRoot = await createTemporaryDirectory("sbs-docs-os-lock-");
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
	await writePackageJson(repositoryRoot, {
		name: "customer-repo",
		scripts: {},
		devDependencies: {
			vitest: "1.0.0",
		},
	});
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
	await execFileAsync("git", ["add", "."], { cwd: repositoryRoot });
	await execFileAsync("git", ["commit", "-m", "initial"], {
		cwd: repositoryRoot,
	});
	return repositoryRoot;
}

async function writePackageJson(
	repositoryRoot: string,
	packageJson: Record<string, unknown>,
) {
	await writeFile(
		path.join(repositoryRoot, "package.json"),
		`${JSON.stringify(packageJson, null, 2)}\n`,
	);
}

async function writeInstallPlan(repositoryRoot: string) {
	const rootPackageManifest = {
		name: "customer-repo",
		scripts: {},
	};
	const installPlan = buildDocsOperatingSystemInstallPlan({
		repoFacts: createRepoFacts([]),
		rootPackageManifest,
		trackedRepoRefs: [
			"docs/index.md",
			"docs/programs/PROGRAMS.md",
			"docs/exec-plans/PLANS.md",
			"docs/prompts/README.md",
			"package.json",
		],
		now: 10,
	});
	await mkdir(path.dirname(path.join(repositoryRoot, installPlanRef)), {
		recursive: true,
	});
	await writeFile(
		path.join(repositoryRoot, installPlanRef),
		`${JSON.stringify(installPlan, null, 2)}\n`,
	);
	return installPlan;
}

async function applyPackageScriptPatch(repositoryRoot: string) {
	const result = await runDocsOperatingSystemPackageScriptPatchingWorkflow({
		repositoryRoot,
		state: createState(),
		credential: createCredential(),
		approvedWorkflowRun: createApprovedPackageScriptPatchingRun(),
		confirmDocsOperatingSystemToolingApply: true,
		fetchRunnerEvent: successfulEventFetch,
	});
	expect(result.status).toBe("proof_completed");
	expect(result.proofStatus).toBe("passed");
}

async function createFakeBun({
	exitCode = 0,
	mutatePackageJson = false,
}: {
	exitCode?: number;
	mutatePackageJson?: boolean;
} = {}) {
	const binDirectory = await createTemporaryDirectory("sbs-fake-bun-");
	const bunPath = path.join(binDirectory, "bun");
	await writeFile(
		bunPath,
		[
			"#!/bin/sh",
			'if [ "$1" = "install" ]; then',
			'  printf "# refreshed by fake bun\\n" > bun.lock',
			mutatePackageJson
				? '  printf "{\\"name\\":\\"mutated\\"}\\n" > package.json'
				: "  :",
			`  exit ${exitCode}`,
			"fi",
			'echo "unexpected bun args: $*" >&2',
			"exit 2",
			"",
		].join("\n"),
	);
	await chmod(bunPath, 0o755);
	return binDirectory;
}

async function readJson<T>(repositoryRoot: string, repoRelativePath: string) {
	return JSON.parse(
		await readFile(path.join(repositoryRoot, repoRelativePath), "utf8"),
	) as T;
}

async function withPath<T>(binDirectory: string, callback: () => Promise<T>) {
	const originalPath = process.env.PATH;
	process.env.PATH = `${binDirectory}${path.delimiter}${originalPath ?? ""}`;
	try {
		return await callback();
	} finally {
		process.env.PATH = originalPath;
	}
}

const successfulEventFetch = async () => new Response(null, { status: 204 });

describe("docs operating system lockfile refresh workflow", () => {
	it("blocks without explicit lockfile refresh confirmation", async () => {
		const repositoryRoot = await createPackagePatchRepository();
		await writeInstallPlan(repositoryRoot);

		const result = await runDocsOperatingSystemLockfileRefreshWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedLockfileRefreshRun(),
			confirmDocsOperatingSystemLockfileRefresh: false,
			fetchRunnerEvent: successfulEventFetch,
		});

		expect(result.status).toBe("blocked");
		expect(result.blockedReason).toContain(
			"--confirm-docs-operating-system-lockfile-refresh",
		);
	});

	it("runs the approved package-manager command and reports only lockfile touches", async () => {
		const repositoryRoot = await createPackagePatchRepository();
		await writeInstallPlan(repositoryRoot);
		await applyPackageScriptPatch(repositoryRoot);
		const packageJsonBefore = await readFile(
			path.join(repositoryRoot, "package.json"),
			"utf8",
		);
		const fakeBunBin = await createFakeBun();

		const result = await withPath(fakeBunBin, async () =>
			runDocsOperatingSystemLockfileRefreshWorkflow({
				repositoryRoot,
				state: createState(),
				credential: createCredential(),
				approvedWorkflowRun: createApprovedLockfileRefreshRun(),
				confirmDocsOperatingSystemLockfileRefresh: true,
				now: 1_777_999,
				fetchRunnerEvent: successfulEventFetch,
			}),
		);

		expect(result.status).toBe("proof_completed");
		expect(result.proofStatus).toBe("passed");
		expect(result.touchedFiles).toEqual(["bun.lock"]);
		await expect(
			readFile(path.join(repositoryRoot, "package.json"), "utf8"),
		).resolves.toBe(packageJsonBefore);

		const proof = await readJson<{
			touchedFiles: string[];
			unexpectedTouchedFiles: string[];
			proofCommandResults: Array<{ commandName: string; status: string }>;
		}>(repositoryRoot, ".sbs/runs/workflowRuns_docs_os_lockfile/proof.json");
		expect(proof.touchedFiles).toEqual(["bun.lock"]);
		expect(proof.unexpectedTouchedFiles).toEqual([]);
		expect(proof.proofCommandResults[0]).toMatchObject({
			commandName: "bun install --lockfile-only --ignore-scripts",
			status: "passed",
		});

		const summary = await readJson<{
			status: string;
			commandName: string;
			touchedLockfileRefs: string[];
		}>(
			repositoryRoot,
			".sbs/docs-operating-system-adoption/lockfile-refresh/lockfile-refresh.json",
		);
		expect(summary.status).toBe("refreshed");
		expect(summary.commandName).toBe(
			"bun install --lockfile-only --ignore-scripts",
		);
		expect(summary.touchedLockfileRefs).toEqual(["bun.lock"]);
	});

	it("blocks before package-manager execution when package-script apply proof is missing", async () => {
		const repositoryRoot = await createPackagePatchRepository();
		await writeInstallPlan(repositoryRoot);
		const fakeBunBin = await createFakeBun();

		const result = await withPath(fakeBunBin, async () =>
			runDocsOperatingSystemLockfileRefreshWorkflow({
				repositoryRoot,
				state: createState(),
				credential: createCredential(),
				approvedWorkflowRun: createApprovedLockfileRefreshRun({
					workflowRunId: "workflowRuns_docs_os_lockfile_missing_apply",
					localWorkflowPacketRef:
						".sbs/runs/workflowRuns_docs_os_lockfile_missing_apply/workflow-packet.json",
					localProofRef:
						".sbs/runs/workflowRuns_docs_os_lockfile_missing_apply/proof.json",
				}),
				confirmDocsOperatingSystemLockfileRefresh: true,
				fetchRunnerEvent: successfulEventFetch,
			}),
		);

		expect(result.status).toBe("blocked");
		await expect(
			readFile(path.join(repositoryRoot, "bun.lock"), "utf8"),
		).rejects.toThrow();

		const proof = await readJson<{
			blockedProof: Array<{
				stage: string;
				targetRef?: string;
				reason: string;
			}>;
		}>(
			repositoryRoot,
			".sbs/runs/workflowRuns_docs_os_lockfile_missing_apply/proof.json",
		);
		expect(proof.blockedProof).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					stage: "package-script-apply",
					targetRef: applySummaryRef,
				}),
			]),
		);
	});

	it("fails proof when the package-manager command fails", async () => {
		const repositoryRoot = await createPackagePatchRepository();
		await writeInstallPlan(repositoryRoot);
		await applyPackageScriptPatch(repositoryRoot);
		const fakeBunBin = await createFakeBun({ exitCode: 1 });

		const result = await withPath(fakeBunBin, async () =>
			runDocsOperatingSystemLockfileRefreshWorkflow({
				repositoryRoot,
				state: createState(),
				credential: createCredential(),
				approvedWorkflowRun: createApprovedLockfileRefreshRun({
					workflowRunId: "workflowRuns_docs_os_lockfile_failed",
					localWorkflowPacketRef:
						".sbs/runs/workflowRuns_docs_os_lockfile_failed/workflow-packet.json",
					localProofRef:
						".sbs/runs/workflowRuns_docs_os_lockfile_failed/proof.json",
				}),
				confirmDocsOperatingSystemLockfileRefresh: true,
				fetchRunnerEvent: successfulEventFetch,
			}),
		);

		expect(result.status).toBe("proof_completed");
		expect(result.proofStatus).toBe("failed");
		expect(result.touchedFiles).toEqual(["bun.lock"]);

		const summary = await readJson<{
			status: string;
			commandStatus: string;
			exitCodeSummary: string;
		}>(
			repositoryRoot,
			".sbs/docs-operating-system-adoption/lockfile-refresh/lockfile-refresh.json",
		);
		expect(summary.status).toBe("failed");
		expect(summary.commandStatus).toBe("failed");
		expect(summary.exitCodeSummary).toContain("exit code 1");
	});

	it("fails proof when the package-manager command mutates guarded inputs", async () => {
		const repositoryRoot = await createPackagePatchRepository();
		await writeInstallPlan(repositoryRoot);
		await applyPackageScriptPatch(repositoryRoot);
		const fakeBunBin = await createFakeBun({ mutatePackageJson: true });

		const result = await withPath(fakeBunBin, async () =>
			runDocsOperatingSystemLockfileRefreshWorkflow({
				repositoryRoot,
				state: createState(),
				credential: createCredential(),
				approvedWorkflowRun: createApprovedLockfileRefreshRun({
					workflowRunId: "workflowRuns_docs_os_lockfile_guarded",
					localWorkflowPacketRef:
						".sbs/runs/workflowRuns_docs_os_lockfile_guarded/workflow-packet.json",
					localProofRef:
						".sbs/runs/workflowRuns_docs_os_lockfile_guarded/proof.json",
				}),
				confirmDocsOperatingSystemLockfileRefresh: true,
				fetchRunnerEvent: successfulEventFetch,
			}),
		);

		expect(result.status).toBe("proof_completed");
		expect(result.proofStatus).toBe("failed");

		const proof = await readJson<{
			unexpectedTouchedFiles: string[];
		}>(
			repositoryRoot,
			".sbs/runs/workflowRuns_docs_os_lockfile_guarded/proof.json",
		);
		expect(proof.unexpectedTouchedFiles).toContain("package.json");
	});
});
