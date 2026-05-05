import { EyeOff, GitBranch, ShieldCheck } from "lucide-react";

import {
	buildWorkspacePrivacyModel,
	type WorkspaceExecutionSurfaceRow,
	type WorkspacePrivacySharingRow,
} from "@/app/(workspace)/_lib/workspace-support-read-model";
import { Button } from "@/components/ui/button";
import { WorkspaceSupportFact } from "./workspace-support-shared";

type WorkspacePrivacyModel = ReturnType<typeof buildWorkspacePrivacyModel>;

export function PrivacyStatusPanel({
	privacyModel,
}: {
	privacyModel: WorkspacePrivacyModel;
}) {
	return (
		<section className="rounded-xl border border-border/60 bg-background p-5">
			<h2 className="text-base font-semibold text-foreground">
				Execution boundary
			</h2>
			<div className="mt-4 grid gap-3 sm:grid-cols-2">
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
	return (
		<section className="rounded-xl border border-border/60 bg-background p-5">
			<div className="flex items-start gap-3">
				<EyeOff className="mt-0.5 size-4 text-foreground" aria-hidden />
				<div className="min-w-0">
					<h2 className="text-base font-semibold text-foreground">
						Sharing defaults
					</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						The default local lane syncs structured state only after approval.
					</p>
				</div>
			</div>
			<div className="mt-4 divide-y divide-border/60">
				{rows.map((row) => (
					<div
						key={row.id}
						className="grid gap-2 py-3 first:pt-0 sm:grid-cols-[12rem_minmax(0,1fr)_8rem] sm:items-start"
					>
						<p className="font-medium text-foreground">{row.label}</p>
						<p className="text-sm leading-6 text-muted-foreground">
							{row.description}
						</p>
						<p className="text-sm text-foreground">{row.statusLabel}</p>
					</div>
				))}
			</div>
		</section>
	);
}

export function ExecutionSurfacesPanel({
	rows,
}: {
	rows: WorkspaceExecutionSurfaceRow[];
}) {
	return (
		<section className="rounded-xl border border-border/60 bg-background p-5">
			<div className="flex items-start gap-3">
				<ShieldCheck className="mt-0.5 size-4 text-foreground" aria-hidden />
				<div className="min-w-0">
					<h2 className="text-base font-semibold text-foreground">
						Execution surfaces
					</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Each surface has a separate consent, storage, command, proof, and
						sync boundary.
					</p>
				</div>
			</div>
			<div className="mt-4 divide-y divide-border/60">
				{rows.map((row) => (
					<div key={row.id} className="grid gap-3 py-4 first:pt-0">
						<div className="grid gap-1 sm:grid-cols-[12rem_minmax(0,1fr)]">
							<p className="font-medium text-foreground">{row.label}</p>
							<p className="text-sm text-foreground">{row.statusLabel}</p>
						</div>
						<div className="grid gap-2 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
							<ExecutionSurfaceFact label="Consent" value={row.consentLabel} />
							<ExecutionSurfaceFact label="Storage" value={row.storageLabel} />
							<ExecutionSurfaceFact
								label="Commands"
								value={row.commandAuthorityLabel}
							/>
							<ExecutionSurfaceFact
								label="Provider"
								value={row.providerAccessLabel}
							/>
							<ExecutionSurfaceFact label="PR" value={row.prAuthorityLabel} />
							<ExecutionSurfaceFact
								label="Proof"
								value={row.proofDeliveryLabel}
							/>
							<ExecutionSurfaceFact
								label="Sync"
								value={row.syncBoundaryLabel}
							/>
							<ExecutionSurfaceFact
								label="Failure"
								value={row.failureStateLabel}
							/>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

function ExecutionSurfaceFact({
	label,
	value,
}: {
	label: string;
	value: string;
}) {
	return (
		<p>
			<span className="font-medium text-foreground">{label}: </span>
			{value}
		</p>
	);
}

export function PrivacySyncPreviewPanel({
	privacyModel,
}: {
	privacyModel: WorkspacePrivacyModel;
}) {
	return (
		<section className="rounded-xl border border-border/60 bg-background p-5">
			<h2 className="text-base font-semibold text-foreground">
				Last sync preview
			</h2>
			<div className="mt-4 grid gap-3 sm:grid-cols-2">
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

export function ManagedGithubPanel({
	privacyModel,
	actionState,
	onRequest,
	onRevoke,
}: {
	privacyModel: WorkspacePrivacyModel;
	actionState: "idle" | "submitting" | "done" | "error";
	onRequest: () => void;
	onRevoke: () => void;
}) {
	const managedGithub = privacyModel.managedGithub;
	const primaryAction = managedGithub.canRevoke ? onRevoke : onRequest;
	const primaryLabel = managedGithub.canRevoke
		? actionState === "submitting"
			? "Revoking request"
			: "Revoke request"
		: actionState === "submitting"
			? "Requesting review"
			: "Request concierge review";

	return (
		<section className="rounded-xl border border-border/60 bg-background p-5">
			<div className="flex items-start gap-3">
				<GitBranch className="mt-0.5 size-4 text-foreground" aria-hidden />
				<div className="min-w-0">
					<h2 className="text-base font-semibold text-foreground">
						Managed GitHub
					</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Premium concierge execution stays off until this consent packet is
						requested and later approved for a specific action.
					</p>
				</div>
			</div>

			<div className="mt-4 grid gap-3">
				<WorkspaceSupportFact
					label="Status"
					value={managedGithub.statusLabel}
				/>
				<WorkspaceSupportFact
					label="Repository"
					value={managedGithub.repositoryLabel}
				/>
			</div>

			<div className="mt-4 divide-y divide-border/60">
				{managedGithub.boundaryRows.map((row) => (
					<div
						key={row.id}
						className="grid gap-2 py-3 first:pt-0 sm:grid-cols-[11rem_minmax(0,1fr)]"
					>
						<p className="text-sm font-medium text-foreground">{row.label}</p>
						<p className="text-sm leading-6 text-muted-foreground">
							{row.value}
						</p>
					</div>
				))}
			</div>

			{managedGithub.auditRows.length > 0 ? (
				<div className="mt-4 border-t border-border/60 pt-4">
					<h3 className="text-sm font-semibold text-foreground">Audit log</h3>
					<div className="mt-2 grid gap-2">
						{managedGithub.auditRows.map((row) => (
							<p
								key={row.id}
								className="text-sm leading-6 text-muted-foreground"
							>
								<span className="font-mono text-xs text-foreground">
									{row.timestampLabel}
								</span>{" "}
								{row.label}
							</p>
						))}
					</div>
				</div>
			) : null}

			<p className="mt-4 text-sm leading-6 text-muted-foreground">
				{managedGithub.actionNote}
			</p>
			<Button
				type="button"
				className="mt-4 w-full"
				variant="outline"
				disabled={
					actionState === "submitting" ||
					(!managedGithub.canRequest && !managedGithub.canRevoke)
				}
				onClick={primaryAction}
			>
				{primaryLabel}
			</Button>
		</section>
	);
}
