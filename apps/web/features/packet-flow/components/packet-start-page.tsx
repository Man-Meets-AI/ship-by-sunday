import { AppShell } from "@/features/course/shared/components/app-shell";
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
			showSkillRail={false}
			title="Start"
			primaryNav={{
				kind: "packet",
				currentStageId: "start",
				stageStatuses: initialWorkspaceState.stageStatuses,
			}}
		>
			<div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pb-20 pt-12">
				<div className="space-y-16">
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
