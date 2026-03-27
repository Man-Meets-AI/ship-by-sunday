import Link from "next/link";
import {
	PROMPT_PACK_LABEL,
	STARTER_SNAPSHOT_LABEL,
	getPacketStageDefinition,
	type PacketReadinessResult,
} from "@packet-compiler";
import { Button } from "@/components/ui/button";
import { reviewArtifacts } from "../../lib/review-artifacts";

export function PacketReviewArtifactGrid({
	packetReadiness,
}: {
	packetReadiness: PacketReadinessResult;
}) {
	return (
		<section className="space-y-12">
			<div className="max-w-2xl space-y-4">
				<div className="space-y-1">
					<p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground/60">
						Resources
					</p>
					<h2 className="text-2xl font-bold tracking-tight">
						Supporting Downloads
					</h2>
				</div>
				<p className="text-sm leading-relaxed text-muted-foreground">
					The Starter Snapshot is the primary outcome, but individual pack links
					stay available here for reference or standalone use.
				</p>
			</div>

			<div className="divide-y divide-border/40 border-t border-border/40">
				{reviewArtifacts.map((artifact) => {
					const readiness = packetReadiness[artifact.id];

					return (
						<div
							key={artifact.id}
							className="group grid gap-6 py-8 lg:grid-cols-[1fr_auto] lg:items-center"
						>
							<div className="space-y-2">
								<h3 className="text-lg font-bold tracking-tight">
									{artifact.title}
								</h3>
								<p className="max-w-md text-sm leading-relaxed text-muted-foreground">
									{readiness.isReady
										? "Full pack content is locked and ready for delivery."
										: `${readiness.missingFactKeys.length} answer${readiness.missingFactKeys.length === 1 ? "" : "s"} still need attention in the ${artifact.stageLabel} stage.`}
								</p>
							</div>
							<div className="flex flex-wrap gap-3 lg:min-w-[320px] lg:justify-end">
								{readiness.isReady && (
									<Button
										asChild
										variant="outline"
										className="h-11 px-6 font-semibold"
									>
										<Link href={artifact.downloadHref}>Download Pack</Link>
									</Button>
								)}
								<Button
									asChild
									variant="ghost"
									className="h-11 px-6 font-semibold"
								>
									<Link href={artifact.stageRoute}>View Stage</Link>
								</Button>
							</div>
						</div>
					);
				})}

				<div className="group grid gap-6 py-8 lg:grid-cols-[1fr_auto] lg:items-center">
					<div className="space-y-2">
						<h3 className="text-lg font-bold tracking-tight">
							{PROMPT_PACK_LABEL}
						</h3>
						<p className="max-w-md text-sm leading-relaxed text-muted-foreground">
							{packetReadiness.review.isReady
								? `Included in your primary ${STARTER_SNAPSHOT_LABEL}.`
								: `Will be generated once your ${STARTER_SNAPSHOT_LABEL} is ready.`}
						</p>
					</div>
					<div className="flex flex-wrap gap-3 lg:min-w-[320px] lg:justify-end">
						<Button asChild variant="ghost" className="h-11 px-6 font-semibold">
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
