import Link from "next/link";
import { AppShell } from "@/features/course/shared/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PacketStageNav } from "./packet-stage-nav";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import { getPacketStageDefinition } from "@packet-compiler";

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
			subtitle="This product is packet-first. Every stage fills real output files."
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
							canonical facts that change the generated packet and starter repo.
						</p>
						<p>
							You will unlock the design packet after Design, the marketing
							packet after Marketing, the build packet after Build Plan, and the
							full repo zip at Review.
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
