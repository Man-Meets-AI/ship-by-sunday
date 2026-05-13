import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type {
	WorkspaceFindingLedgerRow,
	WorkspaceFindingsLedgerModel,
} from "@/app/(protected)/_lib/workspace-findings-read-model";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function WorkspaceFindingsLedger({
	model,
}: {
	model: WorkspaceFindingsLedgerModel;
}) {
	if (model.rows.length === 0) {
		return (
			<div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
				No findings match the active filters.
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-border/60 bg-background">
			<div className="hidden grid-cols-[3rem_minmax(10rem,1.2fr)_6.5rem_5.5rem_5.5rem_minmax(9rem,1fr)_6.5rem_minmax(8rem,0.8fr)_7rem_6rem_1.5rem] gap-2 border-b border-border/60 bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground lg:grid">
				<span>Rank</span>
				<span>Title</span>
				<span>Category</span>
				<span>Severity</span>
				<span>Confidence</span>
				<span>Buyer impact</span>
				<span>Proof</span>
				<span>Permission</span>
				<span>Workflow</span>
				<span>Status</span>
				<span />
			</div>
			<div className="divide-y divide-border/60">
				{model.rows.map((row) => (
					<FindingLedgerRow key={row.documentId} row={row} />
				))}
			</div>
		</div>
	);
}

function FindingLedgerRow({ row }: { row: WorkspaceFindingLedgerRow }) {
	return (
		<Link
			href={row.href}
			className="grid min-w-0 gap-3 px-3 py-3 text-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 lg:grid-cols-[3rem_minmax(10rem,1.2fr)_6.5rem_5.5rem_5.5rem_minmax(9rem,1fr)_6.5rem_minmax(8rem,0.8fr)_7rem_6rem_1.5rem] lg:items-center lg:gap-2"
		>
			<div className="flex items-center gap-2 lg:block">
				<span className="font-mono text-xs font-semibold text-foreground">
					{row.rankLabel}
				</span>
			</div>
			<div className="min-w-0">
				<p className="break-words font-medium text-foreground">{row.title}</p>
				{row.recommendedFirst ? (
					<Badge variant="secondary" className="mt-2 max-w-full">
						Recommended first
					</Badge>
				) : null}
				<p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground lg:hidden">
					{row.buyerImpact}
				</p>
			</div>
			<DenseLabel label="Category" value={row.categoryLabel} />
			<DenseLabel
				label="Severity"
				value={row.severityLabel}
				valueClassName={getSeverityClassName(row.severityLabel)}
			/>
			<DenseLabel label="Confidence" value={row.confidenceLabel} mono />
			<p className="hidden min-w-0 text-sm leading-5 text-muted-foreground lg:line-clamp-2">
				{row.buyerImpact}
			</p>
			<DenseLabel label="Proof" value={row.proofabilityLabel} />
			<DenseLabel label="Permission" value={row.permissionRequiredLabel} />
			<DenseLabel label="Workflow" value={row.recommendedWorkflowLabel} />
			<DenseLabel
				label="Status"
				value={row.statusLabel}
				valueClassName="capitalize"
			/>
			<ArrowUpRight
				className="hidden size-4 text-muted-foreground lg:block"
				aria-hidden
			/>
		</Link>
	);
}

function DenseLabel({
	label,
	value,
	valueClassName,
	mono = false,
}: {
	label: string;
	value: string;
	valueClassName?: string;
	mono?: boolean;
}) {
	return (
		<div className="grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] gap-2 lg:block">
			<span className="text-xs font-medium text-muted-foreground lg:hidden">
				{label}
			</span>
			<span
				className={cn(
					"block min-w-0 truncate text-sm text-foreground",
					mono ? "font-mono text-xs" : null,
					valueClassName,
				)}
				title={value}
			>
				{value}
			</span>
		</div>
	);
}

function getSeverityClassName(severityLabel: string) {
	if (severityLabel === "Critical" || severityLabel === "High") {
		return "font-semibold";
	}

	return undefined;
}
