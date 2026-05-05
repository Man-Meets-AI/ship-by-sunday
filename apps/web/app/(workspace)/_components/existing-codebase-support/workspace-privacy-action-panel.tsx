import { AlertTriangle, ShieldCheck, Trash2 } from "lucide-react";

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
		<section className="rounded-xl border border-border/60 bg-background p-5">
			<div className="flex items-start gap-3">
				<ShieldCheck className="mt-0.5 size-4 text-foreground" aria-hidden />
				<div className="min-w-0">
					<h2 className="text-base font-semibold text-foreground">Controls</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						These actions change hosted workspace state only. Local files and
						runner credentials are managed in terminal.
					</p>
				</div>
			</div>
			<div className="mt-4 grid gap-2">
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
			<p className="mt-4 text-sm leading-6 text-muted-foreground">
				{localReportDeletionNote}
			</p>
		</section>
	);
}
