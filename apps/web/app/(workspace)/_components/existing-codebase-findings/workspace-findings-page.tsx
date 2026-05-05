"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";

import { AppShell } from "@/app/(workspace)/_components/app-shell";
import { WorkspaceLocalNavRail } from "@/app/(workspace)/_components/workspace-navigation/workspace-local-nav-rail";
import {
	buildWorkspaceFindingsLedgerModel,
	type WorkspaceFindingDocument,
	type WorkspaceFindingsFilterState,
} from "@/app/(workspace)/_lib/workspace-findings-read-model";
import { buildExistingCodebaseWorkspaceLocalNavModel } from "@/app/(workspace)/_lib/workspace-setup-readiness-model";
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
			<div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-3 pb-12 pt-2 sm:px-4 lg:px-6">
				<header className="grid gap-4 border-b border-border/60 pb-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.32fr)]">
					<div className="min-w-0">
						<p className="text-sm font-medium text-muted-foreground">
							Findings
						</p>
						<h1 className="mt-2 font-heading-serif text-4xl leading-none tracking-[-0.04em] text-foreground sm:text-5xl">
							Top 9 ledger
						</h1>
						<p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
							Review approved doctor-pass findings, choose the first workflow,
							and keep local evidence behind refs.
						</p>
					</div>
					<div className="grid gap-2 rounded-xl border border-border/60 bg-background p-4 text-sm">
						<div className="flex items-center justify-between gap-3">
							<span className="text-muted-foreground">Uploaded</span>
							<span className="font-mono text-xs font-medium text-foreground">
								{ledgerModel.totalCount}
							</span>
						</div>
						<div className="flex items-center justify-between gap-3">
							<span className="text-muted-foreground">Visible</span>
							<span className="font-mono text-xs font-medium text-foreground">
								{ledgerModel.filteredCount}
							</span>
						</div>
						<Button asChild variant="outline" size="sm" className="mt-2">
							<Link href={routeConfig.workspaceDoctorPass}>
								<RefreshCcw className="size-3.5" aria-hidden />
								Run doctor pass again
							</Link>
						</Button>
					</div>
				</header>

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
			</div>
		</AppShell>
	);
}
