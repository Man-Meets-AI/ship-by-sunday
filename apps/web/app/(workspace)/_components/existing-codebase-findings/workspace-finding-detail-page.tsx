"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "convex/react";

import { AppShell } from "@/app/(workspace)/_components/app-shell";
import {
	WorkspaceSourceTruthApprovalSheet,
	type WorkflowApprovalActionState,
} from "@/app/(workspace)/_components/existing-codebase-findings/workspace-source-truth-approval-sheet";
import { WorkspaceLocalNavRail } from "@/app/(workspace)/_components/workspace-navigation/workspace-local-nav-rail";
import {
	buildWorkspaceFindingDetailModel,
	type WorkspaceFindingDetailModel,
	type WorkspaceFindingDocument,
} from "@/app/(workspace)/_lib/workspace-findings-read-model";
import { buildExistingCodebaseWorkspaceLocalNavModel } from "@/app/(workspace)/_lib/workspace-setup-readiness-model";
import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type ApprovedWorkflowRunCommand = {
	workflowRunId: string;
	branchName: string;
	profileName: string;
};

export function WorkspaceFindingDetailPage({
	initialFindings,
	findingRouteId,
	projectId,
	activeRunnerId,
	approvalTimestamp,
}: {
	initialFindings: WorkspaceFindingDocument[];
	findingRouteId: string;
	projectId: string | null;
	activeRunnerId: string | null;
	approvalTimestamp: number;
}) {
	const requestWorkflowRun = useMutation(
		api.workspace.requestWorkspaceWorkflowRun,
	);
	const [actionState, setActionState] =
		useState<WorkflowApprovalActionState>("idle");
	const [approvedWorkflowRunCommand, setApprovedWorkflowRunCommand] =
		useState<ApprovedWorkflowRunCommand | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const localNavModel = useMemo(
		() => buildExistingCodebaseWorkspaceLocalNavModel("findings"),
		[],
	);
	const detail = useMemo(
		() =>
			buildWorkspaceFindingDetailModel(
				initialFindings,
				findingRouteId,
				approvalTimestamp,
			),
		[initialFindings, findingRouteId, approvalTimestamp],
	);

	async function copyEvidenceRef() {
		if (!detail) {
			return;
		}

		await navigator.clipboard?.writeText(detail.copyEvidenceRef);
		setActionState(approvedWorkflowRunCommand ? "approved" : "copied");
	}

	async function approveWorkflow() {
		if (!detail || !projectId || !activeRunnerId) {
			setActionError(
				"Pair an active local runner before creating the workflow.",
			);
			setActionState("error");
			return;
		}

		setActionError(null);
		setActionState("submitting");
		try {
			const approval = detail.workflowApproval;
			const workflowRun = await requestWorkflowRun({
				projectId: projectId as Id<"workspaceProjects">,
				findingDocumentId: detail.documentId as Id<"codebaseFindings">,
				runnerId: activeRunnerId as Id<"workspaceRunnerBindings">,
				workflowId: approval.workflowId,
				workflowVersion: approval.workflowVersion,
				branchName: approval.branchName,
				profileName: approval.profileName,
				writeLeaseDurationMinutes: approval.writeLeaseDurationMinutes,
				dirtyStatePolicy: approval.dirtyStatePolicy,
				expectedOutputs: approval.expectedOutputs,
				allowedTouchTargets: approval.allowedTouchTargets,
				disallowedTouchTargets: approval.disallowedTouchTargets,
				proofCommands: approval.proofCommands,
				syncPolicySummary: approval.syncPolicySummary,
				stopConditions: approval.stopConditions,
				rollbackNotes: approval.rollbackNotes,
			});
			setApprovedWorkflowRunCommand({
				workflowRunId: workflowRun._id,
				branchName: workflowRun.branchName ?? approval.branchName,
				profileName: workflowRun.profileName ?? approval.profileName,
			});
			setActionState("approved");
		} catch (error) {
			setActionError(error instanceof Error ? error.message : String(error));
			setActionState("error");
		}
	}

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			showSkillRail={false}
			title="Finding"
			localNav={{
				kind: "workspace",
				desktop: <WorkspaceLocalNavRail model={localNavModel} />,
			}}
		>
			<div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-3 pb-12 pt-2 sm:px-4 lg:px-6">
				{detail ? (
					<FindingDecisionContent
						detail={detail}
						projectId={projectId}
						activeRunnerId={activeRunnerId}
						actionState={actionState}
						approvedWorkflowRunCommand={approvedWorkflowRunCommand}
						actionError={actionError}
						onCopyEvidenceRef={() => void copyEvidenceRef()}
						onApproveWorkflow={() => void approveWorkflow()}
					/>
				) : (
					<FindingUnavailable />
				)}
			</div>
		</AppShell>
	);
}

function FindingDecisionContent({
	detail,
	projectId,
	activeRunnerId,
	actionState,
	approvedWorkflowRunCommand,
	actionError,
	onCopyEvidenceRef,
	onApproveWorkflow,
}: {
	detail: WorkspaceFindingDetailModel;
	projectId: string | null;
	activeRunnerId: string | null;
	actionState: WorkflowApprovalActionState;
	approvedWorkflowRunCommand: ApprovedWorkflowRunCommand | null;
	actionError: string | null;
	onCopyEvidenceRef: () => void;
	onApproveWorkflow: () => void;
}) {
	return (
		<>
			<header className="border-b border-border/60 pb-5">
				<div className="min-w-0">
					<Button
						asChild
						variant="ghost"
						size="sm"
						className="-ml-2 mb-3 w-fit"
					>
						<Link href={routeConfig.workspaceFindings}>
							<ArrowLeft className="size-3.5" aria-hidden />
							Back to findings
						</Link>
					</Button>
					<p className="text-sm font-medium text-muted-foreground">
						Finding {detail.rankLabel}
					</p>
					<h1 className="mt-2 max-w-4xl break-words font-heading-serif text-4xl leading-none tracking-[-0.04em] text-foreground sm:text-5xl">
						{detail.title}
					</h1>
					<p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
						{detail.buyerImpact}
					</p>
				</div>
			</header>

			<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.36fr)] lg:items-start">
				<div className="grid min-w-0 gap-5">
					<DecisionSection title="Decision context">
						<KeyValueGrid
							items={[
								["Category", detail.categoryLabel],
								["Severity", detail.severityLabel],
								["Confidence", detail.confidenceLabel],
								["Status", detail.statusLabel],
								["Proof path", detail.proofPath],
								["Proofability", detail.proofabilityLabel],
								["Permission", detail.permissionRequiredLabel],
								["Workflow", detail.recommendedWorkflowLabel],
							]}
						/>
					</DecisionSection>
					<DecisionSection title="Why now">
						<p className="text-sm leading-6 text-muted-foreground">
							{detail.whyNow}
						</p>
					</DecisionSection>
					<DecisionSection title="Evidence refs">
						<div className="divide-y divide-border/60">
							{detail.evidenceRefs.map((ref) => (
								<div key={ref.id} className="grid gap-1 py-3 first:pt-0">
									<p className="text-xs font-medium text-muted-foreground">
										{ref.kindLabel}
									</p>
									<p className="break-words font-mono text-xs text-foreground">
										{ref.refLabel}
									</p>
								</div>
							))}
						</div>
					</DecisionSection>
				</div>
				<WorkspaceSourceTruthApprovalSheet
					detail={detail}
					projectId={projectId}
					activeRunnerId={activeRunnerId}
					actionState={actionState}
					approvedWorkflowRunCommand={approvedWorkflowRunCommand}
					actionError={actionError}
					onApproveWorkflow={onApproveWorkflow}
					onCopyEvidenceRef={onCopyEvidenceRef}
				/>
			</div>
		</>
	);
}

function DecisionSection({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<section className="rounded-xl border border-border/60 bg-background p-5">
			<h2 className="text-base font-semibold text-foreground">{title}</h2>
			<div className="mt-4">{children}</div>
		</section>
	);
}

function KeyValueGrid({ items }: { items: Array<[string, string]> }) {
	return (
		<div className="grid gap-3 sm:grid-cols-2">
			{items.map(([label, value]) => (
				<div key={label} className="min-w-0">
					<p className="text-xs font-medium text-muted-foreground">{label}</p>
					<p className="mt-1 break-words text-sm text-foreground">{value}</p>
				</div>
			))}
		</div>
	);
}

function FindingUnavailable() {
	return (
		<section className="rounded-xl border border-border/60 bg-background p-5">
			<h1 className="font-heading-serif text-4xl leading-none tracking-[-0.04em] text-foreground">
				Finding unavailable
			</h1>
			<p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
				This finding is not in the approved workspace ledger.
			</p>
			<Button asChild className="mt-4" size="sm">
				<Link href={routeConfig.workspaceFindings}>Back to findings</Link>
			</Button>
		</section>
	);
}
