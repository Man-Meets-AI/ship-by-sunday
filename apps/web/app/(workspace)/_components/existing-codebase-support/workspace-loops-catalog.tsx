import Link from "next/link";
import { ArrowUpRight, ListChecks } from "lucide-react";

import type { WorkspaceLoopCatalogRow } from "@/app/(workspace)/_lib/workspace-support-read-model";
import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";
import {
	WorkspaceSupportDenseText,
	WorkspaceSupportEmptyState,
} from "./workspace-support-shared";

export function WorkspaceLoopsCatalog({
	rows,
}: {
	rows: WorkspaceLoopCatalogRow[];
}) {
	return (
		<section className="grid gap-3">
			<div className="flex items-center gap-2">
				<ListChecks className="size-4 text-foreground" aria-hidden />
				<h2 className="text-base font-semibold text-foreground">
					Finding-filtered workflows
				</h2>
			</div>
			<div className="overflow-hidden rounded-xl border border-border/60 bg-background">
				<div className="hidden grid-cols-[minmax(10rem,1fr)_8rem_minmax(12rem,1.2fr)_8rem_minmax(11rem,1fr)_6rem_7rem_8rem] gap-3 border-b border-border/60 bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground lg:grid">
					<span>Name</span>
					<span>Category</span>
					<span>When useful</span>
					<span>Permission</span>
					<span>Typical proof</span>
					<span>Risk</span>
					<span>Status</span>
					<span>Action</span>
				</div>
				<div className="divide-y divide-border/60">
					{rows.map((row) => (
						<LoopRow key={row.id} row={row} />
					))}
				</div>
			</div>
		</section>
	);
}

export function EmptyLoops() {
	return (
		<WorkspaceSupportEmptyState
			title="No finding-backed workflows yet"
			description="Workflow rows become useful after the doctor pass uploads approved findings. Until then, there is no runnable loop center."
			href={routeConfig.workspaceDoctorPass}
			action="Open Doctor Pass"
		/>
	);
}

function LoopRow({ row }: { row: WorkspaceLoopCatalogRow }) {
	return (
		<div className="grid gap-3 px-3 py-3 text-sm lg:grid-cols-[minmax(10rem,1fr)_8rem_minmax(12rem,1.2fr)_8rem_minmax(11rem,1fr)_6rem_7rem_8rem] lg:items-center">
			<div className="min-w-0">
				<p className="break-words font-medium text-foreground">{row.name}</p>
				{row.workflowRunStatusLabel ? (
					<p className="mt-1 text-xs leading-5 text-muted-foreground">
						{row.workflowRunStatusLabel}
					</p>
				) : null}
			</div>
			<WorkspaceSupportDenseText label="Category" value={row.category} />
			<WorkspaceSupportDenseText label="When useful" value={row.whenUseful} />
			<WorkspaceSupportDenseText
				label="Permission"
				value={row.requiredPermission}
			/>
			<WorkspaceSupportDenseText
				label="Typical proof"
				value={row.typicalProof}
			/>
			<WorkspaceSupportDenseText label="Risk" value={row.riskLevel} />
			<WorkspaceSupportDenseText label="Status" value={row.statusLabel} />
			<div>
				{row.relatedFindingHref && row.actionLabel ? (
					<Button asChild variant="outline" size="sm">
						<Link href={row.relatedFindingHref}>
							{row.actionLabel}
							<ArrowUpRight className="size-3.5" aria-hidden />
						</Link>
					</Button>
				) : (
					<span className="text-sm text-muted-foreground">Future</span>
				)}
			</div>
			{row.relatedFindingTitle ? (
				<p className="text-sm leading-6 text-muted-foreground lg:col-span-8">
					Finding: {row.relatedFindingTitle}
				</p>
			) : null}
		</div>
	);
}
