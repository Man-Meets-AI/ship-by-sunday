"use client";

import Link from "next/link";
import type { PacketStageId, PacketStageStatus } from "@packet-compiler";
import {
	getPacketStageDefinition,
	packetStageDefinitions,
} from "@packet-compiler";
import { Badge } from "@/components/ui/badge";

export function PacketStageNav({
	currentStageId,
	stageStatuses,
}: {
	currentStageId: PacketStageId;
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
				const isStageOpen =
					isCurrent || stage.id === "start" || Boolean(status?.isUnlocked);
				const badge = (
					<Badge
						variant={tone}
						className={
							isStageOpen ? "cursor-pointer px-3 py-1" : "px-3 py-1 opacity-60"
						}
						aria-disabled={!isStageOpen}
					>
						{stage.label}
					</Badge>
				);

				if (!isStageOpen) {
					return <span key={stage.id}>{badge}</span>;
				}

				return (
					<Link key={stage.id} href={getPacketStageDefinition(stage.id).route}>
						{badge}
					</Link>
				);
			})}
		</div>
	);
}
