"use client";

import { useMemo } from "react";

import { AppShell } from "@/app/(protected)/_components/app-shell";
import { WorkspaceLocalNavRail } from "@/app/(protected)/_components/workspace-navigation/workspace-local-nav-rail";
import {
	WorkspaceOperatorSummaryCard,
	type WorkspaceOperatorSummaryRow,
} from "@/app/(protected)/_components/workspace-operator-summary-card";
import type { WorkspaceFindingDocument } from "@/app/(protected)/_lib/workspace-findings-read-model";
import { buildExistingCodebaseWorkspaceLocalNavModel } from "@/app/(protected)/_lib/workspace-setup-readiness-model";
import type {
	ManagedGithubExecutionState,
	WorkspacePrivacyModel,
	WorkspacePrivacySetupState,
	WorkspacePrivacySyncPreviewState,
} from "@/app/(protected)/_lib/workspace-support-read-model";
import { PrivacyActionPanel } from "./workspace-privacy-action-panel";
import {
	PrivacySharingPanel,
	PrivacyStatusPanel,
	PrivacySyncPreviewPanel,
} from "./workspace-privacy-panels";
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
		handleRevokeRunner,
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
							Privacy controls
						</h1>
						<p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
							Verify runner pairing, sync boundaries, and hosted-state controls
							before approving local evidence.
						</p>
					</div>
					<WorkspaceOperatorSummaryCard
						title="Privacy summary"
						rows={buildPrivacySummaryRows(privacyModel)}
					/>
				</header>

				<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.36fr)] lg:items-start">
					<div className="grid gap-5">
						<PrivacyStatusPanel privacyModel={privacyModel} />
						<PrivacySharingPanel rows={privacyModel.sharingRows} />
						<PrivacySyncPreviewPanel privacyModel={privacyModel} />
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

function buildPrivacySummaryRows(
	privacyModel: WorkspacePrivacyModel,
): WorkspaceOperatorSummaryRow[] {
	const rows: WorkspaceOperatorSummaryRow[] = [
		{ label: "Project", value: privacyModel.projectLabel },
		{ label: "Repo", value: privacyModel.repositoryLabel },
		{ label: "Runner", value: privacyModel.runnerIdentityLabel },
	];

	if (privacyModel.runnerId) {
		rows.push({
			label: "Runner ID",
			value: privacyModel.runnerId,
			copyValue: privacyModel.runnerId,
			mono: true,
		});
	}

	rows.push(
		{ label: "State", value: privacyModel.runnerHealthLabel },
		{ label: "Sync", value: privacyModel.lastSyncPreviewLabel },
		{
			label: "Findings",
			value: privacyModel.structuredFindingsCountLabel,
			mono: true,
		},
		{ label: "Next", value: getPrivacyNextAction(privacyModel) },
	);

	return rows;
}

function getPrivacyNextAction(privacyModel: WorkspacePrivacyModel) {
	if (privacyModel.runnerHealthLabel.toLowerCase().includes("blocked")) {
		return "Open Setup";
	}
	if (privacyModel.lastSyncPreviewLabel === "Uploaded") {
		return "Open Findings";
	}
	if (privacyModel.lastSyncPreviewLabel === "Ready") {
		return "Approve findings upload";
	}
	return "Keep local runner paired";
}
