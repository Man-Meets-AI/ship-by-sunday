"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FileJson, ShieldCheck, Upload } from "lucide-react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";

import { AppShell } from "@/app/(workspace)/_components/app-shell";
import { WorkspaceLocalNavRail } from "@/app/(workspace)/_components/workspace-navigation/workspace-local-nav-rail";
import { buildExistingCodebaseWorkspaceLocalNavModel } from "@/app/(workspace)/_lib/workspace-setup-readiness-model";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

type WorkspaceSyncPreviewState = FunctionReturnType<
	typeof api.workspace.getWorkspaceSyncPreviewState
>;

type ApprovalState = "idle" | "approving" | "approved" | "errored";

export function WorkspaceDoctorPassPage({
	initialSyncPreviewState,
}: {
	initialSyncPreviewState: WorkspaceSyncPreviewState;
}) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const [lastMutationState, setLastMutationState] =
		useState<WorkspaceSyncPreviewState | null>(null);
	const [approvalState, setApprovalState] = useState<ApprovalState>("idle");
	const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
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
	const localRunId = getLocalRunId(doctorPassRun?.localReportRef);
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
		setFeedbackMessage(null);
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
			setFeedbackMessage(
				"Sync preview approved. The local runner can upload findings now.",
			);
		} catch (error) {
			setApprovalState("errored");
			setFeedbackMessage(
				error instanceof Error
					? error.message
					: "Unable to approve sync preview.",
			);
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
							Sync preview
						</h1>
						<p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
							Review the local runner preview before any structured findings
							leave the repo.
						</p>
					</div>
					<RunStatusPanel doctorPassRun={doctorPassRun} />
				</header>

				{feedbackMessage ? (
					<div
						className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-foreground"
						role="status"
					>
						{feedbackMessage}
					</div>
				) : null}

				<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.36fr)] lg:items-start">
					<PreviewPanel doctorPassRun={doctorPassRun} />
					<aside className="grid gap-5 lg:sticky lg:top-20">
						<section className="rounded-xl border border-border/60 bg-background p-4">
							<div className="flex items-start gap-3">
								<ShieldCheck
									className="mt-0.5 size-4 text-foreground"
									aria-hidden
								/>
								<div className="min-w-0 space-y-1">
									<h2 className="text-sm font-semibold text-foreground">
										Approval
									</h2>
									<p className="text-sm leading-6 text-muted-foreground">
										The browser approves the digest. The runner uploads only
										after that approval exists.
									</p>
								</div>
							</div>
							<Button
								type="button"
								size="lg"
								className="mt-4 w-full"
								disabled={!canApprove || approvalState === "approving"}
								onClick={() => void approveCurrentPreview()}
								data-testid="workspace-doctor-pass-approve"
							>
								{approvalState === "approving"
									? "Approving preview"
									: "Approve sync preview"}
								<CheckCircle2 className="size-4" aria-hidden />
							</Button>
							<p className="mt-3 text-sm leading-6 text-muted-foreground">
								After approval, run{" "}
								<code className="font-mono text-xs">
									ship-by-sunday doctor-pass upload --run-id{" "}
									{localRunId ?? "<run-id>"}
								</code>
								.
							</p>
						</section>
					</aside>
				</div>
			</div>
		</AppShell>
	);
}

function RunStatusPanel({
	doctorPassRun,
}: {
	doctorPassRun: WorkspaceSyncPreviewState["doctorPassRun"];
}) {
	return (
		<div className="grid gap-2 rounded-xl border border-border/60 bg-background p-4 text-sm">
			<div className="flex items-center justify-between gap-3">
				<span className="text-muted-foreground">Run</span>
				<span className="truncate font-medium text-foreground">
					{doctorPassRun?._id ?? "Waiting"}
				</span>
			</div>
			<div className="flex items-center justify-between gap-3">
				<span className="text-muted-foreground">Status</span>
				<span className="truncate font-medium text-foreground">
					{doctorPassRun?.status ?? "not_started"}
				</span>
			</div>
			<div className="flex items-center justify-between gap-3">
				<span className="text-muted-foreground">Preview</span>
				<span className="truncate font-medium text-foreground">
					{doctorPassRun?.syncPreviewStatus ?? "not_ready"}
				</span>
			</div>
		</div>
	);
}

function PreviewPanel({
	doctorPassRun,
}: {
	doctorPassRun: WorkspaceSyncPreviewState["doctorPassRun"];
}) {
	if (!doctorPassRun) {
		return (
			<section className="rounded-xl border border-border/60 bg-background p-5">
				<div className="flex items-start gap-3">
					<Upload className="mt-0.5 size-4 text-foreground" aria-hidden />
					<div className="min-w-0">
						<h2 className="text-base font-semibold text-foreground">
							No sync preview yet
						</h2>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Start the paired local runner with{" "}
							<code className="font-mono text-xs">
								ship-by-sunday doctor-pass run
							</code>{" "}
							to generate local artifacts and a preview digest.
						</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="rounded-xl border border-border/60 bg-background p-5">
			<div className="flex items-start gap-3">
				<FileJson className="mt-0.5 size-4 text-foreground" aria-hidden />
				<div className="min-w-0">
					<h2 className="text-base font-semibold text-foreground">
						Preview digest
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

function getLocalRunId(localReportRef: string | undefined) {
	const match = localReportRef?.match(
		/^\.sbs\/reports\/doctor-pass\/([^/]+)\//,
	);
	return match?.[1] ?? null;
}
