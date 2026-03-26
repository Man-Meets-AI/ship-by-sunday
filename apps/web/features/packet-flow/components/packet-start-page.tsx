import { AppShell } from "@/features/course/shared/components/app-shell";
import { PacketStageNav } from "./packet-stage-nav";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import { PacketStartOverviewCard } from "./start/packet-start-overview-card";
import { PacketStartWelcomeVideoCard } from "./start/packet-start-welcome-video-card";

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
		>
			<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-10 pt-2">
				<PacketStageNav
					currentStageId="start"
					stageStatuses={initialWorkspaceState.stageStatuses}
				/>
				<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
					<PacketStartOverviewCard
						nextStageId={
							initialWorkspaceState.projectDefinition
								? initialWorkspaceState.firstIncompleteStageId
								: "product"
						}
					/>
					<PacketStartWelcomeVideoCard />
				</div>
			</div>
		</AppShell>
	);
}
