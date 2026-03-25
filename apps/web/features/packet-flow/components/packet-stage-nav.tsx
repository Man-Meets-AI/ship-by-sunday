"use client";

import Link from "next/link";
import type { PacketStageStatus } from "@packet-compiler";
import {
	getPacketStageDefinition,
	packetStageDefinitions,
} from "@packet-compiler";
import { Badge } from "@/components/ui/badge";

export function PacketStageNav({
	currentStageId,
	stageStatuses,
}: {
	currentStageId: string;
	stageStatuses: PacketStageStatus[];
}) {
	return (
		<div className="flex flex-wrap gap-2">
			{packetStageDefinitions.map((stage) => {
				const status = stageStatuses.find(
					(stageStatus) => stageStatus.stageId === stage.id,
				);
				const isCurrent = currentStageId === stage.id;
				const tone = isCurrent
					? "default"
					: status?.isComplete
						? "secondary"
						: "outline";

				return (
					<Link key={stage.id} href={getPacketStageDefinition(stage.id).route}>
						<Badge variant={tone} className="cursor-pointer px-3 py-1">
							{stage.label}
						</Badge>
					</Link>
				);
			})}
		</div>
	);
}
