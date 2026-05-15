"use client";

import { useMemo } from "react";

import { AppShell } from "@/app/(app)/_components/app-shell";
import { WorkspaceLocalNavRail } from "@/app/(app)/_components/workspace-navigation/workspace-local-nav-rail";
import { WorkspaceOperatorSummaryCard } from "@/app/(app)/_components/workspace-operator-summary-card";
import { buildExistingCodebaseWorkspaceLocalNavModel } from "@/app/(app)/_lib/workspace-setup-readiness-model";
import {
	buildWorkspaceRunsModel,
	type WorkspaceRunHistoryState,
} from "@/app/(app)/_lib/workspace-support-read-model";
import {
	ProtectedRouteDescription,
	ProtectedRouteEyebrow,
	ProtectedRouteHeader,
	ProtectedRoutePage,
	ProtectedRouteTitle,
} from "@/components/app/protected-route-surface";
import { DoctorPassRuns, EmptyRuns } from "./workspace-runs-sections";
import { WorkflowRuns } from "./workspace-workflow-runs-section";

export function WorkspaceRunsPage({
	initialRunHistory,
	now,
}: {
	initialRunHistory: WorkspaceRunHistoryState;
	now?: number;
}) {
	const localNavModel = useMemo(
		() => buildExistingCodebaseWorkspaceLocalNavModel("runs"),
		[],
	);
	const runsModel = useMemo(
		() => buildWorkspaceRunsModel(initialRunHistory, now),
		[initialRunHistory, now],
	);

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			showSkillRail={false}
			title="Runs"
			localNav={{
				kind: "workspace",
				desktop: <WorkspaceLocalNavRail model={localNavModel} />,
			}}
		>
			<ProtectedRoutePage>
				<ProtectedRouteHeader
					className="lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.32fr)]"
					actionsClassName="w-full"
					actions={
						<WorkspaceOperatorSummaryCard
							title="Runs summary"
							rows={buildRunsSummaryRows(initialRunHistory, runsModel)}
						/>
					}
				>
					<ProtectedRouteEyebrow>Runs</ProtectedRouteEyebrow>
					<ProtectedRouteTitle>Run history</ProtectedRouteTitle>
					<ProtectedRouteDescription>
						Review doctor-pass runs and approved workflow proof without queue
						controls or PR handoff.
					</ProtectedRouteDescription>
				</ProtectedRouteHeader>

				{runsModel.hasRuns ? (
					<div className="grid gap-5">
						<DoctorPassRuns rows={runsModel.doctorPassRows} />
						<WorkflowRuns rows={runsModel.workflowRows} />
					</div>
				) : (
					<EmptyRuns />
				)}
			</ProtectedRoutePage>
		</AppShell>
	);
}

function buildRunsSummaryRows(
	runHistory: WorkspaceRunHistoryState,
	runsModel: ReturnType<typeof buildWorkspaceRunsModel>,
) {
	const latestDoctorPassRun =
		runHistory.doctorPassRuns.find((run) => run.status !== "deleted") ?? null;
	const localRunId =
		latestDoctorPassRun?.localRunId ??
		getLocalRunId(latestDoctorPassRun?.localReportRef);

	return [
		{
			label: "State",
			value: runsModel.hasRuns ? "Runs recorded" : "No runs yet",
		},
		{ label: "Owner", value: runsModel.hasRuns ? "Human" : "Runner" },
		{
			label: "Next",
			value: runsModel.hasRuns ? "Inspect run history" : "Run Doctor Pass",
		},
		{
			label: "Doctor",
			value: String(runsModel.doctorPassRows.length),
			mono: true,
		},
		{
			label: "Workflows",
			value: String(runsModel.workflowRows.length),
			mono: true,
		},
		{
			label: "Total",
			value: String(runsModel.totalRuns),
			mono: true,
		},
		...(latestDoctorPassRun
			? [
					{
						label: "Server run",
						value: latestDoctorPassRun._id,
						copyValue: latestDoctorPassRun._id,
						mono: true,
					},
				]
			: []),
		...(localRunId
			? [
					{
						label: "Local run",
						value: localRunId,
						copyValue: localRunId,
						mono: true,
					},
				]
			: []),
	];
}

function getLocalRunId(localReportRef: string | undefined) {
	const match = localReportRef?.match(
		/^\.sbs\/reports\/doctor-pass\/([^/]+)\//,
	);
	return match?.[1] ?? null;
}
