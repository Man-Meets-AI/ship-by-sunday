import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { WorkspaceFindingDocument } from "@/app/(workspace)/_lib/workspace-findings-read-model";
import type {
	WorkspacePrivacySetupState,
	WorkspacePrivacySyncPreviewState,
} from "@/app/(workspace)/_lib/workspace-support-read-model";

const {
	markFindingsDeletedMock,
	requestManagedGithubMock,
	revokeManagedGithubMock,
	revokeRunnerMock,
	reportClientErrorMock,
	routerPushMock,
	toastErrorMock,
	toastSuccessMock,
} = vi.hoisted(() => ({
	markFindingsDeletedMock: vi.fn(),
	requestManagedGithubMock: vi.fn(),
	revokeManagedGithubMock: vi.fn(),
	revokeRunnerMock: vi.fn(),
	reportClientErrorMock: vi.fn(),
	routerPushMock: vi.fn(),
	toastErrorMock: vi.fn(),
	toastSuccessMock: vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		workspace: {
			revokeWorkspaceRunner: "revokeWorkspaceRunner",
			markWorkspaceFindingsDeleted: "markWorkspaceFindingsDeleted",
			requestManagedGithubExecutionConsent:
				"requestManagedGithubExecutionConsent",
			revokeManagedGithubExecutionConsent:
				"revokeManagedGithubExecutionConsent",
		},
	},
}));

vi.mock("convex/react", () => ({
	useMutation: (mutationRef: string) => {
		if (mutationRef === "revokeWorkspaceRunner") {
			return revokeRunnerMock;
		}
		if (mutationRef === "markWorkspaceFindingsDeleted") {
			return markFindingsDeletedMock;
		}
		if (mutationRef === "requestManagedGithubExecutionConsent") {
			return requestManagedGithubMock;
		}
		if (mutationRef === "revokeManagedGithubExecutionConsent") {
			return revokeManagedGithubMock;
		}
		throw new Error(`Unexpected mutation ${mutationRef}`);
	},
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: routerPushMock,
	}),
}));

vi.mock("sonner", () => ({
	toast: {
		error: toastErrorMock,
		success: toastSuccessMock,
	},
}));

vi.mock("@/lib/observability/client-error-report", () => ({
	reportClientError: reportClientErrorMock,
}));

vi.mock("@/app/(workspace)/_components/app-shell", () => ({
	AppShell: ({
		children,
		localNav,
	}: {
		children: React.ReactNode;
		localNav?: { desktop?: React.ReactNode };
	}) => (
		<div>
			<nav data-testid="workspace-privacy-local-nav">{localNav?.desktop}</nav>
			{children}
		</div>
	),
}));

import { WorkspacePrivacyPage } from "@/app/(workspace)/_components/existing-codebase-support/workspace-privacy-page";

function createSetupState(): WorkspacePrivacySetupState {
	return {
		project: {
			_id: "workspaceProjects_1",
			displayName: "Customer repo",
			defaultOpenDestination: "cursor",
			syncPolicy: {
				rawSource: "disabled",
				rawTerminalLogs: "disabled",
				codexTranscripts: "disabled",
				screenshots: "disabled",
				structuredFindings: "approval_required",
			},
		},
		activeRunner: {
			_id: "workspaceRunnerBindings_1",
			status: "paired",
			pairingStatus: "paired",
			runnerMode: "daemon",
			runnerLabel: "Local daemon",
			machineDisplayName: "Parker MacBook",
			runnerVersion: "0.1.0",
			machineHealthStatus: "ready",
			projectHealthStatus: "ready",
			lastHeartbeatAt: 1_000,
		},
		repositoryBinding: {
			_id: "workspaceRepositoryBindings_1",
			displayName: "customer-app",
			provider: "github",
			remoteHost: "github.com",
			remoteOwner: "customer",
			remoteName: "app",
			defaultBranch: "main",
			packageManager: "bun",
		},
	};
}

function createSyncPreviewState(): WorkspacePrivacySyncPreviewState {
	return {
		doctorPassRun: {
			_id: "doctorPassRuns_1",
			localRunId: "run-1",
			status: "findings_uploaded",
			runnerMode: "daemon",
			syncPreviewStatus: "uploaded",
			syncPreviewDigest: "sha256:preview",
			syncPreviewFindingsCount: 1,
			localReportRef: ".sbs/reports/doctor-pass/run-1/sync-preview.json",
			startedAt: 1_000,
			createdAt: 1_000,
			updatedAt: 2_000,
		},
	};
}

function createFinding(): WorkspaceFindingDocument {
	return {
		_id: "codebaseFindings_1",
		findingId: "finding-source-truth-readiness",
		rank: 1,
		status: "needs_approval",
		title: "Source truth needs the first workflow",
		category: "source_truth",
		severity: "high",
		confidence: 0.91,
		buyerImpact: "Later agent work needs a clearer command and proof map.",
		blastRadius: "low",
		proofPath: "Review source-truth readiness.",
		proofability: "clear",
		permissionRequired: "docs_write",
		recommendedWorkflowId: "source-truth-agent-readiness",
		whyThisNow: "It improves every later local workflow.",
		evidenceRefs: [],
		syncSensitivity: "low",
		localReportRef:
			".sbs/reports/doctor-pass/run-1/source-truth-agent-readiness.json",
	};
}

describe("WorkspacePrivacyPage", () => {
	beforeEach(() => {
		markFindingsDeletedMock.mockReset();
		requestManagedGithubMock.mockReset();
		revokeManagedGithubMock.mockReset();
		revokeRunnerMock.mockReset();
		reportClientErrorMock.mockReset();
		routerPushMock.mockReset();
		toastErrorMock.mockReset();
		toastSuccessMock.mockReset();
	});

	it("renders local privacy boundaries and calls existing control mutations", async () => {
		const user = userEvent.setup();
		revokeRunnerMock.mockResolvedValue({});
		markFindingsDeletedMock.mockResolvedValue({
			markedAt: 2_000,
			markedCount: 1,
		});
		const managedGithubConsent = {
			_id: "managedGithubExecutionConsents_1",
			status: "requested" as const,
			repositoryBindingId: "workspaceRepositoryBindings_1",
			repositoryAccess: {
				provider: "github" as const,
				remoteOwner: "customer",
				remoteName: "app",
				defaultBranch: "main",
				accessMode: "selected_repository_only" as const,
			},
			installationScope: {
				repositorySelection: "selected_repository_only" as const,
				permissions: ["metadata:read", "contents:read", "pull_requests:write"],
			},
			storagePolicy: {
				sourceCloneRetention: "ephemeral_until_delivery_or_revocation" as const,
				proofArtifactRetention: "structured_metadata_only" as const,
				secretStorage: "never_store_customer_secrets" as const,
			},
			prAuthority: {
				branchCreation: "customer_approval_required" as const,
				pullRequestCreation: "customer_approval_required" as const,
				mergeAuthority: "never" as const,
				ciRerunAuthority: "customer_approval_required" as const,
			},
			rawSourceVisibility: {
				operatorVisibility: "assigned_concierge_only_after_consent" as const,
				rawSourceSharing: "disabled_until_explicit_share" as const,
				transcriptStorage: "disabled" as const,
			},
			proofBoundary: {
				proofCommands: "customer_approved_only" as const,
				ciCommands: "customer_approved_only" as const,
				syncedArtifacts: "proof_metadata_and_pr_refs_only" as const,
			},
			requestedAt: 2_000,
		};
		requestManagedGithubMock.mockResolvedValue({
			consent: managedGithubConsent,
			auditEvents: [
				{
					_id: "managedGithubAuditEvents_1",
					eventType: "managed_github.requested",
					repositoryLabel: "customer/app",
					summary: "Customer requested concierge review.",
					createdAt: 2_000,
				},
			],
		});
		revokeManagedGithubMock.mockResolvedValue({
			consent: null,
			auditEvents: [
				{
					_id: "managedGithubAuditEvents_2",
					eventType: "managed_github.revoked",
					repositoryLabel: "customer/app",
					summary: "Revoked from workspace privacy controls",
					createdAt: 3_000,
				},
				{
					_id: "managedGithubAuditEvents_1",
					eventType: "managed_github.requested",
					repositoryLabel: "customer/app",
					summary: "Customer requested concierge review.",
					createdAt: 2_000,
				},
			],
		});

		render(
			<WorkspacePrivacyPage
				initialSetupState={createSetupState()}
				initialSyncPreviewState={createSyncPreviewState()}
				initialManagedGithubState={{
					consent: null,
					auditEvents: [],
				}}
				initialFindings={[createFinding()]}
				now={61_000}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Privacy controls" }),
		).toBeTruthy();
		expect(
			screen.getByRole("region", { name: "Privacy summary" }),
		).toBeTruthy();
		expect(screen.getByText("Customer repo")).toBeTruthy();
		expect(screen.getAllByText("customer/app").length).toBeGreaterThan(0);
		expect(screen.getByText("Parker MacBook")).toBeTruthy();
		expect(screen.getByText("Open Findings")).toBeTruthy();
		expect(screen.getByText("Raw source sharing")).toBeTruthy();
		expect(screen.getByText("Raw terminal log sharing")).toBeTruthy();
		expect(screen.getByText("Codex transcript sharing")).toBeTruthy();
		expect(screen.getByText("Approval required")).toBeTruthy();
		expect(screen.getByText("sha256:preview")).toBeTruthy();
		expect(
			screen.getByText(".sbs/reports/doctor-pass/run-1/sync-preview.json"),
		).toBeTruthy();
		expect(screen.getByText("Hosted-state controls")).toBeTruthy();
		expect(screen.getByText(/workspace state only/i)).toBeTruthy();
		expect(
			screen.getByTestId("workspace-privacy-local-nav").textContent,
		).toContain("Privacy");

		await user.click(screen.getByRole("button", { name: /Revoke runner/i }));
		expect(revokeRunnerMock).toHaveBeenCalledWith({
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			reason: "Revoked from workspace privacy controls",
		});
		await waitFor(() => {
			expect(toastSuccessMock).toHaveBeenCalledWith("Runner revoked", {
				action: expect.objectContaining({
					label: "Open Setup",
				}),
				id: "workspace-privacy-revoke-runner-success",
				description: "Pair again from Setup to resume.",
				duration: 6000,
				position: "bottom-right",
			});
		});
		const revokeRunnerToastOptions = toastSuccessMock.mock.calls.find(
			([title]) => title === "Runner revoked",
		)?.[1];
		revokeRunnerToastOptions?.action?.onClick();
		expect(routerPushMock).toHaveBeenCalledWith("/workers/setup");

		await user.click(
			screen.getByRole("button", { name: /Delete synced findings/i }),
		);
		expect(markFindingsDeletedMock).toHaveBeenCalledWith({
			projectId: "workspaceProjects_1",
			findingDocumentIds: ["codebaseFindings_1"],
		});
		await waitFor(() => {
			expect(toastSuccessMock).toHaveBeenCalledWith("Findings hidden", {
				action: expect.objectContaining({
					label: "View findings",
				}),
				id: "workspace-privacy-delete-findings-success",
				description: undefined,
				duration: 6000,
				position: "bottom-right",
			});
		});
		const deleteFindingsToastOptions = toastSuccessMock.mock.calls.find(
			([title]) => title === "Findings hidden",
		)?.[1];
		deleteFindingsToastOptions?.action?.onClick();
		expect(routerPushMock).toHaveBeenCalledWith("/workers/findings");

		const visibleText = document.body.textContent?.toLowerCase() ?? "";
		expect(visibleText).not.toContain("dangerously");
		expect(visibleText).not.toContain("hidden github access");
		expect(visibleText).not.toContain("push branch");
		expect(visibleText).not.toContain("open pr");
		expect(visibleText).not.toContain("queue worker");
		expect(visibleText).not.toContain("rerun ci now");
		expect(visibleText).not.toContain("raw source uploaded");
	});

	it("toasts and reports privacy action failures", async () => {
		const user = userEvent.setup();
		const revokeError = new Error("Runner revoke failed");
		revokeRunnerMock.mockRejectedValueOnce(revokeError);

		render(
			<WorkspacePrivacyPage
				initialSetupState={createSetupState()}
				initialSyncPreviewState={createSyncPreviewState()}
				initialManagedGithubState={{
					consent: null,
					auditEvents: [],
				}}
				initialFindings={[createFinding()]}
				now={61_000}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /Revoke runner/i }));

		await waitFor(() => {
			expect(toastErrorMock).toHaveBeenCalledWith("Runner revoke failed", {
				id: "workspace-privacy-revoke-runner-error",
				duration: 6000,
				position: "bottom-right",
			});
		});
		expect(reportClientErrorMock).toHaveBeenCalledWith({
			error: revokeError,
			pathname: "/workers/privacy",
			code: "workspace_privacy_runner_revoke_failed",
			severity: "medium",
			details: {
				action: "revoke_runner",
			},
		});
	});
});
