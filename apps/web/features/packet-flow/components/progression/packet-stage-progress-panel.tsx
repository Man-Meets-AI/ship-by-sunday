"use client";

import {
	type PacketStageDefinition,
	type PacketStageStatus,
} from "@packet-compiler";
import { derivePacketStageProgressItems } from "@/features/packet-flow/lib/packet-stage-progress";
import { type RoutedPacketStageId } from "@/features/packet-flow/lib/packet-stage-routes";
import { PacketStageStepStrip } from "./packet-stage-step-strip";

export function PacketStageProgressPanel({
	stageId,
	stage,
	stageStatus,
	activeStepId,
}: {
	stageId: RoutedPacketStageId;
	stage: PacketStageDefinition;
	stageStatus: PacketStageStatus;
	activeStepId: string;
}) {
	const progressItems = derivePacketStageProgressItems(
		stage,
		stageStatus,
		activeStepId,
	);

	return (
		<section className="border-b border-border/60 pb-6">
			<PacketStageStepStrip
				stageId={stageId}
				activeStepId={activeStepId}
				progressItems={progressItems}
			/>
		</section>
	);
}
