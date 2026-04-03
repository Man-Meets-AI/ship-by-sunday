"use client";

import type {
	BlueprintStageDefinition,
	BlueprintStageStatus,
} from "@blueprint-compiler";
import { blueprintFieldLabel } from "@/features/blueprint-flow/lib/blueprint-field-helpers";
import { cn } from "@/lib/utils";

export function BlueprintStageSidebar({
	stage,
	stageStatus,
}: {
	stage: BlueprintStageDefinition;
	stageStatus: BlueprintStageStatus;
}) {
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
				.map((fieldKey) => blueprintFieldLabel(fieldKey)),
		}))
		.filter((step) => step.missingLabels.length > 0);

	return (
		<aside className="space-y-6 rounded-2xl border border-border/60 bg-background/80 p-5">
			<div className="space-y-2">
				<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/60">
					Stage progress
				</p>
				<div className="flex items-baseline justify-between gap-4">
					<h2 className="text-lg font-semibold tracking-tight text-foreground">
						{stage.label}
					</h2>
					<span className="tabular-nums text-sm text-muted-foreground">
						{completedFields} / {totalFields}
					</span>
				</div>
				<p className="text-sm leading-6 text-muted-foreground">
					{stageStatus.isComplete
						? "All required answers are in place for this stage."
						: `Resolve ${stageStatus.missingFactKeys.length} required answer${stageStatus.missingFactKeys.length === 1 ? "" : "s"} to complete this stage.`}
				</p>
			</div>

			<div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
				<div
					className={cn(
						"h-full rounded-full transition-all duration-700 ease-out",
						stageStatus.isComplete ? "bg-emerald-500" : "bg-foreground",
					)}
					style={{ width: `${progressPercent}%` }}
				/>
			</div>

			{missingByStep.length > 0 ? (
				<div className="space-y-4">
					<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/60">
						Missing fields
					</p>
					<div className="space-y-4">
						{missingByStep.map((step) => (
							<div key={step.stepLabel} className="space-y-1.5">
								<p className="text-sm font-medium text-foreground/80">
									{step.stepLabel}
								</p>
								<ul className="space-y-1.5">
									{step.missingLabels.map((label) => (
										<li
											key={label}
											className="flex items-start gap-2 text-sm leading-5 text-muted-foreground"
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
		</aside>
	);
}
