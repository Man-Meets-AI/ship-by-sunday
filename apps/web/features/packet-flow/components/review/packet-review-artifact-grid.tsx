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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
		<div className="grid gap-6 xl:grid-cols-4">
			{reviewArtifacts.map((artifact) => {
				const readiness = packetReadiness[artifact.id];

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
						{packetReadiness.review.isReady
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
	);
}
