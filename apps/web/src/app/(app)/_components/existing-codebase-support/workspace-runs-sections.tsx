import { History } from "lucide-react";

import type { WorkspaceRunsDoctorPassRow } from "@/app/(app)/_lib/workspace-support-read-model";
import { ProtectedRoutePanel } from "@/components/app/protected-route-surface";
import { routeConfig } from "@/config/product";
import {
	WorkspaceSupportDenseText,
	WorkspaceSupportEmptyState,
} from "./workspace-support-shared";

export function DoctorPassRuns({
	rows,
}: {
	rows: WorkspaceRunsDoctorPassRow[];
}) {
	return (
		<section className="grid gap-3">
			<div className="flex items-center gap-2">
				<History className="size-4 text-foreground" aria-hidden />
				<h2 className="text-base font-semibold text-foreground">
					Doctor-pass history
				</h2>
			</div>
			{rows.length === 0 ? (
				<ProtectedRoutePanel className="px-4 py-3 text-sm text-muted-foreground">
					Doctor-pass runs appear here after the local runner starts a pass.
				</ProtectedRoutePanel>
			) : (
				<ProtectedRoutePanel>
					<div className="hidden grid-cols-[minmax(9rem,0.9fr)_8rem_7rem_8rem_7rem_minmax(10rem,1fr)] gap-3 border-b border-border/60 bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground lg:grid">
						<span>Run</span>
						<span>Started</span>
						<span>Runner</span>
						<span>Sync</span>
						<span>Findings</span>
						<span>Local report</span>
					</div>
					<div className="divide-y divide-border/60">
						{rows.map((row) => (
							<DoctorPassRunRow key={row.id} row={row} />
						))}
					</div>
				</ProtectedRoutePanel>
			)}
		</section>
	);
}

export function EmptyRuns() {
	return (
		<WorkspaceSupportEmptyState
			title="No runs yet"
			description="Runs appear after the doctor pass starts. Recurring worker queues are not part of this Crawl and Walk surface."
			href={routeConfig.workspaceDoctorPass}
			action="Open Doctor Pass"
		/>
	);
}

function DoctorPassRunRow({ row }: { row: WorkspaceRunsDoctorPassRow }) {
	return (
		<div className="grid gap-3 px-3 py-3 text-sm lg:grid-cols-[minmax(9rem,0.9fr)_8rem_7rem_8rem_7rem_minmax(10rem,1fr)] lg:items-center">
			<WorkspaceSupportDenseText label="Run" value={row.title} />
			<WorkspaceSupportDenseText
				label="Started"
				value={row.startedLabel}
				mono
			/>
			<WorkspaceSupportDenseText label="Runner" value={row.runnerModeLabel} />
			<WorkspaceSupportDenseText label="Sync" value={row.syncStatusLabel} />
			<WorkspaceSupportDenseText
				label="Findings"
				value={row.findingsCountLabel}
				mono
			/>
			<WorkspaceSupportDenseText
				label="Local report"
				value={row.localReportRef ?? "Not written"}
				mono
			/>
			{row.blockedReason ? (
				<p className="text-sm leading-6 text-muted-foreground lg:col-span-6">
					Blocked: {row.blockedReason}
				</p>
			) : null}
		</div>
	);
}
