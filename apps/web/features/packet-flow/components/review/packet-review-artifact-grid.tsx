import Link from "next/link";
import {
	BUILD_PACK_LABEL,
	DESIGN_PACK_LABEL,
	MARKETING_PACK_LABEL,
	PROMPT_PACK_LABEL,
	STARTER_SNAPSHOT_LABEL,
	getPacketStageDefinition,
	type PacketReadinessResult,
} from "@packet-compiler";
import { Button } from "@/components/ui/button";

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

export function PacketReviewArtifactGrid({
	packetReadiness,
}: {
	packetReadiness: PacketReadinessResult;
}) {
	return (
		<section className="space-y-4 border-t border-border/60 pt-6">
			<div className="max-w-3xl space-y-2">
				<p className="text-sm font-medium text-muted-foreground">
					Supporting downloads
				</p>
				<h2 className="text-xl font-semibold tracking-tight">
					Keep the pack links handy.
				</h2>
				<p className="text-sm leading-6 text-muted-foreground">
					The Starter Snapshot is the primary outcome. These individual pack
					links stay available when you need one on its own.
				</p>
			</div>
			<div className="space-y-4">
				{reviewArtifacts.map((artifact) => {
					const readiness = packetReadiness[artifact.id];

					return (
						<div
							key={artifact.id}
							className="grid gap-4 border-t border-border/60 pt-4 lg:grid-cols-[minmax(0,1fr)_auto]"
						>
							<div className="space-y-1">
								<h3 className="text-base font-semibold">{artifact.title}</h3>
								<p className="text-sm leading-6 text-muted-foreground">
									{readiness.isReady
										? "Ready to download."
										: `${readiness.missingFactKeys.length} answer${readiness.missingFactKeys.length === 1 ? "" : "s"} still need to be locked before this pack is ready.`}
								</p>
							</div>
							<div className="flex flex-col gap-3 lg:min-w-56">
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
							</div>
						</div>
					);
				})}
				<div className="grid gap-4 border-t border-border/60 pt-4 lg:grid-cols-[minmax(0,1fr)_auto]">
					<div className="space-y-1">
						<h3 className="text-base font-semibold">{PROMPT_PACK_LABEL}</h3>
						<p className="text-sm leading-6 text-muted-foreground">
							{packetReadiness.review.isReady
								? `Included in the ${STARTER_SNAPSHOT_LABEL}.`
								: `Included when the ${STARTER_SNAPSHOT_LABEL} is ready.`}
						</p>
					</div>
					<div className="flex flex-col gap-3 lg:min-w-56">
						<Button asChild variant="outline" className="w-full">
							<Link href={getPacketStageDefinition("review").route}>
								Open Review
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
