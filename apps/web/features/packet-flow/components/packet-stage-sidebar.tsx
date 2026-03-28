"use client";

import Link from "next/link";
import {
	getPacketStageDefinition,
	type PacketStageDefinition,
	type PacketStageStatus,
} from "@packet-compiler";
import { Button } from "@/components/ui/button";
import { packetFieldLabel } from "@/features/packet-flow/lib/packet-field-helpers";
import { cn } from "@/lib/utils";

export function PacketStageSidebar({
	stage,
	stageStatus,
	nextStageId,
	onLinkNavigate,
	onNavigate,
}: {
	stage: PacketStageDefinition;
	stageStatus: PacketStageStatus;
	nextStageId?: "design" | "marketing" | "build-plan" | "review";
	onLinkNavigate: (event: { preventDefault: () => void }, href: string) => void;
	onNavigate: (href: string) => void;
}) {
	const stageLabel = stage.label;
	const missingKeys = new Set(stageStatus.missingFactKeys);
	const totalFields = stage.steps.reduce(
		(sum, step) => sum + (step.requiredFieldKeys ?? step.fieldKeys).length,
		0,
	);
	const completedFields = totalFields - stageStatus.missingFactKeys.length;
	const progressPercent =
		totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
	const missingByStep = stage.steps
		.map((step) => ({
			stepLabel: step.label,
			missingLabels: (step.requiredFieldKeys ?? step.fieldKeys)
				.filter((key) => missingKeys.has(key))
				.map((fieldKey) => packetFieldLabel(fieldKey)),
		}))
		.filter((step) => step.missingLabels.length > 0);

	return (
		<aside className="space-y-8">
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
						{stageStatus.isComplete ? "Mastery" : "Level XP"}
					</p>
					<span className="tabular-nums text-[0.65rem] font-bold text-muted-foreground/80">
						{completedFields} / {totalFields}
					</span>
				</div>
				<div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/40 ring-1 ring-border/50">
					<div
						className={cn(
							"h-full transition-all duration-700 ease-out",
							stageStatus.isComplete
								? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
								: "bg-foreground shadow-[0_0_8px_rgba(0,0,0,0.1)]",
						)}
						style={{ width: `${progressPercent}%` }}
					/>
					<div className="absolute inset-0 flex justify-between px-0.5 opacity-20">
						{Array.from({ length: Math.min(totalFields, 12) }).map((_, i) => (
							<div key={i} className="h-full w-px bg-background" />
						))}
					</div>
				</div>
			</div>

			<div className="space-y-1.5">
				<h2 className="text-lg font-bold tracking-tight text-foreground">
					{stageStatus.isComplete
						? `${stageLabel} Mastered.`
						: `Current Quest: ${stageLabel}`}
				</h2>
				<p className="text-xs leading-relaxed text-muted-foreground/80">
					{stageStatus.isComplete
						? "Achievement unlocked. You've captured all required answers for this stage."
						: `Resolve ${stageStatus.missingFactKeys.length} objective${stageStatus.missingFactKeys.length === 1 ? "" : "s"} to complete this stage.`}
				</p>
			</div>

			{missingByStep.length > 0 ? (
				<div className="space-y-5">
					<p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
						Pending Objectives
					</p>
					<div className="space-y-4">
						{missingByStep.map((step) => (
							<div key={step.stepLabel} className="space-y-1.5">
								<p className="text-[0.65rem] font-semibold text-foreground/70">
									{step.stepLabel}
								</p>
								<ul className="space-y-1.5">
									{step.missingLabels.map((label) => (
										<li
											key={label}
											className="flex items-start gap-2 text-[0.7rem] leading-4 text-muted-foreground"
										>
											<span className="mt-1 size-1 shrink-0 rounded-full bg-primary/40" />
											{label}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			) : null}

			<div className="flex flex-col gap-3 pt-4">
				{nextStageId ? (
					<Button
						asChild
						variant="outline"
						className="h-11 w-full border-border/60 font-semibold transition-all hover:bg-muted/50"
					>
						<Link
							href={getPacketStageDefinition(nextStageId).route}
							onNavigate={(event) =>
								onLinkNavigate(
									event,
									getPacketStageDefinition(nextStageId).route,
								)
							}
							onClick={(event) => {
								if (event.defaultPrevented) {
									return;
								}

								event.preventDefault();
								onNavigate(getPacketStageDefinition(nextStageId).route);
							}}
						>
							Enter Next Level: {getPacketStageDefinition(nextStageId).label}
						</Link>
					</Button>
				) : null}
			</div>
		</aside>
	);
}
