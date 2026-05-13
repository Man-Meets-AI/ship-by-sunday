import { EyeOff } from "lucide-react";

import {
	buildWorkspacePrivacyModel,
	type WorkspacePrivacySharingRow,
} from "@/app/(protected)/_lib/workspace-support-read-model";
import { WorkspaceSupportFact } from "./workspace-support-shared";

type WorkspacePrivacyModel = ReturnType<typeof buildWorkspacePrivacyModel>;

export function PrivacyStatusPanel({
	privacyModel,
}: {
	privacyModel: WorkspacePrivacyModel;
}) {
	return (
		<section className="rounded-xl border border-border/60 bg-background p-4">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-base font-semibold text-foreground">
					Execution boundary
				</h2>
				<span className="rounded-full border border-border/60 px-2 py-1 font-mono text-[11px] text-muted-foreground">
					local lane
				</span>
			</div>
			<div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
				<WorkspaceSupportFact
					label="Runner mode"
					value={privacyModel.runnerModeLabel}
				/>
				<WorkspaceSupportFact
					label="Runner health"
					value={privacyModel.runnerHealthLabel}
				/>
				<WorkspaceSupportFact
					label="Last heartbeat"
					value={privacyModel.lastHeartbeatLabel}
				/>
				<WorkspaceSupportFact
					label="Structured findings"
					value={privacyModel.structuredFindingsCountLabel}
				/>
			</div>
		</section>
	);
}

export function PrivacySharingPanel({
	rows,
}: {
	rows: WorkspacePrivacySharingRow[];
}) {
	const localRows = rows.filter((row) => row.statusLabel === "Disabled");
	const syncRows = rows.filter((row) => row.statusLabel !== "Disabled");

	return (
		<section className="rounded-xl border border-border/60 bg-background p-4">
			<div className="flex items-center gap-2">
				<EyeOff className="size-4 text-foreground" aria-hidden />
				<div className="min-w-0">
					<h2 className="text-base font-semibold text-foreground">
						Data boundary
					</h2>
				</div>
			</div>
			<div className="mt-3 grid gap-3 md:grid-cols-2">
				<PrivacyBoundaryBucket
					label="Stays local"
					status="Not uploaded"
					rows={localRows}
				/>
				<PrivacyBoundaryBucket
					label="Can sync"
					status="Approval required"
					rows={syncRows}
				/>
			</div>
		</section>
	);
}

function PrivacyBoundaryBucket({
	label,
	rows,
	status,
}: {
	label: string;
	rows: WorkspacePrivacySharingRow[];
	status: string;
}) {
	return (
		<div className="rounded-lg border border-border/60 bg-muted/15 p-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm font-medium text-foreground">{label}</p>
				<span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
					{status}
				</span>
			</div>
			<ul className="mt-2 grid gap-1 text-sm leading-5 text-muted-foreground">
				{rows.map((row) => (
					<li key={row.id}>{row.label}</li>
				))}
			</ul>
		</div>
	);
}

export function PrivacySyncPreviewPanel({
	privacyModel,
}: {
	privacyModel: WorkspacePrivacyModel;
}) {
	return (
		<section className="rounded-xl border border-border/60 bg-background p-4">
			<h2 className="text-base font-semibold text-foreground">
				Last sync preview
			</h2>
			<div className="mt-3 grid gap-3 sm:grid-cols-3">
				<WorkspaceSupportFact
					label="Status"
					value={privacyModel.lastSyncPreviewLabel}
				/>
				<WorkspaceSupportFact
					label="Digest"
					value={privacyModel.lastSyncPreviewDigest ?? "Not available"}
					mono
				/>
				<WorkspaceSupportFact
					label="Local report ref"
					value={privacyModel.localReportRef ?? "Not available"}
					mono
				/>
			</div>
		</section>
	);
}
