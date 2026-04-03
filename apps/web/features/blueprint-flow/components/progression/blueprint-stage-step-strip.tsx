"use client";

import type { BlueprintStageProgressItem } from "@/features/blueprint-flow/lib/blueprint-stage-progress";
import {
	getBlueprintStageStepHref,
	type RoutedBlueprintStageId,
} from "@/features/blueprint-flow/lib/blueprint-stage-routes";

export function BlueprintStageStepStrip({
	stageId,
	activeStepId,
	progressItems,
	onNavigate,
}: {
	stageId: RoutedBlueprintStageId;
	activeStepId: string;
	progressItems: BlueprintStageProgressItem[];
	onNavigate: (href: string) => void;
}) {
	return (
		<div className="xl:hidden">
			<label htmlFor={`${stageId}-blueprint-page-select`} className="sr-only">
				Page
			</label>
			<select
				id={`${stageId}-blueprint-page-select`}
				value={activeStepId}
				onChange={(event) =>
					onNavigate(getBlueprintStageStepHref(stageId, event.target.value))
				}
				className="h-12 w-full rounded-2xl border border-border/70 bg-background px-4 text-sm font-medium outline-none transition-colors focus:border-foreground/50"
			>
				{progressItems.map((item) => (
					<option key={item.id} value={item.id}>
						{`${item.stepNumber}. ${item.label}`}
					</option>
				))}
			</select>
		</div>
	);
}
