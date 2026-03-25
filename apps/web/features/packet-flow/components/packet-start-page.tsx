import Link from "next/link";
import { AppShell } from "@/features/course/shared/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PacketStageNav } from "./packet-stage-nav";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import {
	BUILD_PACK_LABEL,
	DESIGN_PACK_LABEL,
	MARKETING_PACK_LABEL,
	STARTER_SNAPSHOT_LABEL,
	getPacketStageDefinition,
} from "@packet-compiler";

export function PacketStartPage({
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
			title="Start"
			subtitle="This product is pack-first. Every stage fills real output files."
		>
			<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-10 pt-2">
				<PacketStageNav
					currentStageId="start"
					stageStatuses={initialWorkspaceState.stageStatuses}
				/>
				<Card>
					<CardHeader>
						<CardTitle>How this works</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm text-muted-foreground">
						<p>
							You are not filling out course worksheets. You are collecting the
							canonical facts that change the generated packs and final Starter
							Snapshot.
						</p>
						<p>
							You will unlock the {DESIGN_PACK_LABEL} after Design, the{" "}
							{MARKETING_PACK_LABEL} after Marketing, the {BUILD_PACK_LABEL}{" "}
							after Build Plan, and the {STARTER_SNAPSHOT_LABEL} at Review.
						</p>
						<Button asChild>
							<Link
								href={
									getPacketStageDefinition(
										initialWorkspaceState.projectDefinition
											? initialWorkspaceState.firstIncompleteStageId
											: "product",
									).route
								}
							>
								Open the packet flow
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</AppShell>
	);
}
