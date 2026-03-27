"use client";

import Link from "next/link";
import {
	packetStageDefinitions,
	type PacketStageId,
	type PacketStageStatus,
} from "@packet-compiler";
import { cn } from "@/lib/utils";

export function PacketStageNav({
	currentStageId,
	stageStatuses,
}: {
	currentStageId: PacketStageId;
	stageStatuses: PacketStageStatus[];
}) {
	return (
		<nav aria-label="Packet stages" className="border-b border-border/60 pb-2">
			<ol className="flex flex-wrap gap-x-6 gap-y-3">
				{packetStageDefinitions.map((stage, index) => {
					const status = stageStatuses.find(
						(stageStatus) => stageStatus.stageId === stage.id,
					);
					const isCurrent = currentStageId === stage.id;
					const isStageOpen =
						isCurrent || stage.id === "start" || Boolean(status?.isUnlocked);
					const label = (
						<span
							className={cn(
								"inline-flex items-baseline gap-3 border-b-2 pb-2 text-sm font-medium transition-colors",
								isCurrent
									? "border-foreground text-foreground"
									: "border-transparent",
								status?.isComplete && !isCurrent && "text-foreground/85",
								!status?.isComplete && !isCurrent && "text-muted-foreground",
								isStageOpen && !isCurrent && "hover:text-foreground",
								!isStageOpen && "cursor-not-allowed text-muted-foreground/50",
							)}
						>
							<span className="text-[0.68rem] tracking-[0.22em] text-muted-foreground">
								{String(index + 1).padStart(2, "0")}
							</span>
							<span>{stage.label}</span>
						</span>
					);

					if (!isStageOpen) {
						return (
							<li key={stage.id}>
								<span aria-disabled="true">{label}</span>
							</li>
						);
					}

					return (
						<li key={stage.id}>
							<Link
								href={stage.route}
								aria-current={isCurrent ? "page" : undefined}
								className="block"
							>
								{label}
							</Link>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
