"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";

import type { WorkspaceFindingDocument } from "@/app/(workspace)/_lib/workspace-findings-read-model";
import {
	buildWorkspacePrivacyModel,
	type ManagedGithubExecutionState,
	type WorkspacePrivacySetupState,
	type WorkspacePrivacySyncPreviewState,
} from "@/app/(workspace)/_lib/workspace-support-read-model";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type PrivacyActionState = "idle" | "submitting" | "done" | "error";

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
	const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
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
		setFeedbackMessage(null);
		try {
			await revokeRunner({
				projectId: privacyModel.projectId as Id<"workspaceProjects">,
				runnerId: privacyModel.runnerId as Id<"workspaceRunnerBindings">,
				reason: "Revoked from workspace privacy controls",
			});
			setRevokeState("done");
			setFeedbackMessage("Runner revoked. Pair again from Setup to resume.");
		} catch (error) {
			setRevokeState("error");
			setFeedbackMessage(
				error instanceof Error ? error.message : "Unable to revoke runner.",
			);
		}
	}

	async function handleDeleteFindings() {
		if (!privacyModel.projectId || !canDeleteFindings) {
			return;
		}

		setDeleteState("submitting");
		setFeedbackMessage(null);
		try {
			await markFindingsDeleted({
				projectId: privacyModel.projectId as Id<"workspaceProjects">,
				findingDocumentIds: privacyModel.syncedFindingIds.map(
					(findingId) => findingId as Id<"codebaseFindings">,
				),
			});
			setFindings((currentFindings) =>
				currentFindings.map((finding) =>
					privacyModel.syncedFindingIds.includes(finding._id)
						? { ...finding, status: "deleted" as const }
						: finding,
				),
			);
			setDeleteState("done");
			setFeedbackMessage("Synced findings hidden from the workspace.");
		} catch (error) {
			setDeleteState("error");
			setFeedbackMessage(
				error instanceof Error
					? error.message
					: "Unable to delete synced findings.",
			);
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
		setFeedbackMessage(null);
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
			setManagedGithubState(nextManagedGithubState);
			setManagedGithubActionState("done");
			setFeedbackMessage(
				"Managed GitHub concierge request recorded. No GitHub action runs until the next explicit approval.",
			);
		} catch (error) {
			setManagedGithubActionState("error");
			setFeedbackMessage(
				error instanceof Error
					? error.message
					: "Unable to request managed GitHub.",
			);
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
		setFeedbackMessage(null);
		try {
			const nextManagedGithubState = await revokeManagedGithubConsent({
				projectId: privacyModel.projectId as Id<"workspaceProjects">,
				consentId:
					managedGithub.consentId as Id<"managedGithubExecutionConsents">,
				reason: "Revoked from workspace privacy controls",
			});
			setManagedGithubState(nextManagedGithubState);
			setManagedGithubActionState("done");
			setFeedbackMessage(
				"Managed GitHub request revoked. Concierge execution needs a new consent packet.",
			);
		} catch (error) {
			setManagedGithubActionState("error");
			setFeedbackMessage(
				error instanceof Error
					? error.message
					: "Unable to revoke managed GitHub.",
			);
		}
	}

	return {
		canDeleteFindings,
		canRevokeRunner,
		deleteState,
		feedbackMessage,
		handleDeleteFindings,
		handleRequestManagedGithub,
		handleRevokeManagedGithub,
		handleRevokeRunner,
		managedGithubActionState,
		privacyModel,
		revokeState,
	};
}
