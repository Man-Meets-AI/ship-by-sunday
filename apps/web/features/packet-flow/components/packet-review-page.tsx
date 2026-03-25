import Link from "next/link";
import { AppShell } from "@/features/course/shared/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PacketStageNav } from "./packet-stage-nav";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import { getPacketStageDefinition } from "@packet-compiler";

export function PacketReviewPage({
	initialWorkspaceState,
}: {
	initialWorkspaceState: PacketWorkspaceState;
}) {
	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			enableMissionQuery={false}
			showSkillRail={false}
			title="Review"
			subtitle="Download the packets now or generate the full starter repo snapshot."
		>
			<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-10 pt-2">
				<PacketStageNav
					currentStageId="review"
					stageStatuses={initialWorkspaceState.stageStatuses}
				/>
				<div className="grid gap-6 xl:grid-cols-3">
					{initialWorkspaceState.stageStatuses
						.filter(
							(stage) =>
								stage.stageId !== "start" && stage.stageId !== "review",
						)
						.map((stage) => (
							<Card key={stage.stageId}>
								<CardHeader>
									<CardTitle>
										{getPacketStageDefinition(stage.stageId).label}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3 text-sm text-muted-foreground">
									<p>
										{stage.isComplete
											? "Ready to download."
											: `Missing ${stage.missingFactKeys.length} required fact(s).`}
									</p>
									<Button asChild variant="outline" className="w-full">
										<Link href={getPacketStageDefinition(stage.stageId).route}>
											Open stage
										</Link>
									</Button>
								</CardContent>
							</Card>
						))}
				</div>
				<Button
					asChild
					className="w-full"
					disabled={!initialWorkspaceState.packetReadiness.review.isReady}
				>
					<Link href="/api/download/repo">Download full repo snapshot</Link>
				</Button>
			</div>
		</AppShell>
	);
}
