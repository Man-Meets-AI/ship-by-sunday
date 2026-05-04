import { Check, Copy, RefreshCw, Terminal, XCircle, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { buildWorkspaceSetupReadinessModel } from "@/app/(workspace)/_lib/workspace-setup-readiness-model";
import { cn } from "@/lib/utils";

type SetupPairingModel = ReturnType<
	typeof buildWorkspaceSetupReadinessModel
>["pairing"];

const pairingStages = [
	"waiting",
	"runner_detected",
	"verifying_machine",
	"verifying_project",
	"paired",
] as const;

const pairingStageLabels = {
	waiting: "waiting",
	runner_detected: "runner detected",
	verifying_machine: "verifying machine",
	verifying_project: "verifying project",
	paired: "paired",
} as const;

function CopyCommandButton({ command }: { command: string }) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) {
			return;
		}

		const timeout = window.setTimeout(() => setCopied(false), 1600);
		return () => window.clearTimeout(timeout);
	}, [copied]);

	async function copyCommand() {
		await navigator.clipboard.writeText(command);
		setCopied(true);
	}

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			onClick={() => void copyCommand()}
			aria-label={copied ? "Copied pairing command" : "Copy pairing command"}
		>
			{copied ? (
				<Check className="size-3.5" aria-hidden />
			) : (
				<Copy className="size-3.5" aria-hidden />
			)}
			{copied ? "Copied" : "Copy"}
		</Button>
	);
}

function CommandLine({
	label,
	command,
}: {
	label: string;
	command: string | null;
}) {
	return (
		<div className="rounded-lg border border-border/60 bg-muted/20">
			<div className="flex items-center justify-between gap-2 border-b border-border/50 px-3 py-2">
				<div className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
					<Terminal className="size-3.5 shrink-0" aria-hidden />
					<span className="truncate">{label}</span>
				</div>
				{command ? <CopyCommandButton command={command} /> : null}
			</div>
			<pre className="overflow-x-auto px-3 py-3 text-xs leading-6">
				<code className="font-mono">
					{command ?? "Regenerate a pairing token."}
				</code>
			</pre>
		</div>
	);
}

export function SetupPairingPanel({
	pairing,
	onRegenerateToken,
	onUseOneShotMode,
	onCancelPairing,
	pendingAction,
}: {
	pairing: SetupPairingModel;
	onRegenerateToken: () => void;
	onUseOneShotMode: () => void;
	onCancelPairing: () => void;
	pendingAction: "regenerate" | "one_shot" | "cancel" | null;
}) {
	const stageStatus = pairing.status === "revoked" ? "waiting" : pairing.status;

	return (
		<section className="rounded-xl border border-border/60 bg-background">
			<div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
				<div className="min-w-0 space-y-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<h2 className="text-base font-semibold text-foreground">
								Local runner pairing
							</h2>
							<p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
								{pairing.description}
							</p>
						</div>
						<span className="inline-flex h-7 w-fit items-center rounded-md border border-border/60 bg-muted/40 px-2.5 text-xs font-medium text-foreground">
							{pairing.statusLabel}
						</span>
					</div>

					<div className="grid gap-2 sm:grid-cols-5">
						{pairingStages.map((stage) => {
							const active = stage === stageStatus;
							const complete =
								pairingStages.indexOf(stage) <
								pairingStages.indexOf(stageStatus);
							return (
								<div
									key={stage}
									className={cn(
										"min-h-12 rounded-lg border px-2.5 py-2 text-xs leading-4",
										active
											? "border-foreground/30 bg-foreground text-background"
											: complete
												? "border-emerald-500/25 bg-emerald-500/10 text-foreground"
												: "border-border/50 bg-muted/20 text-muted-foreground",
									)}
								>
									{pairingStageLabels[stage]}
								</div>
							);
						})}
					</div>

					<CommandLine
						label="Primary command"
						command={pairing.primaryCommand}
					/>
					<CommandLine label="npx fallback" command={pairing.fallbackCommand} />
				</div>

				<div className="grid gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
					<div>
						<div className="text-xs font-medium text-muted-foreground">
							Token
						</div>
						<div className="mt-1 text-sm font-medium text-foreground">
							{pairing.tokenExpiresLabel}
						</div>
					</div>
					<div>
						<div className="text-xs font-medium text-muted-foreground">
							Expected repo root
						</div>
						<div className="mt-1 text-sm leading-5 text-foreground">
							{pairing.expectedRepoRoot}
						</div>
					</div>
					<div className="grid gap-2 text-sm">
						<div className="flex items-center justify-between gap-3 rounded-md bg-background/70 px-3 py-2">
							<span className="text-muted-foreground">Daemon</span>
							<span className="font-medium">{pairing.daemonStatusLabel}</span>
						</div>
						<div className="flex items-center justify-between gap-3 rounded-md bg-background/70 px-3 py-2">
							<span className="text-muted-foreground">One-shot</span>
							<span className="font-medium">{pairing.oneShotStatusLabel}</span>
						</div>
					</div>
					<div className="flex flex-col gap-2 pt-1">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={onRegenerateToken}
							disabled={pendingAction !== null}
						>
							<RefreshCw className="size-3.5" aria-hidden />
							{pendingAction === "regenerate"
								? "Regenerating..."
								: "Regenerate token"}
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={onUseOneShotMode}
							disabled={pendingAction !== null}
						>
							<Zap className="size-3.5" aria-hidden />
							{pendingAction === "one_shot"
								? "Preparing one-shot..."
								: "Use one-shot mode"}
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={onCancelPairing}
							disabled={!pairing.canCancel || pendingAction !== null}
						>
							<XCircle className="size-3.5" aria-hidden />
							{pendingAction === "cancel" ? "Canceling..." : "Cancel pairing"}
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
