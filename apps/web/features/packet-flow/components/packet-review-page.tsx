import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/features/course/shared/components/app-shell";
import { PacketStageNav } from "./packet-stage-nav";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import { getPacketStageDefinition } from "@packet-compiler";
import { PacketVideoCard } from "@/features/packet-flow/components/video/packet-video-card";
import { getPacketReviewPageMedia } from "@/features/packet-flow/lib/packet-stage-videos";
import { PacketReviewArtifactGrid } from "./review/packet-review-artifact-grid";
import { PacketReviewDownloadBridge } from "./review/packet-review-download-bridge";

export function PacketReviewPage({
	initialWorkspaceState,
}: {
	initialWorkspaceState: PacketWorkspaceState;
}) {
	const reviewStageStatus = initialWorkspaceState.stageStatuses.find(
		(stageStatus) => stageStatus.stageId === "review",
	);
	if (reviewStageStatus && !reviewStageStatus.isUnlocked) {
		redirect(
			getPacketStageDefinition(initialWorkspaceState.firstIncompleteStageId)
				.route,
		);
	}

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			enableMissionQuery={false}
			showSkillRail={false}
			title="Review & Download"
		>
			<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 pb-20 pt-2">
				<PacketStageNav
					currentStageId="review"
					stageStatuses={initialWorkspaceState.stageStatuses}
				/>

				<div className="flex flex-col gap-16">
					<PacketReviewDownloadBridge
						initialWorkspaceState={initialWorkspaceState}
					/>

					<div className="grid gap-16 lg:grid-cols-[1fr_380px]">
						<div className="space-y-16">
							<PacketReviewArtifactGrid
								packetReadiness={initialWorkspaceState.packetReadiness}
							/>
						</div>
						<aside className="space-y-12">
							<div className="sticky top-8 space-y-12">
								<PacketVideoCard content={getPacketReviewPageMedia()} />
								<div className="rounded-3xl border border-border/50 bg-muted/20 p-8 space-y-4">
									<h3 className="font-bold tracking-tight">Need help?</h3>
									<p className="text-sm leading-relaxed text-muted-foreground">
										If you&apos;re stuck on a blocker, jump back into the stage
										to refine your answers. The system will automatically update
										your readiness.
									</p>
									<Button
										asChild
										variant="link"
										className="h-auto p-0 text-primary"
									>
										<Link
											href="/docs/guide"
											className="flex items-center gap-1"
										>
											Read the guide <ArrowRight className="h-3 w-3" />
										</Link>
									</Button>
								</div>
							</div>
						</aside>
					</div>
				</div>
			</div>
		</AppShell>
	);
}
