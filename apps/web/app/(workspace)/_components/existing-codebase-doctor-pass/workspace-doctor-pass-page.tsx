"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
	CheckCircle2,
	Circle,
	CircleAlert,
	FileJson,
	ListChecks,
	ShieldCheck,
	Upload,
} from "lucide-react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";

import { AppShell } from "@/app/(workspace)/_components/app-shell";
import {
	doctorPassDetailsPanelId,
	doctorPassPreviewPanelId,
} from "@/app/(workspace)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-panels";
import { WorkspaceLocalNavRail } from "@/app/(workspace)/_components/workspace-navigation/workspace-local-nav-rail";
import {
	WorkspaceOperatorSummaryCard,
	type WorkspaceOperatorSummaryRow,
} from "@/app/(workspace)/_components/workspace-operator-summary-card";
import {
	showWorkspaceActionErrorToast,
	showWorkspaceActionSuccessToast,
} from "@/app/(workspace)/_lib/workspace-action-feedback";
import { buildExistingCodebaseWorkspaceLocalNavModel } from "@/app/(workspace)/_lib/workspace-setup-readiness-model";
import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type WorkspaceSyncPreviewState = FunctionReturnType<
	typeof api.workspace.getWorkspaceSyncPreviewState
>;
type DoctorPassRun = WorkspaceSyncPreviewState["doctorPassRun"];

type ApprovalState = "idle" | "approving" | "approved" | "errored";

const workspaceDoctorPassToastIds = {
	approvePreviewSuccess: "workspace-doctor-pass-approve-preview-success",
	approvePreviewError: "workspace-doctor-pass-approve-preview-error",
} as const;

export function WorkspaceDoctorPassPage({
	initialSyncPreviewState,
}: {
	initialSyncPreviewState: WorkspaceSyncPreviewState;
}) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const [lastMutationState, setLastMutationState] =
		useState<WorkspaceSyncPreviewState | null>(null);
	const [approvalState, setApprovalState] = useState<ApprovalState>("idle");
	const liveSyncPreviewState = useQuery(
		api.workspace.getWorkspaceSyncPreviewState,
		isAuthenticated && !isLoading ? {} : "skip",
	) as WorkspaceSyncPreviewState | undefined;
	const approveSyncPreview = useMutation(
		api.workspace.approveWorkspaceSyncPreview,
	);
	const syncPreviewState =
		liveSyncPreviewState ?? lastMutationState ?? initialSyncPreviewState;
	const doctorPassRun = syncPreviewState.doctorPassRun;
	const localRunId =
		doctorPassRun?.localRunId ?? getLocalRunId(doctorPassRun?.localReportRef);
	const presentation = getDoctorPassPresentation(doctorPassRun);
	const localNavModel = useMemo(
		() => buildExistingCodebaseWorkspaceLocalNavModel("doctor-pass"),
		[],
	);
	const canApprove =
		doctorPassRun?.syncPreviewStatus === "ready" &&
		Boolean(doctorPassRun.syncPreviewDigest);

	async function approveCurrentPreview() {
		if (!doctorPassRun?.syncPreviewDigest || !canApprove) {
			return;
		}
		setApprovalState("approving");
		try {
			const nextRun = await approveSyncPreview({
				projectId: doctorPassRun.projectId,
				doctorPassRunId: doctorPassRun._id,
				previewDigest: doctorPassRun.syncPreviewDigest,
			});
			setLastMutationState({
				doctorPassRun: nextRun,
			});
			setApprovalState("approved");
			showWorkspaceActionSuccessToast({
				id: workspaceDoctorPassToastIds.approvePreviewSuccess,
				title: "Findings upload approved",
				description:
					nextRun.runnerMode === "daemon"
						? "Runner will upload automatically."
						: "Run the manual upload command from this page.",
			});
		} catch (error) {
			setApprovalState("errored");
			showWorkspaceActionErrorToast({
				id: workspaceDoctorPassToastIds.approvePreviewError,
				error,
				fallbackMessage: "Unable to approve sync preview.",
				report: {
					title: "Workspace doctor pass sync preview approval failed",
					code: "workspace_doctor_pass_sync_preview_approval_failed",
					pathname: routeConfig.workspaceDoctorPass,
					details: {
						action: "approve_sync_preview",
					},
				},
			});
		}
	}

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			showSkillRail={false}
			title="Doctor Pass"
			localNav={{
				kind: "workspace",
				desktop: <WorkspaceLocalNavRail model={localNavModel} />,
			}}
		>
			<div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-3 pb-12 pt-2 sm:px-4 lg:px-6">
				<header className="grid gap-4 border-b border-border/60 pb-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.36fr)]">
					<div className="min-w-0">
						<p className="text-sm font-medium text-muted-foreground">
							Doctor Pass
						</p>
						<h1 className="mt-2 font-heading-serif text-4xl leading-none tracking-[-0.04em] text-foreground sm:text-5xl">
							{presentation.title}
						</h1>
						<p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
							{presentation.subtitle}
						</p>
					</div>
					<WorkspaceOperatorSummaryCard
						title="Run summary"
						rows={buildDoctorPassOperatorSummaryRows({
							doctorPassRun,
							localRunId,
						})}
					/>
				</header>

				<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.36fr)] lg:items-start">
					<div className="grid gap-5">
						<StatusSummaryPanel doctorPassRun={doctorPassRun} />
						<ProgressStepper doctorPassRun={doctorPassRun} />
						<PreviewPanel doctorPassRun={doctorPassRun} />
					</div>
					<ApprovalPanel
						approvalCopy={presentation.approvalCopy}
						approvalState={approvalState}
						canApprove={canApprove}
						doctorPassRun={doctorPassRun}
						localRunId={localRunId}
						onApprove={() => void approveCurrentPreview()}
					/>
				</div>
			</div>
		</AppShell>
	);
}

function ApprovalPanel({
	approvalCopy,
	approvalState,
	canApprove,
	doctorPassRun,
	localRunId,
	onApprove,
}: {
	approvalCopy: string;
	approvalState: ApprovalState;
	canApprove: boolean;
	doctorPassRun: DoctorPassRun;
	localRunId: string | null;
	onApprove: () => void;
}) {
	return (
		<aside className="grid gap-5 lg:sticky lg:top-20">
			<section className="rounded-xl border border-border/60 bg-background p-3">
				<div className="grid gap-3">
					<div className="flex items-center gap-2">
						<ShieldCheck className="size-4 text-foreground" aria-hidden />
						<h2 className="text-sm font-semibold text-foreground">Approval</h2>
					</div>
					<p className="text-sm leading-5 text-muted-foreground">
						{approvalCopy}
					</p>
				</div>
				{doctorPassRun?.syncPreviewStatus === "uploaded" ? (
					<div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
						<Button asChild className="w-full">
							<Link href={routeConfig.workspaceFindings}>View findings</Link>
						</Button>
						<Button asChild variant="outline" className="w-full">
							<Link href={routeConfig.workspaceRuns}>View runs</Link>
						</Button>
					</div>
				) : (
					<Button
						type="button"
						className="mt-3 w-full"
						disabled={!canApprove || approvalState === "approving"}
						onClick={onApprove}
						data-testid="workspace-doctor-pass-approve"
					>
						{approvalState === "approving"
							? "Approving upload"
							: "Approve findings upload"}
						<CheckCircle2 className="size-4" aria-hidden />
					</Button>
				)}
				<UploadInstruction
					doctorPassRun={doctorPassRun}
					localRunId={localRunId}
				/>
			</section>
		</aside>
	);
}

function StatusSummaryPanel({
	doctorPassRun,
}: {
	doctorPassRun: DoctorPassRun;
}) {
	const findingsCount = doctorPassRun?.syncPreviewFindingsCount ?? 0;
	const summaryItems = doctorPassRun
		? [
				{
					label: `The local runner inspected this repo and found ${formatCount(
						findingsCount,
						"item",
					)}.`,
					status: "complete",
				},
				{ label: "Raw source is not uploaded.", status: "complete" },
				{
					label: "Only approved structured findings sync to Ship by Sunday.",
					status: "complete",
				},
				{ label: "Excluded artifacts stay local.", status: "complete" },
			]
		: [
				{
					label: "Doctor Pass has not produced a local report yet.",
					status: "pending",
				},
				{ label: "Raw source is not uploaded.", status: "complete" },
				{
					label: "Only approved structured findings sync to Ship by Sunday.",
					status: "complete",
				},
			];

	return (
		<section
			id={doctorPassDetailsPanelId}
			aria-labelledby="workspace-doctor-pass-summary-heading"
			tabIndex={-1}
			className="rounded-xl border border-border/60 bg-background p-5"
		>
			<div className="flex items-start gap-3">
				<ListChecks className="mt-0.5 size-4 text-foreground" aria-hidden />
				<div className="min-w-0">
					<h2
						id="workspace-doctor-pass-summary-heading"
						className="text-base font-semibold text-foreground"
					>
						What happened
					</h2>
					<ul className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground">
						{summaryItems.map((item) => (
							<li
								key={item.label}
								className="flex items-start gap-2.5"
								data-summary-status={item.status}
							>
								{item.status === "complete" ? (
									<CheckCircle2
										className="mt-1 size-4 shrink-0 text-state-success"
										aria-hidden
									/>
								) : (
									<Circle
										className="mt-1 size-4 shrink-0 text-muted-foreground/70"
										aria-hidden
									/>
								)}
								<span>{item.label}</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}

function ProgressStepper({ doctorPassRun }: { doctorPassRun: DoctorPassRun }) {
	const steps = buildDoctorPassSteps(doctorPassRun);

	return (
		<section className="rounded-xl border border-border/60 bg-background p-5">
			<h2 className="text-base font-semibold text-foreground">Current flow</h2>
			<div className="mt-4 grid gap-3">
				{steps.map((step, index) => (
					<div key={step.label} className="flex items-start gap-3">
						<StepIcon status={step.status} index={index + 1} />
						<div className="min-w-0">
							<p
								className={cn(
									"text-sm font-medium",
									step.status === "pending"
										? "text-muted-foreground"
										: "text-foreground",
								)}
							>
								{step.label}
							</p>
							{step.description ? (
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									{step.description}
								</p>
							) : null}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

function StepIcon({
	index,
	status,
}: {
	index: number;
	status: DoctorPassStep["status"];
}) {
	if (status === "complete") {
		return (
			<CheckCircle2 className="mt-0.5 size-4 text-foreground" aria-hidden />
		);
	}
	if (status === "failed") {
		return (
			<CircleAlert className="mt-0.5 size-4 text-destructive" aria-hidden />
		);
	}
	if (status === "current") {
		return (
			<span className="mt-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
				{index}
			</span>
		);
	}
	return (
		<Circle className="mt-0.5 size-4 text-muted-foreground/60" aria-hidden />
	);
}

function PreviewPanel({ doctorPassRun }: { doctorPassRun: DoctorPassRun }) {
	if (!doctorPassRun) {
		return (
			<section
				id={doctorPassPreviewPanelId}
				tabIndex={-1}
				className="rounded-xl border border-border/60 bg-background p-5"
			>
				<div className="flex items-start gap-3">
					<Upload className="mt-0.5 size-4 text-foreground" aria-hidden />
					<div className="min-w-0">
						<h2 className="text-base font-semibold text-foreground">
							No sync preview yet
						</h2>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Start the paired local runner with the current local runner
							command, then return here after the run finishes.
							Published-package installations use{" "}
							<code className="font-mono text-xs">
								ship-by-sunday doctor-pass run
							</code>{" "}
							to generate local artifacts and a reviewable upload preview.
						</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section
			id={doctorPassPreviewPanelId}
			tabIndex={-1}
			className="rounded-xl border border-border/60 bg-background p-5"
		>
			<div className="flex items-start gap-3">
				<FileJson className="mt-0.5 size-4 text-foreground" aria-hidden />
				<div className="min-w-0">
					<h2 className="text-base font-semibold text-foreground">
						Structured findings preview
					</h2>
					<p className="mt-2 break-all font-mono text-xs leading-6 text-foreground">
						{doctorPassRun.syncPreviewDigest ?? "Not ready"}
					</p>
				</div>
			</div>
			<div className="mt-5 grid gap-3 border-t border-border/60 pt-4 text-sm sm:grid-cols-3">
				<PreviewMetric
					label="Findings"
					value={doctorPassRun.syncPreviewFindingsCount ?? 0}
				/>
				<PreviewMetric
					label="Excluded artifacts"
					value={doctorPassRun.excludedArtifactCount ?? 0}
				/>
				<PreviewMetric label="Runner mode" value={doctorPassRun.runnerMode} />
			</div>
			{doctorPassRun.localReportRef ? (
				<p className="mt-4 text-sm leading-6 text-muted-foreground">
					Local report:{" "}
					<code className="font-mono text-xs">
						{doctorPassRun.localReportRef}
					</code>
				</p>
			) : null}
		</section>
	);
}

function UploadInstruction({
	doctorPassRun,
	localRunId,
}: {
	doctorPassRun: DoctorPassRun;
	localRunId: string | null;
}) {
	if (!doctorPassRun) {
		return null;
	}
	if (doctorPassRun.syncPreviewStatus === "ready") {
		return null;
	}
	if (doctorPassRun.syncPreviewStatus === "approved") {
		if (doctorPassRun.runnerMode === "daemon") {
			return (
				<p className="mt-3 text-sm leading-6 text-muted-foreground">
					Runner will upload automatically. Keep the local runner daemon
					running.
				</p>
			);
		}
		return (
			<div className="mt-3 text-sm leading-6 text-muted-foreground">
				<p>Temporary/manual smoke-test behavior: run upload from the runner.</p>
				<code className="mt-2 block rounded-lg bg-muted px-3 py-2 font-mono text-xs text-foreground">
					ship-by-sunday doctor-pass upload --run-id {localRunId ?? "<run-id>"}
				</code>
			</div>
		);
	}
	if (doctorPassRun.syncPreviewStatus === "uploaded") {
		return (
			<p className="mt-3 text-sm leading-6 text-muted-foreground">
				Findings are synced. Use Findings for the ranked list, or Runs for the
				local report history.
			</p>
		);
	}
	if (doctorPassRun.status === "failed" || doctorPassRun.status === "blocked") {
		return (
			<p className="mt-3 text-sm leading-6 text-muted-foreground">
				Next action: rerun Doctor Pass locally after fixing the blocker shown
				above.
			</p>
		);
	}
	return null;
}

function PreviewMetric({
	label,
	value,
}: {
	label: string;
	value: string | number;
}) {
	return (
		<div>
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="mt-1 font-medium text-foreground">{value}</p>
		</div>
	);
}

type DoctorPassStep = {
	description?: string;
	label: string;
	status: "complete" | "current" | "pending" | "failed";
};

function buildDoctorPassSteps(doctorPassRun: DoctorPassRun): DoctorPassStep[] {
	const status = doctorPassRun?.status;
	const syncPreviewStatus = doctorPassRun?.syncPreviewStatus;
	const hasRun = Boolean(doctorPassRun);
	const hasCompletedLocalRun = Boolean(
		doctorPassRun &&
		status !== "queued" &&
		status !== "running" &&
		status !== "canceled",
	);
	const hasFailed = status === "failed" || status === "blocked";
	const hasPreview = Boolean(
		doctorPassRun?.syncPreviewDigest &&
		(syncPreviewStatus === "ready" ||
			syncPreviewStatus === "approved" ||
			syncPreviewStatus === "uploaded"),
	);
	const hasApproval =
		syncPreviewStatus === "approved" || syncPreviewStatus === "uploaded";
	const hasUpload = syncPreviewStatus === "uploaded";

	return [
		{
			label: "Doctor Pass ran locally",
			status: hasFailed
				? "failed"
				: hasCompletedLocalRun
					? "complete"
					: hasRun
						? "current"
						: "pending",
		},
		{
			label: "Review sync preview",
			description:
				syncPreviewStatus === "ready"
					? "Waiting for your approval."
					: undefined,
			status: hasFailed
				? "failed"
				: hasPreview && syncPreviewStatus === "ready"
					? "current"
					: hasPreview
						? "complete"
						: "pending",
		},
		{
			label: "Approve upload",
			description:
				syncPreviewStatus === "approved"
					? "Approved. Waiting for runner upload."
					: undefined,
			status: hasApproval ? "complete" : hasPreview ? "pending" : "pending",
		},
		{
			label: "Runner uploads approved findings",
			description:
				syncPreviewStatus === "uploaded" ? "Findings uploaded." : undefined,
			status: hasUpload
				? "complete"
				: syncPreviewStatus === "approved"
					? "current"
					: "pending",
		},
		{
			label: "View findings in workspace",
			status: hasUpload ? "current" : "pending",
		},
	];
}

function getDoctorPassPresentation(doctorPassRun: DoctorPassRun) {
	if (!doctorPassRun) {
		return {
			title: "Run Doctor Pass locally",
			subtitle:
				"Start the local runner to inspect the repo and produce a reviewable findings upload.",
			statusLabel: "Not run yet",
			approvalCopy:
				"Approval is available after Doctor Pass creates structured findings.",
		};
	}
	if (doctorPassRun.syncPreviewStatus === "uploaded") {
		return {
			title: "Findings uploaded",
			subtitle:
				"Approved structured findings are now available in the workspace.",
			statusLabel: "Findings uploaded.",
			approvalCopy:
				"Upload is complete. Open the synced findings or run history.",
		};
	}
	if (doctorPassRun.syncPreviewStatus === "approved") {
		return {
			title: "Approved. Waiting for runner upload",
			subtitle:
				"The browser approval is saved. The local runner is now responsible for uploading the approved findings.",
			statusLabel: "Approved. Waiting for runner upload.",
			approvalCopy:
				doctorPassRun.runnerMode === "daemon"
					? "Runner will upload automatically when the daemon checks in."
					: "Manual upload is required for this one-shot runner flow.",
		};
	}
	if (doctorPassRun.syncPreviewStatus === "ready") {
		return {
			title: "Doctor Pass completed locally",
			subtitle:
				"Review the structured findings before allowing anything to sync to Ship by Sunday.",
			statusLabel: "Waiting for your approval.",
			approvalCopy:
				"Approving lets the runner upload only the structured findings in this preview.",
		};
	}
	if (doctorPassRun.status === "failed" || doctorPassRun.status === "blocked") {
		return {
			title: "Doctor Pass needs attention",
			subtitle:
				doctorPassRun.blockedReason ??
				"The local runner could not finish Doctor Pass.",
			statusLabel: doctorPassRun.blockedReason ?? "Doctor Pass failed.",
			approvalCopy:
				"Approval is unavailable until Doctor Pass completes and produces a preview.",
		};
	}
	return {
		title: "Doctor Pass is running locally",
		subtitle:
			"The local runner is still collecting artifacts and preparing structured findings.",
		statusLabel: "Waiting for runner.",
		approvalCopy:
			"Approval is available after the local runner finishes the preview.",
	};
}

function buildDoctorPassOperatorSummaryRows({
	doctorPassRun,
	localRunId,
}: {
	doctorPassRun: DoctorPassRun;
	localRunId: string | null;
}): WorkspaceOperatorSummaryRow[] {
	if (!doctorPassRun) {
		return [
			{ label: "State", value: "Not run yet" },
			{ label: "Owner", value: "Human" },
			{ label: "Next", value: "Run Doctor Pass locally" },
		];
	}

	const operatorState = getDoctorPassOperatorState(doctorPassRun);
	const rows: WorkspaceOperatorSummaryRow[] = [
		{
			label: "Server run",
			value: doctorPassRun._id,
			copyValue: doctorPassRun._id,
			mono: true,
		},
	];

	if (localRunId) {
		rows.push({
			label: "Local run",
			value: localRunId,
			copyValue: localRunId,
			mono: true,
		});
	}

	const digest = doctorPassRun.syncPreviewDigest;
	if (digest) {
		rows.push({
			label: "Digest",
			value: formatDigestLabel(digest),
			copyValue: digest,
			mono: true,
			title: digest,
		});
	}

	rows.push(
		{ label: "State", value: operatorState.state },
		{ label: "Owner", value: operatorState.owner },
		{ label: "Next", value: operatorState.nextAction },
	);

	const findingsCount =
		doctorPassRun.findingsCount ?? doctorPassRun.syncPreviewFindingsCount;
	if (typeof findingsCount === "number") {
		rows.push({ label: "Findings", value: String(findingsCount), mono: true });
	}
	if (typeof doctorPassRun.excludedArtifactCount === "number") {
		rows.push({
			label: "Excluded",
			value: String(doctorPassRun.excludedArtifactCount),
			mono: true,
		});
	}

	rows.push({
		label: operatorState.timestampLabel,
		value: formatTimestamp(operatorState.timestamp),
		mono: true,
	});

	return rows;
}

function getDoctorPassOperatorState(doctorPassRun: NonNullable<DoctorPassRun>) {
	if (doctorPassRun.syncPreviewStatus === "uploaded") {
		return {
			state: "Uploaded",
			owner: "Human",
			nextAction: "Open Findings",
			timestampLabel: "Updated",
			timestamp: doctorPassRun.updatedAt,
		};
	}
	if (doctorPassRun.syncPreviewStatus === "approved") {
		return {
			state: "Approved, waiting for runner upload",
			owner: "Runner",
			nextAction: "Run/keep local runner upload active",
			timestampLabel: "Approved",
			timestamp:
				getSyncPreviewApprovedAt(doctorPassRun) ?? doctorPassRun.updatedAt,
		};
	}
	if (doctorPassRun.syncPreviewStatus === "ready") {
		return {
			state: "Waiting for browser approval",
			owner: "Human",
			nextAction: "Click Approve findings upload",
			timestampLabel: "Updated",
			timestamp: doctorPassRun.updatedAt,
		};
	}
	if (doctorPassRun.status === "failed" || doctorPassRun.status === "blocked") {
		return {
			state: "Failed",
			owner: "Human",
			nextAction: "Inspect failed run",
			timestampLabel: "Updated",
			timestamp: doctorPassRun.updatedAt,
		};
	}
	return {
		state: "Running locally",
		owner:
			doctorPassRun.currentStage === "codex_interpretation_running"
				? "Codebot"
				: "Runner",
		nextAction: "Keep local runner active",
		timestampLabel: "Started",
		timestamp: doctorPassRun.startedAt,
	};
}

function getSyncPreviewApprovedAt(doctorPassRun: NonNullable<DoctorPassRun>) {
	return "syncPreviewApprovedAt" in doctorPassRun &&
		typeof doctorPassRun.syncPreviewApprovedAt === "number"
		? doctorPassRun.syncPreviewApprovedAt
		: null;
}

function formatDigestLabel(digest: string) {
	const digestValue = digest.startsWith("sha256:") ? digest.slice(7) : digest;
	return `sha256:${digestValue.slice(0, 12)}`;
}

function formatCount(count: number, noun: string) {
	return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function getLocalRunId(localReportRef: string | undefined) {
	const match = localReportRef?.match(
		/^\.sbs\/reports\/doctor-pass\/([^/]+)\//,
	);
	return match?.[1] ?? null;
}

function formatTimestamp(timestamp: number) {
	const date = new Date(timestamp);
	if (Number.isNaN(date.getTime())) {
		return "Unknown";
	}

	return date.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}
