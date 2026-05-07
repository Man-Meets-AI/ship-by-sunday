"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { showWorkspaceActionSuccessToast } from "@/app/(workspace)/_lib/workspace-action-feedback";
import { buildExistingCodebaseWorkspaceLocalNavModel } from "@/app/(workspace)/_lib/workspace-setup-readiness-model";
import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
	getSupportModeBlockedMutationMessage,
	isSupportModeBlockedMutationResult,
} from "@/platform/admin-impersonation";

type ApprovedWorkflowRunCommand = {
	workflowRunId: string;
	branchName: string;
	profileName: string;
};

const workspaceFindingDetailToastIds = {
	copyEvidenceRefSuccess: "workspace-finding-detail-copy-evidence-ref-success",
} as const;

type UnavailableWorkflowStatus =
	| Exclude<WorkspaceFindingDetailModel["status"], "ready">
	| "deleted";

const unavailableWorkflowMessages = {
	blocked:
		"This finding is blocked. Resolve the blocker before starting a workflow.",
	deleted:
		"This finding is no longer available. Return to Findings and choose another item.",
	done: "This finding already has completed proof. Review Runs before starting any deliberate rerun.",
	needs_approval:
		"This finding still needs approval. Approve the finding before starting a workflow.",
	running:
		"A workflow is already running for this finding. Review the current run state before starting another workflow.",
	unsupported: "This workflow is not available in the local runner yet.",
} as const satisfies Record<UnavailableWorkflowStatus | "unsupported", string>;

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
	const router = useRouter();
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
		showWorkspaceActionSuccessToast({
			action: {
				label: "View runs",
				onClick: () => router.push(routeConfig.workspaceRuns),
			},
			id: workspaceFindingDetailToastIds.copyEvidenceRefSuccess,
			title: "Local evidence ref copied.",
			description: "Use Runs to match this ref to the local report history.",
		});
	}

	async function approveWorkflow() {
		if (!detail) {
			return;
		}

		if (detail.status !== "ready") {
			setActionError(getUnavailableWorkflowMessage(detail));
			setActionState("error");
			return;
		}

		if (!detail.workflowApproval.isSupportedByLocalRunner) {
			setActionError(unavailableWorkflowMessages.unsupported);
			setActionState("error");
			return;
		}

		if (!projectId || !activeRunnerId) {
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
				installProfile: approval.installProfile,
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
			if (isSupportModeBlockedMutationResult(workflowRun)) {
				throw new Error(getSupportModeBlockedMutationMessage());
			}
			setApprovedWorkflowRunCommand({
				workflowRunId: workflowRun._id,
				branchName: workflowRun.branchName ?? approval.branchName,
				profileName: workflowRun.profileName ?? approval.profileName,
			});
			setActionState("approved");
		} catch (error) {
			setActionError(getWorkflowRequestErrorMessage(error));
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
					<DecisionSection title="Workflow bounds">
						<WorkflowBoundsGrid approval={detail.workflowApproval} />
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

function WorkflowBoundsGrid({
	approval,
}: {
	approval: WorkspaceFindingDetailModel["workflowApproval"];
}) {
	return (
		<div className="grid overflow-hidden rounded-lg border border-border/60 sm:grid-cols-2 xl:grid-cols-3">
			<WorkflowBoundsGroup
				title="Expected outputs"
				items={approval.expectedOutputs}
			/>
			<WorkflowBoundsGroup
				title="Allowed touch targets"
				items={approval.allowedTouchTargets}
			/>
			<WorkflowBoundsGroup
				title="Disallowed touch targets"
				items={approval.disallowedTouchTargets}
			/>
			<WorkflowBoundsGroup
				title="Proof commands"
				items={approval.proofCommands}
				mono
			/>
			<WorkflowBoundsGroup
				title="Stop conditions"
				items={approval.stopConditions}
			/>
			<WorkflowBoundsGroup
				title="Sync and rollback"
				items={[approval.syncPolicySummary, approval.rollbackNotes]}
			/>
		</div>
	);
}

function WorkflowBoundsGroup({
	title,
	items,
	mono,
}: {
	title: string;
	items: string[];
	mono?: boolean;
}) {
	return (
		<div className="min-w-0 border-border/60 p-3 sm:border-r sm:border-b xl:[&:nth-child(3n)]:border-r-0 xl:[&:nth-last-child(-n+3)]:border-b-0">
			<h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
			<ul className="mt-2 flex flex-wrap gap-1.5">
				{items.map((item) => (
					<li
						key={item}
						className={
							mono
								? "max-w-full rounded-md bg-muted px-2 py-1 font-mono text-xs leading-5 text-foreground"
								: "max-w-full rounded-md bg-muted px-2 py-1 text-xs leading-5 text-foreground"
						}
					>
						<span className="break-words">{item}</span>
					</li>
				))}
			</ul>
		</div>
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

function getUnavailableWorkflowMessage(detail: WorkspaceFindingDetailModel) {
	if (detail.status === "ready") {
		return null;
	}
	return unavailableWorkflowMessages[detail.status];
}

function getWorkflowRequestErrorMessage(error: unknown) {
	const message = error instanceof Error ? error.message : String(error);
	if (message.includes("Blocked findings cannot start workflows")) {
		return unavailableWorkflowMessages.blocked;
	}
	if (
		message.includes("Finding is deleted") ||
		message.includes("Finding not found")
	) {
		return unavailableWorkflowMessages.deleted;
	}
	if (message.includes("paired workspace runner")) {
		return "Pair an active local runner before creating the workflow.";
	}
	if (
		message.includes("Workflow is not supported") ||
		message.includes("Workflow must match")
	) {
		return unavailableWorkflowMessages.unsupported;
	}
	return "Workflow request failed. Review the finding status and try again.";
}
