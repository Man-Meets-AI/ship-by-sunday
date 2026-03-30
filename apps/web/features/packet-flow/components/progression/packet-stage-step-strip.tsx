"use client";

import type { PacketStageProgressItem } from "@/features/packet-flow/lib/packet-stage-progress";
import {
	getPacketStageStepHref,
	type RoutedPacketStageId,
} from "@/features/packet-flow/lib/packet-stage-routes";

export function PacketStageStepStrip({
	stageId,
	activeStepId,
	progressItems,
	onNavigate,
}: {
	stageId: RoutedPacketStageId;
	activeStepId: string;
	progressItems: PacketStageProgressItem[];
	onNavigate: (href: string) => void;
}) {
	return (
		<div className="sm:hidden">
			<label htmlFor={`${stageId}-packet-page-select`} className="sr-only">
				Page
			</label>
			<select
				id={`${stageId}-packet-page-select`}
				value={activeStepId}
				onChange={(event) =>
					onNavigate(getPacketStageStepHref(stageId, event.target.value))
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
