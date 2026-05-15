"use client";

import { useMemo } from "react";

import { AppShell } from "@/app/(app)/_components/app-shell";
import { WorkspaceLocalNavRail } from "@/app/(app)/_components/workspace-navigation/workspace-local-nav-rail";
import type { WorkspaceFindingDocument } from "@/app/(app)/_lib/workspace-findings-read-model";
import { buildExistingCodebaseWorkspaceLocalNavModel } from "@/app/(app)/_lib/workspace-setup-readiness-model";
import {
	buildWorkspaceLoopsModel,
	type WorkspaceRunHistoryState,
} from "@/app/(app)/_lib/workspace-support-read-model";
import {
	ProtectedRouteDescription,
	ProtectedRouteEyebrow,
	ProtectedRouteHeader,
	ProtectedRoutePage,
	ProtectedRouteSummaryGrid,
	ProtectedRouteTitle,
} from "@/components/app/protected-route-surface";
import {
	EmptyLoops,
	WorkflowPacketContractPanel,
	WorkspaceLoopsCatalog,
} from "./workspace-loops-catalog";

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
			<ProtectedRoutePage>
				<ProtectedRouteHeader
					className="lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.32fr)]"
					actionsClassName="w-full"
					actions={
						<ProtectedRouteSummaryGrid
							heading="Catalog summary"
							items={[
								{
									label: "Workflows",
									value: String(loopsModel.rows.length),
									mono: true,
								},
								{
									label: "Backed",
									value: String(loopsModel.findingBackedCount),
									mono: true,
								},
								{
									label: "Next",
									value: String(loopsModel.recommendedWorkflow ? 1 : 0),
									mono: true,
								},
							]}
						/>
					}
				>
					<ProtectedRouteEyebrow>Loops</ProtectedRouteEyebrow>
					<ProtectedRouteTitle>Workflow catalog</ProtectedRouteTitle>
					<ProtectedRouteDescription>
						See which workflows the approved findings point to. Execution still
						starts from a finding approval, not from a queue.
					</ProtectedRouteDescription>
				</ProtectedRouteHeader>

				{initialFindings.length === 0 ? (
					<EmptyLoops />
				) : (
					<>
						<WorkflowPacketContractPanel rows={loopsModel.packetContractRows} />
						<WorkspaceLoopsCatalog rows={loopsModel.rows} />
					</>
				)}
			</ProtectedRoutePage>
		</AppShell>
	);
}
