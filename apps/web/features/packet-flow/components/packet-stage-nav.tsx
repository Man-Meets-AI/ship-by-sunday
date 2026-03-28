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
	onLinkNavigate,
	stageStatuses,
	onNavigate,
}: {
	currentStageId: PacketStageId;
	onLinkNavigate?: (
		event: { preventDefault: () => void },
		href: string,
	) => void;
	stageStatuses: PacketStageStatus[];
	onNavigate?: (href: string) => void;
}) {
	return (
		<nav aria-label="Packet stages">
			<ol className="flex flex-wrap gap-x-6 gap-y-3">
				{packetStageDefinitions.map((stage) => {
					const status = stageStatuses.find(
						(stageStatus) => stageStatus.stageId === stage.id,
					);
					const isCurrent = currentStageId === stage.id;
					const isStageOpen =
						isCurrent || stage.id === "start" || Boolean(status?.isUnlocked);
					const label = (
						<span
							className={cn(
								"inline-flex items-baseline gap-2 border-b-2 pb-2 text-sm font-medium transition-colors",
								isCurrent
									? "border-foreground text-foreground"
									: "border-transparent",
								status?.isComplete && !isCurrent && "text-foreground/85",
								!status?.isComplete && !isCurrent && "text-muted-foreground",
								isStageOpen && !isCurrent && "hover:text-foreground",
								!isStageOpen && "cursor-not-allowed text-muted-foreground/30",
							)}
						>
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
								onNavigate={(event) => onLinkNavigate?.(event, stage.route)}
								onClick={(event) => {
									if (event.defaultPrevented || !onNavigate) {
										return;
									}

									event.preventDefault();
									onNavigate(stage.route);
								}}
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
