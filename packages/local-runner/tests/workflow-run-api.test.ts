import type { RunnerCredential } from "../src/core/local-runner-home";
import type { LocalProjectState } from "../src/core/local-project-state";
import { claimApprovedWorkflowRun } from "../src/core/workflow-run-api";
import {
	DOCS_SPINE_ADOPTION_ALLOWED_TOUCH_TARGETS,
	DOCS_SPINE_ADOPTION_DISALLOWED_TOUCH_TARGETS,
	DOCS_SPINE_ADOPTION_EXPECTED_OUTPUTS,
	DOCS_SPINE_ADOPTION_PROOF_COMMANDS,
	DOCS_SPINE_ADOPTION_ROLLBACK_NOTES,
	DOCS_SPINE_ADOPTION_STOP_CONDITIONS,
	DOCS_SPINE_ADOPTION_SYNC_POLICY_SUMMARY,
} from "../src/workflows/docs-spine-adoption/manifest";
import {
	DOCS_SPINE_APPLY_ALLOWED_TOUCH_TARGETS,
	DOCS_SPINE_APPLY_DISALLOWED_TOUCH_TARGETS,
	DOCS_SPINE_APPLY_EXPECTED_OUTPUTS,
	DOCS_SPINE_APPLY_PROOF_COMMANDS,
	DOCS_SPINE_APPLY_ROLLBACK_NOTES,
	DOCS_SPINE_APPLY_STOP_CONDITIONS,
	DOCS_SPINE_APPLY_SYNC_POLICY_SUMMARY,
} from "../src/workflows/docs-spine-apply-and-proof/manifest";
import {
	DOCS_OPERATING_SYSTEM_ADOPTION_ALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_ADOPTION_DISALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_ADOPTION_EXPECTED_OUTPUTS,
	DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
	DOCS_OPERATING_SYSTEM_ADOPTION_PROOF_COMMANDS,
	DOCS_OPERATING_SYSTEM_ADOPTION_ROLLBACK_NOTES,
	DOCS_OPERATING_SYSTEM_ADOPTION_STOP_CONDITIONS,
	DOCS_OPERATING_SYSTEM_ADOPTION_SYNC_POLICY_SUMMARY,
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

function createMatureRepoAdoptionPacket(
	overrides: Record<string, unknown> = {},
) {
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
		expectedOutputs: [
			"mature repo adoption workflow packet",
			"sync-safe repo convention audit",
			"adoption Program packet draft",
			"first child ExecPlan draft",
			"local proof or blocked-proof summary",
		],
		allowedTouchTargets: [
			".sbs/runs/<workflow-run-id>/**",
			".sbs/mature-repo/**",
			"repo convention metadata only",
		],
		disallowedTouchTargets: [
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
		],
		proofCommands: [
			"git status --short",
			"git diff --name-only",
			"git diff --check",
		],
		syncPolicySummary:
			"Only approved structured workflow metadata, proof status, command names, artifact names, and repo-relative refs sync. Local code, command output, and Codex session history stay on the machine.",
		stopConditions: [
			"worktree is dirty before branch creation",
			"write lease expires before adoption audit starts",
			"requested work needs generated-starter rewrites, provider setup, package installs, migrations, CI, PRs, branch pushes, raw source, raw logs, or Codex transcripts",
			"proof command fails",
		],
		rollbackNotes:
			"Keep the branch local by default. Roll back with git switch back to the base branch and git branch -D the mature adoption branch after reviewing local proof.",
		localWorkflowPacketRef:
			".sbs/runs/workflowRuns_mature/workflow-packet.json",
		localProofRef: ".sbs/runs/workflowRuns_mature/proof.json",
		...overrides,
	};
}

function createDocsSpineAdoptionPacket(
	overrides: Record<string, unknown> = {},
) {
	return {
		workflowRunId: "workflowRuns_docs_spine",
		workflowId: "docs-spine-adoption",
		workflowVersion: "v1",
		branchName: "sbs/docs-spine-adoption-20260505-1200",
		profileName: "sbs-workspace-write",
		writeLeaseId: "lease_workflowRuns_docs_spine",
		writeLeaseExpiresAt: 4_102_444_800_000,
		writeLeaseDurationMinutes: 30,
		dirtyStatePolicy: "require_clean_worktree",
		expectedOutputs: [...DOCS_SPINE_ADOPTION_EXPECTED_OUTPUTS],
		allowedTouchTargets: [...DOCS_SPINE_ADOPTION_ALLOWED_TOUCH_TARGETS],
		disallowedTouchTargets: [...DOCS_SPINE_ADOPTION_DISALLOWED_TOUCH_TARGETS],
		proofCommands: [...DOCS_SPINE_ADOPTION_PROOF_COMMANDS],
		syncPolicySummary: DOCS_SPINE_ADOPTION_SYNC_POLICY_SUMMARY,
		stopConditions: [...DOCS_SPINE_ADOPTION_STOP_CONDITIONS],
		rollbackNotes: DOCS_SPINE_ADOPTION_ROLLBACK_NOTES,
		localWorkflowPacketRef:
			".sbs/runs/workflowRuns_docs_spine/workflow-packet.json",
		localProofRef: ".sbs/runs/workflowRuns_docs_spine/proof.json",
		...overrides,
	};
}

function createDocsSpineApplyPacket(overrides: Record<string, unknown> = {}) {
	return {
		workflowRunId: "workflowRuns_docs_spine_apply",
		workflowId: "docs-spine-apply-and-proof",
		workflowVersion: "v1",
		branchName: "sbs/docs-spine-apply-20260505-1300",
		profileName: "sbs-workspace-write",
		writeLeaseId: "lease_workflowRuns_docs_spine_apply",
		writeLeaseExpiresAt: 4_102_444_800_000,
		writeLeaseDurationMinutes: 30,
		dirtyStatePolicy: "require_clean_worktree",
		expectedOutputs: [...DOCS_SPINE_APPLY_EXPECTED_OUTPUTS],
		allowedTouchTargets: [...DOCS_SPINE_APPLY_ALLOWED_TOUCH_TARGETS],
		disallowedTouchTargets: [...DOCS_SPINE_APPLY_DISALLOWED_TOUCH_TARGETS],
		proofCommands: [...DOCS_SPINE_APPLY_PROOF_COMMANDS],
		syncPolicySummary: DOCS_SPINE_APPLY_SYNC_POLICY_SUMMARY,
		stopConditions: [...DOCS_SPINE_APPLY_STOP_CONDITIONS],
		rollbackNotes: DOCS_SPINE_APPLY_ROLLBACK_NOTES,
		localWorkflowPacketRef:
			".sbs/runs/workflowRuns_docs_spine_apply/workflow-packet.json",
		localProofRef: ".sbs/runs/workflowRuns_docs_spine_apply/proof.json",
		...overrides,
	};
}

function createDocsOperatingSystemAdoptionPacket(
	overrides: Record<string, unknown> = {},
) {
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

function createDocsOperatingSystemPackageScriptPatchingPacket(
	overrides: Record<string, unknown> = {},
) {
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

function createDocsOperatingSystemLockfileRefreshPacket(
	overrides: Record<string, unknown> = {},
) {
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

describe("workflow run API", () => {
	it("claims the next approved workflow packet from the worker queue", async () => {
		const requests: unknown[] = [];
		const workflowRun = await claimApprovedWorkflowRun({
			state: createState(),
			credential: createCredential(),
			fetchWorkflowRun: async (url, init) => {
				requests.push({
					url: String(url),
					hasAuthorization: JSON.stringify(init?.headers).includes(
						"Bearer sbs_run_secret",
					),
					body: JSON.parse(String(init?.body)),
				});
				return Response.json({
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
					allowedTouchTargets: ["AGENTS.md"],
					disallowedTouchTargets: ["runtime app code"],
					proofCommands: ["git status --short"],
					syncPolicySummary: "Only structured proof metadata syncs.",
					stopConditions: ["worktree dirty before writes"],
					rollbackNotes: "Delete the local branch after review.",
					localWorkflowPacketRef:
						".sbs/runs/workflowRuns_1/workflow-packet.json",
					localProofRef: ".sbs/runs/workflowRuns_1/proof.json",
				});
			},
		});

		expect(workflowRun?.workflowRunId).toBe("workflowRuns_1");
		expect(requests).toEqual([
			expect.objectContaining({
				url: "https://example.com/api/workspace/runner/workflow-runs/claim",
				body: {
					projectId: "workspaceProjects_1",
					runnerId: "workspaceRunnerBindings_1",
				},
				hasAuthorization: true,
			}),
		]);
	});

	it("returns null when the worker queue has no approved job", async () => {
		const workflowRun = await claimApprovedWorkflowRun({
			state: createState(),
			credential: createCredential(),
			fetchWorkflowRun: async () => Response.json(null),
		});

		expect(workflowRun).toBeNull();
	});

	it("accepts observability workflow packets from the worker queue", async () => {
		const workflowRun = await claimApprovedWorkflowRun({
			state: createState(),
			credential: createCredential(),
			fetchWorkflowRun: async () =>
				Response.json({
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
					allowedTouchTargets: [".sbs/runs/<workflow-run-id>/**"],
					disallowedTouchTargets: ["runtime app code"],
					proofCommands: ["git status --short"],
					syncPolicySummary: "Only structured proof metadata syncs.",
					stopConditions: ["worktree dirty before writes"],
					rollbackNotes: "Delete the local observability branch after review.",
					localWorkflowPacketRef:
						".sbs/runs/workflowRuns_observability/workflow-packet.json",
					localProofRef: ".sbs/runs/workflowRuns_observability/proof.json",
				}),
		});

		expect(workflowRun?.workflowId).toBe("observability-debuggability");
	});

	it("accepts mature repo adoption workflow packets from the worker queue", async () => {
		const workflowRun = await claimApprovedWorkflowRun({
			state: createState(),
			credential: createCredential(),
			fetchWorkflowRun: async () =>
				Response.json(createMatureRepoAdoptionPacket()),
		});

		expect(workflowRun?.workflowId).toBe("mature-repo-adoption");
	});

	it("accepts docs spine adoption workflow packets from the worker queue", async () => {
		const workflowRun = await claimApprovedWorkflowRun({
			state: createState(),
			credential: createCredential(),
			fetchWorkflowRun: async () =>
				Response.json(createDocsSpineAdoptionPacket()),
		});

		expect(workflowRun?.workflowId).toBe("docs-spine-adoption");
	});

	it("accepts docs spine apply workflow packets from the worker queue", async () => {
		const workflowRun = await claimApprovedWorkflowRun({
			state: createState(),
			credential: createCredential(),
			fetchWorkflowRun: async () => Response.json(createDocsSpineApplyPacket()),
		});

		expect(workflowRun?.workflowId).toBe("docs-spine-apply-and-proof");
	});

	it("accepts docs operating system adoption packets from the worker queue", async () => {
		const workflowRun = await claimApprovedWorkflowRun({
			state: createState(),
			credential: createCredential(),
			fetchWorkflowRun: async () =>
				Response.json(createDocsOperatingSystemAdoptionPacket()),
		});

		expect(workflowRun?.workflowId).toBe("docs-operating-system-adoption");
		expect(workflowRun?.installProfile).toBe("worker-grade");
	});

	it("accepts docs operating system package-script patching packets from the worker queue", async () => {
		const workflowRun = await claimApprovedWorkflowRun({
			state: createState(),
			credential: createCredential(),
			fetchWorkflowRun: async () =>
				Response.json(createDocsOperatingSystemPackageScriptPatchingPacket()),
		});

		expect(workflowRun?.workflowId).toBe(
			"docs-operating-system-package-script-patching",
		);
		expect(workflowRun?.installProfile).toBe("worker-grade");
	});

	it("accepts docs operating system lockfile refresh packets from the worker queue", async () => {
		const workflowRun = await claimApprovedWorkflowRun({
			state: createState(),
			credential: createCredential(),
			fetchWorkflowRun: async () =>
				Response.json(createDocsOperatingSystemLockfileRefreshPacket()),
		});

		expect(workflowRun?.workflowId).toBe(
			"docs-operating-system-lockfile-refresh",
		);
		expect(workflowRun?.installProfile).toBe("worker-grade");
	});

	it("rejects mature repo adoption workflow packets that omit disallowed authorities", async () => {
		await expect(
			claimApprovedWorkflowRun({
				state: createState(),
				credential: createCredential(),
				fetchWorkflowRun: async () =>
					Response.json(
						createMatureRepoAdoptionPacket({
							disallowedTouchTargets: ["runtime app code"],
						}),
					),
			}),
		).rejects.toThrow("Mature repo adoption disallowed touch targets");
	});

	it("rejects docs spine adoption workflow packets that omit disallowed authorities", async () => {
		await expect(
			claimApprovedWorkflowRun({
				state: createState(),
				credential: createCredential(),
				fetchWorkflowRun: async () =>
					Response.json(
						createDocsSpineAdoptionPacket({
							disallowedTouchTargets: ["runtime app code"],
						}),
					),
			}),
		).rejects.toThrow("Docs spine adoption disallowed touch targets");
	});

	it("rejects docs spine apply workflow packets that omit approved docs roots", async () => {
		await expect(
			claimApprovedWorkflowRun({
				state: createState(),
				credential: createCredential(),
				fetchWorkflowRun: async () =>
					Response.json(
						createDocsSpineApplyPacket({
							allowedTouchTargets: [".sbs/runs/<workflow-run-id>/**"],
						}),
					),
			}),
		).rejects.toThrow("Docs spine apply allowed touch targets");
	});

	it("rejects docs operating system adoption packets without the worker-grade install profile", async () => {
		await expect(
			claimApprovedWorkflowRun({
				state: createState(),
				credential: createCredential(),
				fetchWorkflowRun: async () =>
					Response.json(
						createDocsOperatingSystemAdoptionPacket({
							installProfile: undefined,
						}),
					),
			}),
		).rejects.toThrow("Docs operating system adoption install profile");
	});

	it("rejects docs operating system package-script patching packets without the worker-grade install profile", async () => {
		await expect(
			claimApprovedWorkflowRun({
				state: createState(),
				credential: createCredential(),
				fetchWorkflowRun: async () =>
					Response.json(
						createDocsOperatingSystemPackageScriptPatchingPacket({
							installProfile: undefined,
						}),
					),
			}),
		).rejects.toThrow(
			"Docs operating system package-script patching install profile",
		);
	});

	it("rejects docs operating system lockfile refresh packets without the worker-grade install profile", async () => {
		await expect(
			claimApprovedWorkflowRun({
				state: createState(),
				credential: createCredential(),
				fetchWorkflowRun: async () =>
					Response.json(
						createDocsOperatingSystemLockfileRefreshPacket({
							installProfile: undefined,
						}),
					),
			}),
		).rejects.toThrow("Docs operating system lockfile refresh install profile");
	});
});
