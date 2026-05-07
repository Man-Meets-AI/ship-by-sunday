import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type { RunnerCredential } from "../src/core/local-runner-home";
import type { LocalProjectState } from "../src/core/local-project-state";
import { runDocsOperatingSystemPackageScriptPatchingWorkflow } from "../src/core/docs-operating-system-package-script-patching-workflow";
import type { ApprovedWorkflowRunPacket } from "../src/core/workflow-run-api";
import { buildDocsOperatingSystemInstallPlan } from "../src/workflows/docs-operating-system-adoption/install-plan";
import {
	DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_DISALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_EXPECTED_OUTPUTS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROOF_COMMANDS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ROLLBACK_NOTES,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_STOP_CONDITIONS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_SYNC_POLICY_SUMMARY,
	DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_VERSION,
} from "../src/workflows/docs-operating-system-adoption/manifest";
import type { DocsSpineRepoFacts } from "../src/workflows/docs-spine-adoption/schemas";
import {
	createTemporaryDirectory,
	initializeGitRepository,
} from "./test-utils";

const execFileAsync = promisify(execFile);
const installPlanRef =
	".sbs/docs-operating-system-adoption/tooling-plan/install-plan.json";

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

async function createPackagePatchRepository({
	scripts = {},
}: {
	scripts?: Record<string, unknown>;
} = {}) {
	const repositoryRoot = await createTemporaryDirectory("sbs-docs-os-patch-");
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
		scripts,
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

async function writeInstallPlan(repositoryRoot: string, scripts = {}) {
	const rootPackageManifest = {
		name: "customer-repo",
		scripts: scripts as Record<string, string>,
	};
	const installPlan = buildDocsOperatingSystemInstallPlan({
		repoFacts: createRepoFacts(Object.keys(rootPackageManifest.scripts)),
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

async function readJson<T>(repositoryRoot: string, repoRelativePath: string) {
	return JSON.parse(
		await readFile(path.join(repositoryRoot, repoRelativePath), "utf8"),
	) as T;
}

const successfulEventFetch = async () => new Response(null, { status: 204 });

describe("docs operating system package-script patching workflow", () => {
	it("blocks without explicit tooling-apply confirmation", async () => {
		const repositoryRoot = await createPackagePatchRepository();
		await writeInstallPlan(repositoryRoot);

		const result = await runDocsOperatingSystemPackageScriptPatchingWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_docs_os_package_blocked",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_docs_os_package_blocked/workflow-packet.json",
				localProofRef:
					".sbs/runs/workflowRuns_docs_os_package_blocked/proof.json",
			}),
			confirmDocsOperatingSystemToolingApply: false,
			fetchRunnerEvent: successfulEventFetch,
		});

		expect(result.status).toBe("blocked");
		expect(result.blockedReason).toContain(
			"--confirm-docs-operating-system-tooling-apply",
		);
	});

	it("patches missing scripts, the shared dependency, and wrapper files from a clean install plan", async () => {
		const repositoryRoot = await createPackagePatchRepository();
		await writeInstallPlan(repositoryRoot);

		const result = await runDocsOperatingSystemPackageScriptPatchingWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsOperatingSystemToolingApply: true,
			now: 1_777_999,
			fetchRunnerEvent: successfulEventFetch,
		});

		expect(result.status).toBe("proof_completed");
		expect(result.proofStatus).toBe("passed");
		expect(result.touchedFiles).toEqual([
			"package.json",
			"scripts/sbs-docs/programs-lint.mjs",
			"scripts/sbs-docs/exec-plans-lint.mjs",
			"scripts/sbs-docs/markdown-lint.mjs",
			"scripts/sbs-docs/docs-validate.mjs",
			"scripts/sbs-docs/docs-refresh-quality.mjs",
			"scripts/sbs-docs/write-child-plan.mjs",
		]);

		const packageJson = await readJson<{
			scripts: Record<string, string>;
			devDependencies: Record<string, string>;
		}>(repositoryRoot, "package.json");
		expect(packageJson.scripts["programs:lint"]).toBe(
			"bun scripts/sbs-docs/programs-lint.mjs",
		);
		expect(packageJson.scripts["plans:lint"]).toBe(
			"bun scripts/sbs-docs/exec-plans-lint.mjs",
		);
		expect(packageJson.scripts["docs:validate"]).toBe(
			"bun scripts/sbs-docs/docs-validate.mjs",
		);
		expect(packageJson.devDependencies["ship-by-sunday"]).toBe(
			DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_VERSION,
		);

		const wrapper = await readFile(
			path.join(repositoryRoot, "scripts/sbs-docs/docs-validate.mjs"),
			"utf8",
		);
		expect(wrapper).toContain(
			"Generated by Ship by Sunday docs operating-system tooling.",
		);
		expect(wrapper).toContain('"docs-validate"');

		const proof = await readJson<{
			touchedFiles: string[];
			unexpectedTouchedFiles: string[];
			proofCommandResults: Array<{ commandName: string; status: string }>;
		}>(repositoryRoot, ".sbs/runs/workflowRuns_docs_os_package/proof.json");
		expect(proof.touchedFiles).toContain("package.json");
		expect(proof.unexpectedTouchedFiles).toEqual([]);
		expect(
			proof.proofCommandResults.every((result) => result.status === "passed"),
		).toBe(true);
	});

	it("blocks incomplete wrapper operations before package scripts can point at missing wrappers", async () => {
		const repositoryRoot = await createPackagePatchRepository();
		const packageJsonBefore = await readFile(
			path.join(repositoryRoot, "package.json"),
			"utf8",
		);
		const installPlan = await writeInstallPlan(repositoryRoot);
		installPlan.validatorFileOperations =
			installPlan.validatorFileOperations.filter(
				(operation) =>
					operation.targetRef !== "scripts/sbs-docs/docs-validate.mjs",
			);
		await writeFile(
			path.join(repositoryRoot, installPlanRef),
			`${JSON.stringify(installPlan, null, 2)}\n`,
		);

		const result = await runDocsOperatingSystemPackageScriptPatchingWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_docs_os_package_missing_wrapper",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_docs_os_package_missing_wrapper/workflow-packet.json",
				localProofRef:
					".sbs/runs/workflowRuns_docs_os_package_missing_wrapper/proof.json",
			}),
			confirmDocsOperatingSystemToolingApply: true,
			fetchRunnerEvent: successfulEventFetch,
		});

		expect(result.status).toBe("blocked");
		await expect(
			readFile(path.join(repositoryRoot, "package.json"), "utf8"),
		).resolves.toBe(packageJsonBefore);

		const proof = await readJson<{
			blockedProof: Array<{
				stage: string;
				targetRef?: string;
				reason: string;
			}>;
		}>(
			repositoryRoot,
			".sbs/runs/workflowRuns_docs_os_package_missing_wrapper/proof.json",
		);
		expect(proof.blockedProof).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					stage: "install-plan",
					targetRef: "scripts/sbs-docs/docs-validate.mjs",
					reason: "Install plan is missing a required wrapper operation.",
				}),
			]),
		);
	});

	it("blocks write targets that cannot be created before mutating package.json", async () => {
		const repositoryRoot = await createPackagePatchRepository();
		await mkdir(path.join(repositoryRoot, "scripts"), { recursive: true });
		await writeFile(
			path.join(repositoryRoot, "scripts", "sbs-docs"),
			"not a directory\n",
		);
		await execFileAsync("git", ["add", "scripts/sbs-docs"], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["commit", "-m", "block wrapper directory"], {
			cwd: repositoryRoot,
		});
		const packageJsonBefore = await readFile(
			path.join(repositoryRoot, "package.json"),
			"utf8",
		);
		await writeInstallPlan(repositoryRoot);

		const result = await runDocsOperatingSystemPackageScriptPatchingWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_docs_os_package_write_preflight",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_docs_os_package_write_preflight/workflow-packet.json",
				localProofRef:
					".sbs/runs/workflowRuns_docs_os_package_write_preflight/proof.json",
			}),
			confirmDocsOperatingSystemToolingApply: true,
			fetchRunnerEvent: successfulEventFetch,
		});

		expect(result.status).toBe("blocked");
		await expect(
			readFile(path.join(repositoryRoot, "package.json"), "utf8"),
		).resolves.toBe(packageJsonBefore);

		const proof = await readJson<{
			touchedFiles: string[];
			blockedProof: Array<{
				stage: string;
				targetRef?: string;
				reason: string;
			}>;
		}>(
			repositoryRoot,
			".sbs/runs/workflowRuns_docs_os_package_write_preflight/proof.json",
		);
		expect(proof.touchedFiles).toEqual([]);
		expect(proof.blockedProof).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					stage: "write-preflight",
					targetRef: "scripts/sbs-docs/programs-lint.mjs",
				}),
			]),
		);
		expect(JSON.stringify(proof)).toContain("is not a directory");
	});

	it("blocks live non-string canonical scripts instead of overwriting them", async () => {
		const repositoryRoot = await createPackagePatchRepository();
		await writeInstallPlan(repositoryRoot);
		await writePackageJson(repositoryRoot, {
			name: "customer-repo",
			scripts: {
				"docs:validate": ["SECRET_NON_STRING_SCRIPT"],
			},
			devDependencies: {
				vitest: "1.0.0",
			},
		});
		await execFileAsync("git", ["add", "package.json"], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["commit", "-m", "non-string script"], {
			cwd: repositoryRoot,
		});

		const result = await runDocsOperatingSystemPackageScriptPatchingWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_docs_os_package_non_string",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_docs_os_package_non_string/workflow-packet.json",
				localProofRef:
					".sbs/runs/workflowRuns_docs_os_package_non_string/proof.json",
			}),
			confirmDocsOperatingSystemToolingApply: true,
			fetchRunnerEvent: successfulEventFetch,
		});

		expect(result.status).toBe("blocked");
		const packageJson = await readJson<{
			scripts: Record<string, unknown>;
		}>(repositoryRoot, "package.json");
		expect(packageJson.scripts["docs:validate"]).toEqual([
			"SECRET_NON_STRING_SCRIPT",
		]);

		const proof = await readJson<{
			blockedProof: Array<{ stage: string; targetRef?: string }>;
		}>(
			repositoryRoot,
			".sbs/runs/workflowRuns_docs_os_package_non_string/proof.json",
		);
		expect(proof.blockedProof).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					stage: "package-script-invalid",
					targetRef: "package.json#scripts.docs:validate",
				}),
			]),
		);
		expect(JSON.stringify(proof)).not.toContain("SECRET_NON_STRING_SCRIPT");
	});

	it("blocks invalid dependency and wrapper statuses from a stale install plan", async () => {
		const repositoryRoot = await createPackagePatchRepository();
		const packageJsonBefore = await readFile(
			path.join(repositoryRoot, "package.json"),
			"utf8",
		);
		const installPlan = await writeInstallPlan(repositoryRoot);
		installPlan.dependencyOperations[0].status =
			"bogus" as (typeof installPlan.dependencyOperations)[number]["status"];
		installPlan.validatorFileOperations[0].status =
			"bogus" as (typeof installPlan.validatorFileOperations)[number]["status"];
		await writeFile(
			path.join(repositoryRoot, installPlanRef),
			`${JSON.stringify(installPlan, null, 2)}\n`,
		);

		const result = await runDocsOperatingSystemPackageScriptPatchingWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_docs_os_package_invalid_status",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_docs_os_package_invalid_status/workflow-packet.json",
				localProofRef:
					".sbs/runs/workflowRuns_docs_os_package_invalid_status/proof.json",
			}),
			confirmDocsOperatingSystemToolingApply: true,
			fetchRunnerEvent: successfulEventFetch,
		});

		expect(result.status).toBe("blocked");
		await expect(
			readFile(path.join(repositoryRoot, "package.json"), "utf8"),
		).resolves.toBe(packageJsonBefore);

		const proof = await readJson<{
			blockedProof: Array<{ stage: string; reason: string }>;
		}>(
			repositoryRoot,
			".sbs/runs/workflowRuns_docs_os_package_invalid_status/proof.json",
		);
		expect(proof.blockedProof).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					stage: "install-plan",
					reason: "Install plan contains an invalid shared dependency status.",
				}),
				expect.objectContaining({
					stage: "install-plan",
					reason: "Install plan contains an invalid wrapper file status.",
				}),
			]),
		);
	});

	it("does not trust a wrapper file only because it contains the generated marker", async () => {
		const repositoryRoot = await createPackagePatchRepository();
		await mkdir(path.join(repositoryRoot, "scripts", "sbs-docs"), {
			recursive: true,
		});
		await writeFile(
			path.join(repositoryRoot, "scripts/sbs-docs/docs-validate.mjs"),
			[
				"#!/usr/bin/env bun",
				"// Generated by Ship by Sunday docs operating-system tooling.",
				'console.log("not the managed wrapper");',
				"",
			].join("\n"),
		);
		await execFileAsync("git", ["add", "scripts/sbs-docs/docs-validate.mjs"], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["commit", "-m", "fake managed wrapper"], {
			cwd: repositoryRoot,
		});
		const packageJsonBefore = await readFile(
			path.join(repositoryRoot, "package.json"),
			"utf8",
		);
		await writeInstallPlan(repositoryRoot);

		const result = await runDocsOperatingSystemPackageScriptPatchingWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_docs_os_package_fake_wrapper",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_docs_os_package_fake_wrapper/workflow-packet.json",
				localProofRef:
					".sbs/runs/workflowRuns_docs_os_package_fake_wrapper/proof.json",
			}),
			confirmDocsOperatingSystemToolingApply: true,
			fetchRunnerEvent: successfulEventFetch,
		});

		expect(result.status).toBe("blocked");
		await expect(
			readFile(path.join(repositoryRoot, "package.json"), "utf8"),
		).resolves.toBe(packageJsonBefore);

		const proof = await readJson<{
			blockedProof: Array<{ stage: string; targetRef?: string }>;
		}>(
			repositoryRoot,
			".sbs/runs/workflowRuns_docs_os_package_fake_wrapper/proof.json",
		);
		expect(proof.blockedProof).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					stage: "validator-file-conflict",
					targetRef: "scripts/sbs-docs/docs-validate.mjs",
				}),
			]),
		);
	});

	it("blocks before writes when the dry-run plan contains same-name script conflicts", async () => {
		const scripts = {
			"docs:validate": "echo SECRET_CONFLICT_BODY",
		};
		const repositoryRoot = await createPackagePatchRepository({ scripts });
		const packageJsonBefore = await readFile(
			path.join(repositoryRoot, "package.json"),
			"utf8",
		);
		await writeInstallPlan(repositoryRoot, scripts);

		const result = await runDocsOperatingSystemPackageScriptPatchingWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_docs_os_package_conflict",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_docs_os_package_conflict/workflow-packet.json",
				localProofRef:
					".sbs/runs/workflowRuns_docs_os_package_conflict/proof.json",
			}),
			confirmDocsOperatingSystemToolingApply: true,
			fetchRunnerEvent: successfulEventFetch,
		});

		expect(result.status).toBe("blocked");
		await expect(
			readFile(path.join(repositoryRoot, "package.json"), "utf8"),
		).resolves.toBe(packageJsonBefore);

		const proof = await readJson<{
			blockedProof: Array<{ stage: string; reason: string }>;
		}>(
			repositoryRoot,
			".sbs/runs/workflowRuns_docs_os_package_conflict/proof.json",
		);
		expect(proof.blockedProof).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					stage: "package-script:docs:validate",
				}),
			]),
		);
		expect(JSON.stringify(proof)).not.toContain("SECRET_CONFLICT_BODY");
	});

	it("blocks stale plans when a canonical script appears after dry-run", async () => {
		const repositoryRoot = await createPackagePatchRepository();
		await writeInstallPlan(repositoryRoot);
		await writePackageJson(repositoryRoot, {
			name: "customer-repo",
			scripts: {
				"docs:validate": "echo SECRET_LATE_SCRIPT",
			},
			devDependencies: {
				vitest: "1.0.0",
			},
		});
		await execFileAsync("git", ["add", "package.json"], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["commit", "-m", "late script"], {
			cwd: repositoryRoot,
		});

		const result = await runDocsOperatingSystemPackageScriptPatchingWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_docs_os_package_stale",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_docs_os_package_stale/workflow-packet.json",
				localProofRef:
					".sbs/runs/workflowRuns_docs_os_package_stale/proof.json",
			}),
			confirmDocsOperatingSystemToolingApply: true,
			fetchRunnerEvent: successfulEventFetch,
		});

		expect(result.status).toBe("blocked");
		const proof = await readJson<{
			blockedProof: Array<{ stage: string; reason: string }>;
		}>(
			repositoryRoot,
			".sbs/runs/workflowRuns_docs_os_package_stale/proof.json",
		);
		expect(proof.blockedProof).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					stage: "package-script-conflict",
				}),
			]),
		);
		expect(JSON.stringify(proof)).not.toContain("SECRET_LATE_SCRIPT");
	});
});
