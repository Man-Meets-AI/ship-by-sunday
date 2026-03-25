import Link from "next/link";
import { AppShell } from "@/features/course/shared/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PacketStageNav } from "./packet-stage-nav";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import {
	BUILD_PACK_LABEL,
	DESIGN_PACK_LABEL,
	MARKETING_PACK_LABEL,
	PROMPT_PACK_LABEL,
	STARTER_SNAPSHOT_LABEL,
	getPacketStageDefinition,
} from "@packet-compiler";

const reviewArtifacts = [
	{
		id: "design",
		title: DESIGN_PACK_LABEL,
		downloadHref: "/api/download/packet/design",
		stageRoute: getPacketStageDefinition("design").route,
		stageLabel: getPacketStageDefinition("design").label,
	},
	{
		id: "marketing",
		title: MARKETING_PACK_LABEL,
		downloadHref: "/api/download/packet/marketing",
		stageRoute: getPacketStageDefinition("marketing").route,
		stageLabel: getPacketStageDefinition("marketing").label,
	},
	{
		id: "build",
		title: BUILD_PACK_LABEL,
		downloadHref: "/api/download/packet/build",
		stageRoute: getPacketStageDefinition("build-plan").route,
		stageLabel: getPacketStageDefinition("build-plan").label,
	},
] as const;

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
			title="Review & Download"
			subtitle="Download the packs now or generate the final Starter Snapshot."
		>
			<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-10 pt-2">
				<PacketStageNav
					currentStageId="review"
					stageStatuses={initialWorkspaceState.stageStatuses}
				/>
				<div className="grid gap-6 xl:grid-cols-4">
					{reviewArtifacts.map((artifact) => {
						const readiness =
							initialWorkspaceState.packetReadiness[artifact.id];

						return (
							<Card key={artifact.id}>
								<CardHeader>
									<CardTitle>{artifact.title}</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3 text-sm text-muted-foreground">
									<p>
										{readiness.isReady
											? "Ready to download."
											: `Missing ${readiness.missingFactKeys.length} required fact(s) before this pack is ready.`}
									</p>
									{readiness.isReady ? (
										<Button asChild className="w-full">
											<Link href={artifact.downloadHref}>
												Download {artifact.title}
											</Link>
										</Button>
									) : null}
									<Button asChild variant="outline" className="w-full">
										<Link href={artifact.stageRoute}>
											Open {artifact.stageLabel}
										</Link>
									</Button>
								</CardContent>
							</Card>
						);
					})}
					<Card>
						<CardHeader>
							<CardTitle>{PROMPT_PACK_LABEL}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm text-muted-foreground">
							<p>
								{initialWorkspaceState.packetReadiness.review.isReady
									? `Ready inside the ${STARTER_SNAPSHOT_LABEL}.`
									: `Included when the ${STARTER_SNAPSHOT_LABEL} is ready.`}
							</p>
							<Button asChild variant="outline" className="w-full">
								<Link href={getPacketStageDefinition("review").route}>
									Open Review
								</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
				<Button
					asChild
					className="w-full"
					disabled={!initialWorkspaceState.packetReadiness.review.isReady}
				>
					<Link href="/api/download/repo">
						Download {STARTER_SNAPSHOT_LABEL}
					</Link>
				</Button>
			</div>
		</AppShell>
	);
}
