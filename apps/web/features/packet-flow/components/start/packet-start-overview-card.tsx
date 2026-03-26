import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	BUILD_PACK_LABEL,
	DESIGN_PACK_LABEL,
	MARKETING_PACK_LABEL,
	STARTER_SNAPSHOT_LABEL,
	getPacketStageDefinition,
	type PacketStageId,
} from "@packet-compiler";

export function PacketStartOverviewCard({
	nextStageId,
}: {
	nextStageId: PacketStageId;
}) {
	return (
		<Card>
			<CardHeader className="gap-3">
				<div className="space-y-1">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
						Start here
					</p>
					<CardTitle>How this works</CardTitle>
				</div>
				<p className="text-sm text-muted-foreground">
					This is not a pile of filler lessons. You move through Product,
					Design, Marketing, Build Plan, and Review so you can ship something
					real this weekend.
				</p>
			</CardHeader>
			<CardContent className="space-y-4 text-sm text-muted-foreground">
				<p>
					Watch the welcome video, then work the flow in order. Do the reps in
					each section before you move on.
				</p>
				<p>
					By the end, you will have the {DESIGN_PACK_LABEL},{" "}
					{MARKETING_PACK_LABEL}, {BUILD_PACK_LABEL}, and the final{" "}
					{STARTER_SNAPSHOT_LABEL}.
				</p>
				<Button asChild>
					<Link href={getPacketStageDefinition(nextStageId).route}>
						Open the packet flow
					</Link>
				</Button>
			</CardContent>
		</Card>
	);
}
