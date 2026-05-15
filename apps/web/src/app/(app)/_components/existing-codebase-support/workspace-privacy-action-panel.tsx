import { AlertTriangle, ShieldCheck, Trash2 } from "lucide-react";

import { ProtectedRoutePanel } from "@/components/app/protected-route-surface";
import { Button } from "@/components/ui/button";

export function PrivacyActionPanel({
	canRevokeRunner,
	canDeleteFindings,
	revokeButtonLabel,
	deleteButtonLabel,
	localReportDeletionNote,
	onRevokeRunner,
	onDeleteFindings,
}: {
	canRevokeRunner: boolean;
	canDeleteFindings: boolean;
	revokeButtonLabel: string;
	deleteButtonLabel: string;
	localReportDeletionNote: string;
	onRevokeRunner: () => void;
	onDeleteFindings: () => void;
}) {
	return (
		<ProtectedRoutePanel className="p-4">
			<div className="flex items-center gap-2">
				<ShieldCheck className="size-4 text-foreground" aria-hidden />
				<div className="min-w-0">
					<h2 className="text-base font-semibold text-foreground">
						Hosted-state controls
					</h2>
				</div>
			</div>
			<div className="mt-3 grid gap-2 rounded-lg border border-border/60 bg-muted/15 p-3 text-xs leading-5 text-muted-foreground">
				<p>
					<span className="font-medium text-foreground">Scope:</span> workspace
					state only.
				</p>
				<p>
					<span className="font-medium text-foreground">Local files:</span>{" "}
					terminal-managed.
				</p>
				<p>
					<span className="font-medium text-foreground">Runner creds:</span> not
					deleted here.
				</p>
			</div>
			<div className="mt-3 grid gap-2">
				<Button
					type="button"
					variant="outline"
					disabled={!canRevokeRunner}
					onClick={onRevokeRunner}
				>
					{revokeButtonLabel}
					<AlertTriangle className="size-4" aria-hidden />
				</Button>
				<Button
					type="button"
					variant="outline"
					disabled={!canDeleteFindings}
					onClick={onDeleteFindings}
				>
					{deleteButtonLabel}
					<Trash2 className="size-4" aria-hidden />
				</Button>
			</div>
			<p className="mt-3 text-sm leading-5 text-muted-foreground">
				{localReportDeletionNote}
			</p>
		</ProtectedRoutePanel>
	);
}
