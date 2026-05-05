import type { RunnerCredential } from "../src/core/local-runner-home";
import type { LocalProjectState } from "../src/core/local-project-state";
import { claimApprovedWorkflowRun } from "../src/core/workflow-run-api";

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
});
