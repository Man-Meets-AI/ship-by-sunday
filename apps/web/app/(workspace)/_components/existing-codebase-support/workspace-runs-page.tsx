"use client";

import { useMemo } from "react";

import { AppShell } from "@/app/(workspace)/_components/app-shell";
import { WorkspaceLocalNavRail } from "@/app/(workspace)/_components/workspace-navigation/workspace-local-nav-rail";
import { buildExistingCodebaseWorkspaceLocalNavModel } from "@/app/(workspace)/_lib/workspace-setup-readiness-model";
import {
	buildWorkspaceRunsModel,
	type WorkspaceRunHistoryState,
} from "@/app/(workspace)/_lib/workspace-support-read-model";
import { DoctorPassRuns, EmptyRuns } from "./workspace-runs-sections";
import { WorkspaceSupportMetric } from "./workspace-support-shared";
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
			<div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-3 pb-12 pt-2 sm:px-4 lg:px-6">
				<header className="grid gap-4 border-b border-border/60 pb-5 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.32fr)]">
					<div className="min-w-0">
						<p className="text-sm font-medium text-muted-foreground">Runs</p>
						<h1 className="mt-2 font-heading-serif text-4xl leading-none tracking-[-0.04em] text-foreground sm:text-5xl">
							Run history
						</h1>
						<p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
							Review doctor-pass runs and approved workflow proof without queue
							controls or PR handoff.
						</p>
					</div>
					<div className="grid gap-2 rounded-xl border border-border/60 bg-background p-4 text-sm">
						<WorkspaceSupportMetric
							label="Doctor passes"
							value={runsModel.doctorPassRows.length}
						/>
						<WorkspaceSupportMetric
							label="Workflows"
							value={runsModel.workflowRows.length}
						/>
						<WorkspaceSupportMetric label="Total" value={runsModel.totalRuns} />
					</div>
				</header>

				{runsModel.hasRuns ? (
					<div className="grid gap-5">
						<DoctorPassRuns rows={runsModel.doctorPassRows} />
						<WorkflowRuns rows={runsModel.workflowRows} />
					</div>
				) : (
					<EmptyRuns />
				)}
			</div>
		</AppShell>
	);
}
