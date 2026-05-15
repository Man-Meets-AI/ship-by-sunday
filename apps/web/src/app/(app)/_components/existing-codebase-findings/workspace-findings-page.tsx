"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";

import { AppShell } from "@/app/(app)/_components/app-shell";
import { WorkspaceLocalNavRail } from "@/app/(app)/_components/workspace-navigation/workspace-local-nav-rail";
import { WorkspaceOperatorSummaryCard } from "@/app/(app)/_components/workspace-operator-summary-card";
import {
	buildWorkspaceFindingsLedgerModel,
	type WorkspaceFindingDocument,
	type WorkspaceFindingsFilterState,
} from "@/app/(app)/_lib/workspace-findings-read-model";
import { buildExistingCodebaseWorkspaceLocalNavModel } from "@/app/(app)/_lib/workspace-setup-readiness-model";
import {
	ProtectedRouteDescription,
	ProtectedRouteEyebrow,
	ProtectedRouteHeader,
	ProtectedRoutePage,
	ProtectedRouteTitle,
} from "@/components/app/protected-route-surface";
import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";
import { WorkspaceFindingsEmptyState } from "./workspace-findings-empty-state";
import { WorkspaceFindingsFilters } from "./workspace-findings-filters";
import { WorkspaceFindingsLedger } from "./workspace-findings-ledger";

const initialFilters: WorkspaceFindingsFilterState = {
	category: "all",
	status: "all",
};

export function WorkspaceFindingsPage({
	initialFindings,
}: {
	initialFindings: WorkspaceFindingDocument[];
}) {
	const [filters, setFilters] =
		useState<WorkspaceFindingsFilterState>(initialFilters);
	const localNavModel = useMemo(
		() => buildExistingCodebaseWorkspaceLocalNavModel("findings"),
		[],
	);
	const ledgerModel = useMemo(
		() => buildWorkspaceFindingsLedgerModel(initialFindings, filters),
		[filters, initialFindings],
	);

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			showSkillRail={false}
			title="Findings"
			localNav={{
				kind: "workspace",
				desktop: <WorkspaceLocalNavRail model={localNavModel} />,
			}}
		>
			<ProtectedRoutePage>
				<ProtectedRouteHeader
					className="lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.32fr)]"
					actionsClassName="grid w-full gap-2"
					actions={
						<>
							<WorkspaceOperatorSummaryCard
								title="Findings summary"
								rows={buildFindingsSummaryRows(ledgerModel)}
							/>
							<Button asChild variant="outline" size="sm" className="mt-2">
								<Link href={routeConfig.workspaceDoctorPass}>
									<RefreshCcw className="size-3.5" aria-hidden />
									Run doctor pass again
								</Link>
							</Button>
						</>
					}
				>
					<ProtectedRouteEyebrow>Findings</ProtectedRouteEyebrow>
					<ProtectedRouteTitle>Top 9 ledger</ProtectedRouteTitle>
					<ProtectedRouteDescription>
						Review approved doctor-pass findings, choose the first workflow, and
						keep local evidence behind refs.
					</ProtectedRouteDescription>
				</ProtectedRouteHeader>

				{ledgerModel.totalCount === 0 ? (
					<WorkspaceFindingsEmptyState />
				) : (
					<section className="grid gap-4">
						<WorkspaceFindingsFilters
							categoryOptions={ledgerModel.categoryOptions}
							statusOptions={ledgerModel.statusOptions}
							value={filters}
							onChange={setFilters}
						/>
						<WorkspaceFindingsLedger model={ledgerModel} />
					</section>
				)}
			</ProtectedRoutePage>
		</AppShell>
	);
}

function buildFindingsSummaryRows(
	ledgerModel: ReturnType<typeof buildWorkspaceFindingsLedgerModel>,
) {
	const localRunId = getLocalRunId(
		ledgerModel.recommendedFirst?.localReportRef ??
			ledgerModel.allRows[0]?.localReportRef,
	);

	return [
		{
			label: "State",
			value:
				ledgerModel.totalCount > 0 ? "Uploaded findings" : "No findings yet",
		},
		{ label: "Owner", value: "Human" },
		{
			label: "Next",
			value: ledgerModel.totalCount > 0 ? "Open finding" : "Run Doctor Pass",
		},
		{
			label: "Uploaded",
			value: String(ledgerModel.totalCount),
			mono: true,
		},
		{
			label: "Visible",
			value: String(ledgerModel.filteredCount),
			mono: true,
		},
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
