"use client";

import { useMemo } from "react";

import { AppShell } from "@/app/(protected)/_components/app-shell";
import { WorkspaceLocalNavRail } from "@/app/(protected)/_components/workspace-navigation/workspace-local-nav-rail";
import type { WorkspaceFindingDocument } from "@/app/(protected)/_lib/workspace-findings-read-model";
import { buildExistingCodebaseWorkspaceLocalNavModel } from "@/app/(protected)/_lib/workspace-setup-readiness-model";
import {
	buildWorkspaceLoopsModel,
	type WorkspaceRunHistoryState,
} from "@/app/(protected)/_lib/workspace-support-read-model";
import {
	EmptyLoops,
	WorkflowPacketContractPanel,
	WorkspaceLoopsCatalog,
} from "./workspace-loops-catalog";
import { WorkspaceSupportMetric } from "./workspace-support-shared";

export function WorkspaceLoopsPage({
	initialFindings,
	initialRunHistory,
}: {
	initialFindings: WorkspaceFindingDocument[];
	initialRunHistory: WorkspaceRunHistoryState;
}) {
	const localNavModel = useMemo(
		() => buildExistingCodebaseWorkspaceLocalNavModel("loops"),
		[],
	);
	const loopsModel = useMemo(
		() =>
			buildWorkspaceLoopsModel({
				findings: initialFindings,
				workflowRuns: initialRunHistory.workflowRuns,
			}),
		[initialFindings, initialRunHistory.workflowRuns],
	);

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			showSkillRail={false}
			title="Loops"
			localNav={{
				kind: "workspace",
				desktop: <WorkspaceLocalNavRail model={localNavModel} />,
			}}
		>
			<div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-3 pb-12 pt-2 sm:px-4 lg:px-6">
				<header className="grid gap-4 border-b border-border/60 pb-5 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.32fr)]">
					<div className="min-w-0">
						<p className="text-sm font-medium text-muted-foreground">Loops</p>
						<h1 className="mt-2 font-heading-serif text-4xl leading-none tracking-[-0.04em] text-foreground sm:text-5xl">
							Workflow catalog
						</h1>
						<p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
							See which workflows the approved findings point to. Execution
							still starts from a finding approval, not from a queue.
						</p>
					</div>
					<div className="grid min-w-0 gap-2 overflow-hidden rounded-xl border border-border/60 bg-background p-4 text-sm">
						<WorkspaceSupportMetric
							label="Catalog workflows"
							value={loopsModel.rows.length}
						/>
						<WorkspaceSupportMetric
							label="Finding-backed"
							value={loopsModel.findingBackedCount}
						/>
						<WorkspaceSupportMetric
							label="Recommended"
							value={loopsModel.recommendedWorkflow ? 1 : 0}
						/>
					</div>
				</header>

				{initialFindings.length === 0 ? (
					<EmptyLoops />
				) : (
					<>
						<WorkflowPacketContractPanel rows={loopsModel.packetContractRows} />
						<WorkspaceLoopsCatalog rows={loopsModel.rows} />
					</>
				)}
			</div>
		</AppShell>
	);
}
