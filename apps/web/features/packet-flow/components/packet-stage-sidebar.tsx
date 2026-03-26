"use client";

import Link from "next/link";
import {
	getPublicPackLabelForStage,
	getPacketStageDefinition,
	type PacketStageStatus,
} from "@packet-compiler";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Stage status</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<Badge variant={stageStatus.isComplete ? "secondary" : "outline"}>
						{stageStatus.isComplete ? "Ready" : "In progress"}
					</Badge>
					{stageStatus.missingFactKeys.length ? (
						<ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
							{stageStatus.missingFactKeys.map((fieldKey) => (
								<li key={fieldKey}>{packetFieldLabel(fieldKey)}</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-muted-foreground">
							This stage has all required facts.
						</p>
					)}
				</CardContent>
			</Card>
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
	);
}
