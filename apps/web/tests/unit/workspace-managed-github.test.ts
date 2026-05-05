import { afterEach, describe, expect, it, vi } from "vitest";

import {
	bindWorkspaceRepository,
	createOrLoadWorkspaceProject,
	getManagedGithubExecutionState,
	requestManagedGithubExecutionConsent,
	revokeManagedGithubExecutionConsent,
} from "@/convex/workspace";

import { createWorkspaceTestCtx } from "./workspace-test-helpers";

const acknowledgement = {
	repoAccess: true,
	installationScope: true,
	storagePolicy: true,
	prAuthority: true,
	auditLog: true,
	revocation: true,
	rawSourceVisibility: true,
	proofBoundaries: true,
} as const;

async function createProjectWithRepository(
	provider: "github" | "gitlab" = "github",
) {
	const testContext = createWorkspaceTestCtx();
	const projectResult = await createOrLoadWorkspaceProject._handler(
		testContext.ctx as never,
		{},
	);
	const repositoryBinding = await bindWorkspaceRepository._handler(
		testContext.ctx as never,
		{
			projectId: projectResult.project._id,
			displayName: "customer-app",
			provider,
			remoteHost: provider === "github" ? "github.com" : "gitlab.com",
			remoteOwner: "customer",
			remoteName: "app",
			defaultBranch: "main",
			packageManager: "bun",
		},
	);

	return {
		...testContext,
		project: projectResult.project,
		repositoryBinding,
	};
}

describe("managed GitHub workspace consent", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("records explicit single-repository consent and audit without creating workflow work", async () => {
		vi.spyOn(Date, "now").mockReturnValue(123_000);
		const { ctx, tables, project, repositoryBinding } =
			await createProjectWithRepository();

		const requestState = await requestManagedGithubExecutionConsent._handler(
			ctx as never,
			{
				projectId: project._id,
				repositoryBindingId: repositoryBinding._id,
				acknowledgement,
			},
		);
		const consent = requestState.consent;
		const state = await getManagedGithubExecutionState._handler(ctx as never, {
			projectId: project._id,
		});

		expect(consent).not.toBeNull();
		expect(consent).toMatchObject({
			status: "requested",
			repositoryBindingId: repositoryBinding._id,
			repositoryAccess: {
				provider: "github",
				remoteOwner: "customer",
				remoteName: "app",
				defaultBranch: "main",
				accessMode: "selected_repository_only",
			},
			installationScope: {
				repositorySelection: "selected_repository_only",
				permissions: expect.arrayContaining([
					"metadata:read",
					"contents:read",
					"pull_requests:write",
				]),
			},
			prAuthority: {
				branchCreation: "customer_approval_required",
				pullRequestCreation: "customer_approval_required",
				mergeAuthority: "never",
				ciRerunAuthority: "customer_approval_required",
			},
			rawSourceVisibility: {
				rawSourceSharing: "disabled_until_explicit_share",
				transcriptStorage: "disabled",
			},
			proofBoundary: {
				proofCommands: "customer_approved_only",
				ciCommands: "customer_approved_only",
			},
		});
		expect(state.consent?._id).toBe(consent?._id);
		expect(requestState.auditEvents[0]).toMatchObject({
			eventType: "managed_github.requested",
			repositoryLabel: "customer/app",
		});
		expect(state.auditEvents[0]).toMatchObject({
			eventType: "managed_github.requested",
			repositoryLabel: "customer/app",
		});
		expect(tables.workflowRuns).toHaveLength(0);
		expect(tables.managedGithubAuditEvents).toHaveLength(1);
	});

	it("returns the existing active consent instead of duplicating authority", async () => {
		const { ctx, tables, project, repositoryBinding } =
			await createProjectWithRepository();

		const firstState = await requestManagedGithubExecutionConsent._handler(
			ctx as never,
			{
				projectId: project._id,
				repositoryBindingId: repositoryBinding._id,
				acknowledgement,
			},
		);
		const secondState = await requestManagedGithubExecutionConsent._handler(
			ctx as never,
			{
				projectId: project._id,
				repositoryBindingId: repositoryBinding._id,
				acknowledgement,
			},
		);

		expect(secondState.consent?._id).toBe(firstState.consent?._id);
		expect(tables.managedGithubExecutionConsents).toHaveLength(1);
		expect(tables.managedGithubAuditEvents).toHaveLength(1);
	});

	it("revokes consent and records an audit event", async () => {
		const dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(456_000);
		const { ctx, tables, project, repositoryBinding } =
			await createProjectWithRepository();
		const requestState = await requestManagedGithubExecutionConsent._handler(
			ctx as never,
			{
				projectId: project._id,
				repositoryBindingId: repositoryBinding._id,
				acknowledgement,
			},
		);
		const consent = requestState.consent;
		if (!consent) {
			throw new Error("Expected managed GitHub consent");
		}
		dateNowSpy.mockReturnValue(457_000);

		const revokedState = await revokeManagedGithubExecutionConsent._handler(
			ctx as never,
			{
				projectId: project._id,
				consentId: consent._id,
				reason: "Customer changed their mind.",
			},
		);

		expect(revokedState.consent).toBeNull();
		expect(revokedState.auditEvents[0]).toMatchObject({
			eventType: "managed_github.revoked",
			summary: "Customer changed their mind.",
		});
		expect(tables.managedGithubAuditEvents).toHaveLength(2);
		expect(tables.managedGithubAuditEvents[1]).toMatchObject({
			eventType: "managed_github.revoked",
			summary: "Customer changed their mind.",
		});
	});

	it("rejects non-GitHub repository bindings", async () => {
		const { ctx, project, repositoryBinding } =
			await createProjectWithRepository("gitlab");

		await expect(
			requestManagedGithubExecutionConsent._handler(ctx as never, {
				projectId: project._id,
				repositoryBindingId: repositoryBinding._id,
				acknowledgement,
			}),
		).rejects.toThrow("requires a GitHub repository");
	});
});
