"use client";

import Link from "next/link";
import {
	getPublicPackLabelForStage,
	getPacketStageDefinition,
	type PacketStageStatus,
} from "@packet-compiler";
import { Button } from "@/components/ui/button";
import { packetFieldLabel } from "@/features/packet-flow/lib/packet-field-helpers";

export function PacketStageSidebar({
	stageStatus,
	downloadHref,
	nextStageId,
}: {
	stageStatus: PacketStageStatus;
	downloadHref?: string;
	nextStageId?: "design" | "marketing" | "build-plan" | "review";
}) {
	const downloadLabel =
		stageStatus.stageId === "design" ||
		stageStatus.stageId === "marketing" ||
		stageStatus.stageId === "build-plan"
			? `Download ${getPublicPackLabelForStage(stageStatus.stageId)}`
			: "Download pack";
	const stageLabel = getPacketStageDefinition(stageStatus.stageId).label;
	const missingFieldLabels = stageStatus.missingFactKeys.map(packetFieldLabel);

	return (
		<aside className="space-y-4 border-t border-border/60 pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
			<div className="space-y-2">
				<p className="text-sm font-medium text-muted-foreground">
					{stageStatus.isComplete ? "Section ready" : "Still to lock in"}
				</p>
				<h2 className="text-lg font-semibold tracking-tight">
					{stageStatus.isComplete
						? `${stageLabel} is ready.`
						: `Close ${stageLabel}.`}
				</h2>
				<p className="text-sm leading-6 text-muted-foreground">
					{stageStatus.isComplete
						? "All required answers for this section are saved."
						: `${missingFieldLabels.length} answer${missingFieldLabels.length === 1 ? "" : "s"} still need attention before this section is complete.`}
				</p>
			</div>
			{missingFieldLabels.length ? (
				<ul className="space-y-2 border-t border-border/60 pt-4 text-sm text-muted-foreground">
					{missingFieldLabels.map((label) => (
						<li key={label}>{label}</li>
					))}
				</ul>
			) : null}
			<div className="flex flex-col gap-3 border-t border-border/60 pt-4">
				{downloadHref ? (
					<Button asChild className="w-full">
						<Link href={downloadHref}>{downloadLabel}</Link>
					</Button>
				) : null}
				{nextStageId ? (
					<Button asChild variant="outline" className="w-full">
						<Link href={getPacketStageDefinition(nextStageId).route}>
							Continue to {getPacketStageDefinition(nextStageId).label}
						</Link>
					</Button>
				) : null}
			</div>
		</aside>
	);
}
