"use client";

import Link from "next/link";
import {
	AlertTriangle,
	Clipboard,
	GitBranchPlus,
	Terminal,
} from "lucide-react";

import type { WorkspaceFindingDetailModel } from "@/app/(protected)/_lib/workspace-findings-read-model";
import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";

export type WorkflowApprovalActionState =
	| "idle"
	| "copied"
	| "submitting"
	| "approved"
	| "error";

export function WorkspaceSourceTruthApprovalSheet({
	detail,
	projectId,
	activeRunnerId,
	actionState,
	approvedWorkflowRunCommand,
	actionError,
	onApproveWorkflow,
	onCopyEvidenceRef,
}: {
	detail: WorkspaceFindingDetailModel;
	projectId: string | null;
	activeRunnerId: string | null;
	actionState: WorkflowApprovalActionState;
	approvedWorkflowRunCommand: {
		workflowRunId: string;
		branchName: string;
		profileName: string;
	} | null;
	actionError: string | null;
	onApproveWorkflow: () => void;
	onCopyEvidenceRef: () => void;
}) {
	const approval = detail.workflowApproval;
	const canApprove = Boolean(projectId && activeRunnerId);
	const approvalButtonDisabled =
		!canApprove || actionState === "submitting" || actionState === "approved";
	const isBrokenAppReadOnly = approval.workflowKind === "broken_app_readonly";
	const isObservabilityAudit =
		approval.workflowKind === "observability_debuggability";
	const workflowActionState = getWorkflowActionState(detail);
	const primaryCommand = approvedWorkflowRunCommand
		? buildWorkflowCommand({
				packageRunner: "bunx",
				approval,
				approvedWorkflowRunCommand,
			})
		: null;
	const fallbackCommand = approvedWorkflowRunCommand
		? buildWorkflowCommand({
				packageRunner: "npx",
				approval,
				approvedWorkflowRunCommand,
			})
		: null;
	const primaryActionLabel = getPrimaryActionLabel(approval.workflowKind);

	return (
		<aside className="grid gap-5 lg:sticky lg:top-20">
			<section className="rounded-xl border border-border/60 bg-background p-5">
				<h2 className="text-base font-semibold text-foreground">
					Workflow approval
				</h2>
				<p className="mt-2 text-sm leading-6 text-muted-foreground">
					{isBrokenAppReadOnly
						? "Approve the bounded packet, then run read-only diagnostics locally before any patch is allowed."
						: isObservabilityAudit
							? "Approve the bounded packet, then run the local observability audit without changing runtime code or provider setup."
							: "Approve the bounded packet, then run the local command to create the branch and proof."}
				</p>

				<div className="mt-4 grid gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
					<ApprovalFact label="Branch" value={approval.branchName} mono />
					<ApprovalFact label="Profile" value={approval.profileName} />
					<ApprovalFact
						label="Write lease"
						value={`${approval.writeLeaseDurationMinutes} minutes`}
					/>
				</div>

				{workflowActionState.kind === "ready" ? (
					<div className="mt-4 grid gap-2">
						<Button
							type="button"
							onClick={onApproveWorkflow}
							disabled={approvalButtonDisabled}
							className="justify-center"
						>
							<GitBranchPlus className="size-4" aria-hidden />
							{getPrimaryButtonLabel({
								actionState,
								primaryActionLabel,
							})}
						</Button>
						<SecondaryWorkflowActions onCopyEvidenceRef={onCopyEvidenceRef} />
					</div>
				) : (
					<UnavailableWorkflowActionPanel
						state={workflowActionState}
						onCopyEvidenceRef={onCopyEvidenceRef}
					/>
				)}

				{workflowActionState.kind === "ready" && !canApprove ? (
					<SheetStatus tone="warning">
						Pair an active local runner before creating the workflow branch.
					</SheetStatus>
				) : null}
				{workflowActionState.kind === "ready" &&
				actionState === "error" &&
				actionError ? (
					<SheetStatus tone="warning">{actionError}</SheetStatus>
				) : null}
				{actionState === "approved" && primaryCommand && fallbackCommand ? (
					<div
						className="mt-4 grid gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
						role="status"
					>
						<div className="flex items-start gap-2">
							<Terminal className="mt-0.5 size-4 text-foreground" aria-hidden />
							<p className="text-sm leading-6 text-muted-foreground">
								{isBrokenAppReadOnly
									? "Run one of these in the paired repo. This command writes local .sbs proof only; it does not patch source files, push a branch, or open a PR."
									: isObservabilityAudit
										? "Run one of these in the paired repo. This command writes local .sbs audit proof only; it does not edit runtime code, configure providers, push a branch, or open a PR."
										: "Run one of these in the paired repo. No branch is pushed and no PR is opened by this command."}
							</p>
						</div>
						<CommandBlock command={primaryCommand} />
						<CommandBlock command={fallbackCommand} />
					</div>
				) : null}
			</section>
		</aside>
	);
}

type WorkflowActionState =
	| { kind: "ready" }
	| {
			kind: "unavailable";
			buttonLabel: string;
			description: string;
			reason: string | null;
			title: string;
	  };

function getWorkflowActionState(
	detail: WorkspaceFindingDetailModel,
): WorkflowActionState {
	switch (detail.status) {
		case "ready":
			if (!detail.workflowApproval.isSupportedByLocalRunner) {
				return {
					kind: "unavailable",
					title: "Workflow unavailable",
					buttonLabel: "Workflow unavailable",
					description:
						"This workflow is not available in the local runner yet.",
					reason: detail.workflowApproval.workflowId,
				};
			}
			return { kind: "ready" };
		case "blocked":
			return {
				kind: "unavailable",
				title: "Workflow blocked",
				buttonLabel: "Workflow blocked",
				description:
					"This finding is blocked. Resolve the blocker before starting a workflow.",
				reason: detail.blockedReason,
			};
		case "needs_approval":
			return {
				kind: "unavailable",
				title: "Approval needed",
				buttonLabel: "Waiting for approval",
				description:
					"This finding still needs approval. Approve the finding before starting a workflow.",
				reason: detail.blockedReason,
			};
		case "running":
			return {
				kind: "unavailable",
				title: "Workflow already running",
				buttonLabel: "Workflow running",
				description:
					"A workflow is already running for this finding. Review the current run state before starting another workflow.",
				reason: detail.blockedReason,
			};
		case "done":
			return {
				kind: "unavailable",
				title: "Workflow completed",
				buttonLabel: "Workflow completed",
				description:
					"This finding already has completed proof. Review Runs before starting any deliberate rerun.",
				reason: detail.blockedReason,
			};
	}
}

function getPrimaryButtonLabel({
	actionState,
	primaryActionLabel,
}: {
	actionState: WorkflowApprovalActionState;
	primaryActionLabel: string;
}) {
	if (actionState === "submitting") {
		return "Creating workflow run";
	}
	if (actionState === "approved") {
		return "Workflow run approved";
	}
	return primaryActionLabel;
}

function UnavailableWorkflowActionPanel({
	state,
	onCopyEvidenceRef,
}: {
	state: Extract<WorkflowActionState, { kind: "unavailable" }>;
	onCopyEvidenceRef: () => void;
}) {
	return (
		<div className="mt-4 grid gap-3">
			<Button type="button" disabled className="justify-center">
				<GitBranchPlus className="size-4" aria-hidden />
				{state.buttonLabel}
			</Button>
			<div
				className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
				role="status"
			>
				<p className="text-sm font-medium text-foreground">{state.title}</p>
				<p className="mt-1 text-sm leading-6 text-muted-foreground">
					{state.description}
				</p>
				{state.reason ? (
					<p className="mt-2 break-words text-sm leading-6 text-muted-foreground">
						Reason: {state.reason}
					</p>
				) : null}
			</div>
			<SecondaryWorkflowActions onCopyEvidenceRef={onCopyEvidenceRef} />
		</div>
	);
}

function SecondaryWorkflowActions({
	onCopyEvidenceRef,
}: {
	onCopyEvidenceRef: () => void;
}) {
	return (
		<>
			<Button
				type="button"
				variant="outline"
				className="justify-center"
				onClick={onCopyEvidenceRef}
			>
				<Clipboard className="size-4" aria-hidden />
				Copy local evidence ref
			</Button>
			<Button asChild variant="ghost" className="justify-center">
				<Link href={routeConfig.workspaceFindings}>Not now</Link>
			</Button>
		</>
	);
}

function buildWorkflowCommand({
	packageRunner,
	approval,
	approvedWorkflowRunCommand,
}: {
	packageRunner: "bunx" | "npx";
	approval: WorkspaceFindingDetailModel["workflowApproval"];
	approvedWorkflowRunCommand: {
		workflowRunId: string;
		branchName: string;
		profileName: string;
	};
}) {
	return [
		packageRunner,
		"ship-by-sunday",
		"workflow",
		approval.workflowCommandName,
		"run",
		"--workflow-run-id",
		approvedWorkflowRunCommand.workflowRunId,
		"--branch-name",
		approvedWorkflowRunCommand.branchName,
		"--profile",
		approvedWorkflowRunCommand.profileName,
		...approval.confirmationFlags,
	]
		.map(shellQuote)
		.join(" ");
}

function shellQuote(value: string) {
	if (/^[A-Za-z0-9_./:=@-]+$/.test(value)) {
		return value;
	}
	return `'${value.replaceAll("'", "'\\''")}'`;
}

function getPrimaryActionLabel(
	workflowKind: WorkspaceFindingDetailModel["workflowApproval"]["workflowKind"],
) {
	if (workflowKind === "broken_app_readonly") {
		return "Run read-only diagnostics";
	}
	if (workflowKind === "observability_debuggability") {
		return "Run observability audit";
	}
	if (workflowKind === "docs_operating_system_adoption") {
		return "Run docs tooling dry run";
	}
	return "Create branch and run workflow";
}

function ApprovalFact({
	label,
	value,
	mono,
}: {
	label: string;
	value: string;
	mono?: boolean;
}) {
	return (
		<div className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] items-start gap-3">
			<p className="text-xs font-medium text-muted-foreground">{label}</p>
			<p
				className={
					mono
						? "break-words font-mono text-xs text-foreground"
						: "break-words text-sm text-foreground"
				}
			>
				{value}
			</p>
		</div>
	);
}

function CommandBlock({ command }: { command: string }) {
	return (
		<code className="block break-words rounded-md border border-border/60 bg-background px-3 py-2 font-mono text-xs text-foreground">
			{command}
		</code>
	);
}

function SheetStatus({
	children,
	tone,
}: {
	children: string;
	tone: "neutral" | "warning";
}) {
	return (
		<div
			className="mt-4 flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm leading-6 text-muted-foreground"
			role="status"
		>
			{tone === "warning" ? (
				<AlertTriangle
					className="mt-1 size-3.5 shrink-0 text-foreground"
					aria-hidden
				/>
			) : null}
			<span>{children}</span>
		</div>
	);
}
