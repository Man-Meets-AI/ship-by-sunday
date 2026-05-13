"use client";

import {
	AlertTriangle,
	CheckCircle2,
	ChevronDown,
	Download,
	FileJson,
	GitBranch,
	Lock,
	PlayCircle,
} from "lucide-react";
import { useState } from "react";

import type { buildWorkspaceSetupReadinessModel } from "@/app/(app)/_lib/workspace-setup-readiness-model";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
	buildPackageRunnerCommandsFromBunCommand,
	type PackageRunnerId,
	SetupPackageRunnerCommand,
} from "./setup-package-runner-command";

type WorkerInstallModel = ReturnType<
	typeof buildWorkspaceSetupReadinessModel
>["workerInstall"];

const maxVisibleRefs = 5;

const packageScriptPrefixes: Record<PackageRunnerId, string> = {
	bun: "bun",
	npm: "npm",
	pnpm: "pnpm",
	yarn: "yarn",
};

const statusIcon = {
	waiting: Lock,
	ready: PlayCircle,
	previewed: FileJson,
	installed: CheckCircle2,
	blocked: AlertTriangle,
} as const;

function buildPackageScriptCommand(
	packageRunner: PackageRunnerId,
	scriptName: string,
) {
	return `${packageScriptPrefixes[packageRunner]} run ${scriptName}`;
}

function CappedRefList({ label, refs }: { label: string; refs: string[] }) {
	if (refs.length === 0) {
		return null;
	}

	const visibleRefs = refs.slice(0, maxVisibleRefs);
	const remainingCount = refs.length - visibleRefs.length;

	return (
		<div>
			<div className="text-xs font-medium text-muted-foreground">{label}</div>
			<ul className="mt-2 grid gap-1.5 text-xs leading-5 text-foreground">
				{visibleRefs.map((ref) => (
					<li key={ref} className="truncate rounded-md bg-muted/30 px-2 py-1">
						{ref}
					</li>
				))}
				{remainingCount > 0 ? (
					<li className="text-muted-foreground">and {remainingCount} more</li>
				) : null}
			</ul>
		</div>
	);
}

function DetailRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col gap-1 rounded-md bg-muted/25 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
			<span className="text-xs font-medium text-muted-foreground">{label}</span>
			<span className="min-w-0 break-words text-sm text-foreground">
				{value}
			</span>
		</div>
	);
}

export function SetupWorkerInstallPanel({
	workerInstall,
}: {
	workerInstall: WorkerInstallModel;
}) {
	const [packageRunner, setPackageRunner] = useState<PackageRunnerId>("bun");
	const [advancedOpen, setAdvancedOpen] = useState(false);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const StatusIcon = statusIcon[workerInstall.status];
	const previewCommands = buildPackageRunnerCommandsFromBunCommand(
		workerInstall.previewCommand,
	);
	const installCommands = buildPackageRunnerCommandsFromBunCommand(
		workerInstall.installCommand,
	);
	const noCommitCommands = buildPackageRunnerCommandsFromBunCommand(
		workerInstall.noCommitCommand,
	);
	const interactiveCommands = buildPackageRunnerCommandsFromBunCommand(
		workerInstall.interactiveCommand,
	);
	const docsValidateCommand = buildPackageScriptCommand(
		packageRunner,
		"docs:validate",
	);
	const workerTestCommand = buildPackageScriptCommand(
		packageRunner,
		"worker:test",
	);
	const hasSyncedDetails =
		workerInstall.reportRef ||
		workerInstall.localProofRef ||
		workerInstall.createdRefs.length > 0 ||
		workerInstall.changedRefs.length > 0 ||
		workerInstall.blockerReasons.length > 0 ||
		workerInstall.proofCommandResults.length > 0;

	return (
		<section className="rounded-xl border border-border/60 bg-background">
			<div className="grid gap-5 p-4 sm:p-5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div className="min-w-0">
						<div className="flex items-center gap-2">
							<Download className="size-4 text-muted-foreground" aria-hidden />
							<h2 className="text-base font-semibold text-foreground">
								Worker install
							</h2>
						</div>
						<p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
							{workerInstall.description}
						</p>
					</div>
					<span
						className={cn(
							"inline-flex h-7 w-fit items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium",
							workerInstall.status === "blocked"
								? "border-destructive/30 bg-destructive/10 text-destructive"
								: workerInstall.status === "installed"
									? "border-emerald-500/25 bg-emerald-500/10 text-foreground"
									: "border-border/60 bg-muted/40 text-foreground",
						)}
					>
						<StatusIcon className="size-3.5" aria-hidden />
						{workerInstall.statusLabel}
					</span>
				</div>

				<div className="grid gap-3 rounded-lg border border-border/60 bg-muted/15 p-3 text-sm leading-6 text-muted-foreground">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-2">
							<GitBranch className="size-4 shrink-0" aria-hidden />
							<span>
								Install commits by default on{" "}
								<span className="font-medium text-foreground">
									{workerInstall.branchLabel}
								</span>
								.
							</span>
						</div>
						<span className="text-xs font-medium text-muted-foreground">
							{workerInstall.latestSyncedLabel}
						</span>
					</div>
					<p>
						Preview is recommended, not required. No Doctor Pass starts
						automatically after install.
					</p>
				</div>

				<div className="grid gap-3 lg:grid-cols-2">
					<SetupPackageRunnerCommand
						label="Preview install command"
						commands={previewCommands}
						disabled={workerInstall.gated}
						onPackageRunnerChange={setPackageRunner}
						selectedPackageRunner={packageRunner}
					/>
					<SetupPackageRunnerCommand
						label="Install command"
						commands={installCommands}
						disabled={workerInstall.gated}
						onPackageRunnerChange={setPackageRunner}
						selectedPackageRunner={packageRunner}
					/>
				</div>

				<Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
					<CollapsibleTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="w-fit px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
						>
							<ChevronDown
								className={cn(
									"size-3.5 transition-transform duration-200 motion-reduce:transition-none",
									advancedOpen && "rotate-180",
								)}
								aria-hidden
							/>
							Advanced install commands
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<div className="mt-3 grid gap-3 lg:grid-cols-2">
							<SetupPackageRunnerCommand
								label="Install without commit"
								commands={noCommitCommands}
								disabled={workerInstall.gated}
								onPackageRunnerChange={setPackageRunner}
								selectedPackageRunner={packageRunner}
							/>
							<SetupPackageRunnerCommand
								label="Interactive license fallback"
								commands={interactiveCommands}
								disabled={workerInstall.gated}
								onPackageRunnerChange={setPackageRunner}
								selectedPackageRunner={packageRunner}
							/>
						</div>
					</CollapsibleContent>
				</Collapsible>

				<div className="grid gap-4 border-t border-border/60 pt-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
					<div>
						<h3 className="text-sm font-semibold text-foreground">
							Generated locally
						</h3>
						<ul className="mt-2 grid gap-2 text-sm leading-6 text-muted-foreground">
							{workerInstall.generatedSummary.map((summary) => (
								<li key={summary}>{summary}</li>
							))}
						</ul>
					</div>
					<div>
						<h3 className="text-sm font-semibold text-foreground">
							Post-install handoff
						</h3>
						<ul className="mt-2 grid gap-2 text-sm leading-6 text-muted-foreground">
							<li>
								Open{" "}
								<span className="font-medium text-foreground">
									docs/worker/install-report.md
								</span>
								.
							</li>
							<li>Read the active Worker Program.</li>
							<li>Continue from the first active ExecPlan.</li>
							<li>
								Run{" "}
								<span className="font-mono text-xs text-foreground">
									./scripts/run-worker.sh --help
								</span>
								.
							</li>
							<li>
								Run{" "}
								<span className="font-mono text-xs text-foreground">
									{docsValidateCommand}
								</span>{" "}
								and{" "}
								<span className="font-mono text-xs text-foreground">
									{workerTestCommand}
								</span>
								.
							</li>
						</ul>
					</div>
				</div>

				<Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
					<CollapsibleTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="w-fit px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
						>
							<ChevronDown
								className={cn(
									"size-3.5 transition-transform duration-200 motion-reduce:transition-none",
									detailsOpen && "rotate-180",
								)}
								aria-hidden
							/>
							Runner sync details
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<div className="mt-3 grid gap-4 rounded-lg border border-border/60 bg-muted/15 p-3">
							{hasSyncedDetails ? (
								<>
									<div className="grid gap-2 sm:grid-cols-2">
										{workerInstall.reportRef ? (
											<DetailRow
												label="Report"
												value={workerInstall.reportRef}
											/>
										) : null}
										{workerInstall.localProofRef ? (
											<DetailRow
												label="Local proof"
												value={workerInstall.localProofRef}
											/>
										) : null}
										{workerInstall.commitHash ? (
											<DetailRow
												label="Commit"
												value={workerInstall.commitHash}
											/>
										) : null}
									</div>
									<div className="grid gap-4 md:grid-cols-2">
										<CappedRefList
											label="Created refs"
											refs={workerInstall.createdRefs}
										/>
										<CappedRefList
											label="Changed refs"
											refs={workerInstall.changedRefs}
										/>
									</div>
									{workerInstall.blockerReasons.length > 0 ? (
										<div>
											<div className="text-xs font-medium text-muted-foreground">
												Blockers
											</div>
											<ul className="mt-2 grid gap-1.5 text-xs leading-5 text-foreground">
												{workerInstall.blockerReasons.map((reason, index) => (
													<li
														key={`${workerInstall.blockerIds[index] ?? reason}-${index}`}
														className="rounded-md bg-destructive/10 px-2 py-1 text-destructive"
													>
														{reason}
													</li>
												))}
											</ul>
										</div>
									) : null}
									{workerInstall.proofCommandResults.length > 0 ? (
										<div>
											<div className="text-xs font-medium text-muted-foreground">
												Proof commands
											</div>
											<ul className="mt-2 grid gap-1.5 text-xs leading-5 text-foreground">
												{workerInstall.proofCommandResults.map((result) => (
													<li
														key={result.commandLabel}
														className="flex items-center justify-between gap-3 rounded-md bg-muted/30 px-2 py-1"
													>
														<span className="truncate">
															{result.commandLabel}
														</span>
														<span className="shrink-0 text-muted-foreground">
															{result.status}
														</span>
													</li>
												))}
											</ul>
										</div>
									) : null}
								</>
							) : (
								<p className="text-sm leading-6 text-muted-foreground">
									No Worker install runner sync has arrived yet.
								</p>
							)}
						</div>
					</CollapsibleContent>
				</Collapsible>
			</div>
		</section>
	);
}
