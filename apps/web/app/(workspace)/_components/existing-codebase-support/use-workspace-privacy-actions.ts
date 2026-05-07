"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";

import type { WorkspaceFindingDocument } from "@/app/(workspace)/_lib/workspace-findings-read-model";
import {
	showWorkspaceActionErrorToast,
	showWorkspaceActionSuccessToast,
} from "@/app/(workspace)/_lib/workspace-action-feedback";
import {
	buildWorkspacePrivacyModel,
	type ManagedGithubExecutionState,
	type WorkspacePrivacySetupState,
	type WorkspacePrivacySyncPreviewState,
} from "@/app/(workspace)/_lib/workspace-support-read-model";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
	getSupportModeBlockedMutationMessage,
	isSupportModeBlockedMutationResult,
} from "@/platform/admin-impersonation";

type PrivacyActionState = "idle" | "submitting" | "done" | "error";

const workspacePrivacyToastIds = {
	revokeRunnerSuccess: "workspace-privacy-revoke-runner-success",
	revokeRunnerError: "workspace-privacy-revoke-runner-error",
	deleteFindingsSuccess: "workspace-privacy-delete-findings-success",
	deleteFindingsError: "workspace-privacy-delete-findings-error",
	requestManagedGithubSuccess:
		"workspace-privacy-request-managed-github-success",
	requestManagedGithubError: "workspace-privacy-request-managed-github-error",
	revokeManagedGithubSuccess: "workspace-privacy-revoke-managed-github-success",
	revokeManagedGithubError: "workspace-privacy-revoke-managed-github-error",
} as const;

export function useWorkspacePrivacyActions({
	initialSetupState,
	initialSyncPreviewState,
	initialManagedGithubState,
	initialFindings,
	now,
}: {
	initialSetupState: WorkspacePrivacySetupState;
	initialSyncPreviewState: WorkspacePrivacySyncPreviewState;
	initialManagedGithubState: ManagedGithubExecutionState;
	initialFindings: WorkspaceFindingDocument[];
	now?: number;
}) {
	const router = useRouter();
	const revokeRunner = useMutation(api.workspace.revokeWorkspaceRunner);
	const markFindingsDeleted = useMutation(
		api.workspace.markWorkspaceFindingsDeleted,
	);
	const requestManagedGithubConsent = useMutation(
		api.workspace.requestManagedGithubExecutionConsent,
	);
	const revokeManagedGithubConsent = useMutation(
		api.workspace.revokeManagedGithubExecutionConsent,
	);
	const [findings, setFindings] = useState(initialFindings);
	const [managedGithubState, setManagedGithubState] = useState(
		initialManagedGithubState,
	);
	const [revokeState, setRevokeState] = useState<PrivacyActionState>("idle");
	const [deleteState, setDeleteState] = useState<PrivacyActionState>("idle");
	const [managedGithubActionState, setManagedGithubActionState] =
		useState<PrivacyActionState>("idle");
	const privacyModel = useMemo(
		() =>
			buildWorkspacePrivacyModel({
				setupState: initialSetupState,
				syncPreviewState: initialSyncPreviewState,
				managedGithubState,
				findings,
				now,
			}),
		[
			initialSetupState,
			initialSyncPreviewState,
			managedGithubState,
			findings,
			now,
		],
	);
	const canRevokeRunner =
		privacyModel.canRevokeRunner && revokeState !== "done";
	const canDeleteFindings =
		privacyModel.canDeleteSyncedFindings && deleteState !== "done";

	async function handleRevokeRunner() {
		if (!privacyModel.projectId || !privacyModel.runnerId || !canRevokeRunner) {
			return;
		}

		setRevokeState("submitting");
		try {
			const revokeResult = await revokeRunner({
				projectId: privacyModel.projectId as Id<"workspaceProjects">,
				runnerId: privacyModel.runnerId as Id<"workspaceRunnerBindings">,
				reason: "Revoked from workspace privacy controls",
			});
			if (isSupportModeBlockedMutationResult(revokeResult)) {
				throw new Error(getSupportModeBlockedMutationMessage());
			}
			setRevokeState("done");
			showWorkspaceActionSuccessToast({
				action: {
					label: "Open Setup",
					onClick: () => router.push(routeConfig.workspaceSetup),
				},
				id: workspacePrivacyToastIds.revokeRunnerSuccess,
				title: "Runner revoked",
				description: "Pair again from Setup to resume.",
			});
		} catch (error) {
			setRevokeState("error");
			showWorkspaceActionErrorToast({
				id: workspacePrivacyToastIds.revokeRunnerError,
				error,
				fallbackMessage: "Unable to revoke runner.",
				report: {
					title: "Workspace privacy runner revoke failed",
					code: "workspace_privacy_runner_revoke_failed",
					pathname: routeConfig.workspacePrivacy,
					details: {
						action: "revoke_runner",
					},
				},
			});
		}
	}

	async function handleDeleteFindings() {
		if (!privacyModel.projectId || !canDeleteFindings) {
			return;
		}

		setDeleteState("submitting");
		try {
			const deleteResult = await markFindingsDeleted({
				projectId: privacyModel.projectId as Id<"workspaceProjects">,
				findingDocumentIds: privacyModel.syncedFindingIds.map(
					(findingId) => findingId as Id<"codebaseFindings">,
				),
			});
			if (isSupportModeBlockedMutationResult(deleteResult)) {
				throw new Error(getSupportModeBlockedMutationMessage());
			}
			setFindings((currentFindings) =>
				currentFindings.map((finding) =>
					privacyModel.syncedFindingIds.includes(finding._id)
						? { ...finding, status: "deleted" as const }
						: finding,
				),
			);
			setDeleteState("done");
			showWorkspaceActionSuccessToast({
				action: {
					label: "View findings",
					onClick: () => router.push(routeConfig.workspaceFindings),
				},
				id: workspacePrivacyToastIds.deleteFindingsSuccess,
				title: "Findings hidden",
			});
		} catch (error) {
			setDeleteState("error");
			showWorkspaceActionErrorToast({
				id: workspacePrivacyToastIds.deleteFindingsError,
				error,
				fallbackMessage: "Unable to delete synced findings.",
				report: {
					title: "Workspace privacy synced findings delete failed",
					code: "workspace_privacy_synced_findings_delete_failed",
					pathname: routeConfig.workspacePrivacy,
					details: {
						action: "delete_synced_findings",
					},
				},
			});
		}
	}

	async function handleRequestManagedGithub() {
		const managedGithub = privacyModel.managedGithub;
		if (
			!privacyModel.projectId ||
			!managedGithub.repositoryBindingId ||
			!managedGithub.canRequest
		) {
			return;
		}

		setManagedGithubActionState("submitting");
		try {
			const nextManagedGithubState = await requestManagedGithubConsent({
				projectId: privacyModel.projectId as Id<"workspaceProjects">,
				repositoryBindingId:
					managedGithub.repositoryBindingId as Id<"workspaceRepositoryBindings">,
				acknowledgement: {
					repoAccess: true,
					installationScope: true,
					storagePolicy: true,
					prAuthority: true,
					auditLog: true,
					revocation: true,
					rawSourceVisibility: true,
					proofBoundaries: true,
				},
			});
			if (isSupportModeBlockedMutationResult(nextManagedGithubState)) {
				throw new Error(getSupportModeBlockedMutationMessage());
			}
			setManagedGithubState(nextManagedGithubState);
			setManagedGithubActionState("done");
			showWorkspaceActionSuccessToast({
				id: workspacePrivacyToastIds.requestManagedGithubSuccess,
				title: "Managed GitHub request recorded",
				description: "No GitHub action runs until the next explicit approval.",
			});
		} catch (error) {
			setManagedGithubActionState("error");
			showWorkspaceActionErrorToast({
				id: workspacePrivacyToastIds.requestManagedGithubError,
				error,
				fallbackMessage: "Unable to request managed GitHub.",
				report: {
					title: "Workspace privacy managed GitHub request failed",
					code: "workspace_privacy_managed_github_request_failed",
					pathname: routeConfig.workspacePrivacy,
					details: {
						action: "request_managed_github",
					},
				},
			});
		}
	}

	async function handleRevokeManagedGithub() {
		const managedGithub = privacyModel.managedGithub;
		if (
			!privacyModel.projectId ||
			!managedGithub.consentId ||
			!managedGithub.canRevoke
		) {
			return;
		}

		setManagedGithubActionState("submitting");
		try {
			const nextManagedGithubState = await revokeManagedGithubConsent({
				projectId: privacyModel.projectId as Id<"workspaceProjects">,
				consentId:
					managedGithub.consentId as Id<"managedGithubExecutionConsents">,
				reason: "Revoked from workspace privacy controls",
			});
			if (isSupportModeBlockedMutationResult(nextManagedGithubState)) {
				throw new Error(getSupportModeBlockedMutationMessage());
			}
			setManagedGithubState(nextManagedGithubState);
			setManagedGithubActionState("done");
			showWorkspaceActionSuccessToast({
				id: workspacePrivacyToastIds.revokeManagedGithubSuccess,
				title: "Managed GitHub request revoked",
				description: "Concierge execution needs a new consent packet.",
			});
		} catch (error) {
			setManagedGithubActionState("error");
			showWorkspaceActionErrorToast({
				id: workspacePrivacyToastIds.revokeManagedGithubError,
				error,
				fallbackMessage: "Unable to revoke managed GitHub.",
				report: {
					title: "Workspace privacy managed GitHub revoke failed",
					code: "workspace_privacy_managed_github_revoke_failed",
					pathname: routeConfig.workspacePrivacy,
					details: {
						action: "revoke_managed_github",
					},
				},
			});
		}
	}

	return {
		canDeleteFindings,
		canRevokeRunner,
		deleteState,
		handleDeleteFindings,
		handleRequestManagedGithub,
		handleRevokeManagedGithub,
		handleRevokeRunner,
		managedGithubActionState,
		privacyModel,
		revokeState,
	};
}
