import { FileJson, ShieldCheck } from "lucide-react";

import type { WorkspaceRunsWorkflowRow } from "@/app/(app)/_lib/workspace-support-read-model";
import { Button } from "@/components/ui/button";
import { WorkspaceSupportDenseText } from "./workspace-support-shared";

export function WorkflowRuns({ rows }: { rows: WorkspaceRunsWorkflowRow[] }) {
	return (
		<section className="grid gap-3">
			<div className="flex items-center gap-2">
				<ShieldCheck className="size-4 text-foreground" aria-hidden />
				<h2 className="text-base font-semibold text-foreground">
					Approved workflow runs
				</h2>
			</div>
			{rows.length === 0 ? (
				<p className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
					Approved workflow runs appear after a finding decision creates a
					workflow packet.
				</p>
			) : (
				<div className="overflow-hidden rounded-xl border border-border/60 bg-background">
					<div className="hidden grid-cols-[minmax(10rem,1fr)_minmax(10rem,1fr)_8rem_8rem_8rem_8rem_8rem] gap-3 border-b border-border/60 bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground lg:grid">
						<span>Workflow</span>
						<span>Branch</span>
						<span>Profile</span>
						<span>Lease</span>
						<span>Proof</span>
						<span>Delivery</span>
						<span>Proof ref</span>
					</div>
					<div className="divide-y divide-border/60">
						{rows.map((row) => (
							<WorkflowRunRow key={row.id} row={row} />
						))}
					</div>
				</div>
			)}
		</section>
	);
}

function WorkflowRunRow({ row }: { row: WorkspaceRunsWorkflowRow }) {
	return (
		<div className="grid gap-3 px-3 py-3 text-sm lg:grid-cols-[minmax(10rem,1fr)_minmax(10rem,1fr)_8rem_8rem_8rem_8rem_8rem] lg:items-center">
			<WorkspaceSupportDenseText label="Workflow" value={row.workflowLabel} />
			<WorkspaceSupportDenseText label="Branch" value={row.branchLabel} mono />
			<WorkspaceSupportDenseText label="Profile" value={row.profileLabel} />
			<WorkspaceSupportDenseText label="Lease" value={row.leaseStatusLabel} />
			<WorkspaceSupportDenseText label="Proof" value={row.proofStatusLabel} />
			<WorkspaceSupportDenseText
				label="Delivery"
				value={row.deliveryStatusLabel}
			/>
			<div className="grid gap-2">
				{row.localProofRef ? (
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled
						title={row.localProofRef}
					>
						<FileJson className="size-3.5" aria-hidden />
						Open local proof
					</Button>
				) : (
					<span className="text-sm text-muted-foreground">No proof yet</span>
				)}
			</div>
			<p className="text-sm leading-6 text-muted-foreground lg:col-span-7">
				Next recommendation: <span>{row.nextRecommendationLabel}</span>
			</p>
			{row.blockedReason ? (
				<p className="text-sm leading-6 text-muted-foreground lg:col-span-7">
					Blocked: {row.blockedReason}
				</p>
			) : null}
		</div>
	);
}
