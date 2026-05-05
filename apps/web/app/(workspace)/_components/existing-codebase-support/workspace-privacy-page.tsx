"use client";

import { useMemo } from "react";

import { AppShell } from "@/app/(workspace)/_components/app-shell";
import { WorkspaceLocalNavRail } from "@/app/(workspace)/_components/workspace-navigation/workspace-local-nav-rail";
import type { WorkspaceFindingDocument } from "@/app/(workspace)/_lib/workspace-findings-read-model";
import { buildExistingCodebaseWorkspaceLocalNavModel } from "@/app/(workspace)/_lib/workspace-setup-readiness-model";
import type {
	ManagedGithubExecutionState,
	WorkspacePrivacySetupState,
	WorkspacePrivacySyncPreviewState,
} from "@/app/(workspace)/_lib/workspace-support-read-model";
import { PrivacyActionPanel } from "./workspace-privacy-action-panel";
import {
	ExecutionSurfacesPanel,
	ManagedGithubPanel,
	PrivacySharingPanel,
	PrivacyStatusPanel,
	PrivacySyncPreviewPanel,
} from "./workspace-privacy-panels";
import { WorkspaceSupportFact } from "./workspace-support-shared";
import { useWorkspacePrivacyActions } from "./use-workspace-privacy-actions";

export function WorkspacePrivacyPage({
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
	const localNavModel = useMemo(
		() => buildExistingCodebaseWorkspaceLocalNavModel("privacy"),
		[],
	);
	const {
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
	} = useWorkspacePrivacyActions({
		initialSetupState,
		initialSyncPreviewState,
		initialManagedGithubState,
		initialFindings,
		now,
	});

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			showSkillRail={false}
			title="Privacy"
			localNav={{
				kind: "workspace",
				desktop: <WorkspaceLocalNavRail model={localNavModel} />,
			}}
		>
			<div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-3 pb-12 pt-2 sm:px-4 lg:px-6">
				<header className="grid gap-4 border-b border-border/60 pb-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.34fr)]">
					<div className="min-w-0">
						<p className="text-sm font-medium text-muted-foreground">Privacy</p>
						<h1 className="mt-2 font-heading-serif text-4xl leading-none tracking-[-0.04em] text-foreground sm:text-5xl">
							Local execution controls
						</h1>
						<p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
							Review what is paired, what can sync, and which local artifacts
							stay on the customer machine.
						</p>
					</div>
					<div className="grid gap-2 rounded-xl border border-border/60 bg-background p-4 text-sm">
						<WorkspaceSupportFact
							label="Project"
							value={privacyModel.projectLabel}
						/>
						<WorkspaceSupportFact
							label="Repository"
							value={privacyModel.repositoryLabel}
						/>
						<WorkspaceSupportFact
							label="Runner"
							value={privacyModel.runnerIdentityLabel}
						/>
					</div>
				</header>

				<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.36fr)] lg:items-start">
					<div className="grid gap-5">
						<PrivacyStatusPanel privacyModel={privacyModel} />
						<ExecutionSurfacesPanel rows={privacyModel.executionSurfaceRows} />
						<PrivacySharingPanel rows={privacyModel.sharingRows} />
						<PrivacySyncPreviewPanel privacyModel={privacyModel} />
						<ManagedGithubPanel
							privacyModel={privacyModel}
							actionState={managedGithubActionState}
							onRequest={() => void handleRequestManagedGithub()}
							onRevoke={() => void handleRevokeManagedGithub()}
						/>
					</div>
					<aside className="grid gap-5 lg:sticky lg:top-20">
						<PrivacyActionPanel
							canRevokeRunner={canRevokeRunner && revokeState !== "submitting"}
							canDeleteFindings={
								canDeleteFindings && deleteState !== "submitting"
							}
							revokeButtonLabel={
								revokeState === "submitting"
									? "Revoking runner"
									: "Revoke runner"
							}
							deleteButtonLabel={
								deleteState === "submitting"
									? "Deleting synced findings"
									: "Delete synced findings"
							}
							localReportDeletionNote={privacyModel.localReportDeletionNote}
							onRevokeRunner={() => void handleRevokeRunner()}
							onDeleteFindings={() => void handleDeleteFindings()}
						/>
					</aside>
				</div>
			</div>
		</AppShell>
	);
}
