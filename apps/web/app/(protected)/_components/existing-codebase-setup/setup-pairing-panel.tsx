import { RefreshCw, Wrench, XCircle, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { buildWorkspaceSetupReadinessModel } from "@/app/(protected)/_lib/workspace-setup-readiness-model";
import { cn } from "@/lib/utils";
import {
	buildPackageRunnerCommands,
	SetupPackageRunnerCommand,
} from "./setup-package-runner-command";

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
	const isPaired = pairing.status === "paired";
	const packageRunnerCommands = buildPackageRunnerCommands(pairing);
	const hasCommand = packageRunnerCommands.length > 0;
	const hasRepairCommand = isPaired && hasCommand;

	return (
		<section className="rounded-xl border border-border/60 bg-background">
			<div
				className={cn(
					"grid gap-5 p-4 sm:p-5",
					isPaired
						? "lg:grid-cols-1"
						: "lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]",
				)}
			>
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

					{isPaired ? (
						<div className="flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-sm leading-6 text-muted-foreground">
								<span className="font-medium text-foreground">
									{pairing.repositoryLabel}
								</span>{" "}
								is paired to {pairing.activeRunnerLabel} over{" "}
								{pairing.runnerModeLabel}. Last check {pairing.lastSyncedLabel}.
							</p>
							<div className="flex flex-wrap gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={onRegenerateToken}
									disabled={pendingAction !== null}
								>
									<Wrench className="size-3.5" aria-hidden />
									{pendingAction === "regenerate"
										? "Preparing repair..."
										: "Repair pairing"}
								</Button>
								{pairing.canCancel ? (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={onCancelPairing}
										disabled={pendingAction !== null}
									>
										<XCircle className="size-3.5" aria-hidden />
										{pendingAction === "cancel"
											? "Canceling..."
											: "Cancel repair token"}
									</Button>
								) : null}
							</div>
						</div>
					) : (
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
					)}

					{!isPaired || hasRepairCommand ? (
						<SetupPackageRunnerCommand
							label={isPaired ? "Repair command" : "Pairing command"}
							commands={packageRunnerCommands}
						/>
					) : null}
				</div>

				{isPaired ? null : (
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
								<span className="font-medium">
									{pairing.oneShotStatusLabel}
								</span>
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
							{pairing.canCancel ? (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={onCancelPairing}
									disabled={pendingAction !== null}
								>
									<XCircle className="size-3.5" aria-hidden />
									{pendingAction === "cancel"
										? "Canceling..."
										: "Cancel pairing"}
								</Button>
							) : null}
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
