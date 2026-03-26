"use client";

import {
	DESIGN_PACK_LABEL,
	MARKETING_PACK_LABEL,
	BUILD_PACK_LABEL,
	getPacketStageDefinition,
	type PacketStageDefinition,
	type PacketStageStatus,
} from "@packet-compiler";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { derivePacketStageProgressItems } from "@/features/packet-flow/lib/packet-stage-progress";

const stageRewardCopy = {
	product: {
		title: `Unlock ${getPacketStageDefinition("design").label}`,
		description: "Lock the product foundation to open the Design section next.",
	},
	design: {
		title: DESIGN_PACK_LABEL,
		description:
			"Complete this section to make the Design Pack downloadable from Review.",
	},
	marketing: {
		title: MARKETING_PACK_LABEL,
		description:
			"Complete this section to make the Marketing Pack downloadable from Review.",
	},
	"build-plan": {
		title: BUILD_PACK_LABEL,
		description:
			"Complete this section to make the Build Pack downloadable from Review.",
	},
} as const;

export function PacketStageProgressPanel({
	stage,
	stageStatus,
	activeStepIndex,
	onSelectStep,
}: {
	stage: PacketStageDefinition;
	stageStatus: PacketStageStatus;
	activeStepIndex: number;
	onSelectStep: (stepIndex: number) => void;
}) {
	const progressItems = derivePacketStageProgressItems(
		stage,
		stageStatus,
		activeStepIndex,
	);
	const currentObjective = stage.steps[stageStatus.currentStepIndex];
	const reward = stageRewardCopy[stage.id as keyof typeof stageRewardCopy];

	return (
		<Card>
			<CardHeader className="gap-4">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">
							Level objective
						</p>
						<CardTitle>
							{stageStatus.isComplete
								? `${stage.label} is locked in.`
								: `Complete ${currentObjective?.label ?? stage.label}.`}
						</CardTitle>
					</div>
					<Badge variant={stageStatus.isComplete ? "secondary" : "outline"}>
						{stageStatus.isComplete ? "Reward unlocked" : "Current run"}
					</Badge>
				</div>
				<div className="grid gap-3 md:grid-cols-2">
					<div className="rounded-xl border border-border/70 bg-muted/30 p-4">
						<p className="text-sm font-medium">Current objective</p>
						<p className="mt-1 text-sm text-muted-foreground">
							{stageStatus.isComplete
								? "All required facts for this section are saved."
								: `You can browse any step in this section, but ${currentObjective?.label ?? "the current objective"} is the next required checkpoint.`}
						</p>
					</div>
					<div className="rounded-xl border border-border/70 bg-muted/30 p-4">
						<p className="text-sm font-medium">Section reward</p>
						<p className="mt-1 text-sm">{reward.title}</p>
						<p className="mt-1 text-sm text-muted-foreground">
							{reward.description}
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				{progressItems.map((item, index) => (
					<Button
						key={item.id}
						type="button"
						variant={
							item.state === "active"
								? "default"
								: item.state === "complete"
									? "secondary"
									: "outline"
						}
						className={cn(
							"h-auto min-h-24 flex-col items-start justify-start gap-2 whitespace-normal px-4 py-3 text-left",
							item.state === "open" && "border-dashed",
						)}
						aria-pressed={item.state === "active"}
						onClick={() => onSelectStep(index)}
					>
						<div className="space-y-1">
							<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
								Step {item.stepNumber}
							</p>
							<p className="text-sm font-semibold">{item.label}</p>
						</div>
						<p className="text-xs text-muted-foreground">
							{item.isCurrentObjective
								? "Current objective"
								: item.state === "complete"
									? "Required facts saved"
									: item.missingRequiredFactKeys.length > 0
										? `${item.missingRequiredFactKeys.length} required field${item.missingRequiredFactKeys.length === 1 ? "" : "s"} left`
										: "Optional details available"}
						</p>
					</Button>
				))}
			</CardContent>
		</Card>
	);
}
