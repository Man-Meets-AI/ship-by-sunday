import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	BUILD_PACK_LABEL,
	DESIGN_PACK_LABEL,
	MARKETING_PACK_LABEL,
	STARTER_SNAPSHOT_LABEL,
	getPacketStageDefinition,
	type PacketStageId,
} from "@packet-compiler";

export function PacketStartOverviewCard({
	nextStageId,
}: {
	nextStageId: PacketStageId;
}) {
	const nextStage = getPacketStageDefinition(nextStageId);

	return (
		<section className="space-y-6 border-b border-border/60 pb-8">
			<div className="max-w-3xl space-y-3">
				<h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-[3rem]">
					Build the folder before you build the app.
				</h2>
				<p className="max-w-2xl text-sm leading-6 text-muted-foreground">
					The welcome video shows how to move through Product, Design,
					Marketing, Build Plan, and Review without turning the weekend into a
					pile of filler lessons.
				</p>
			</div>
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
				<div className="space-y-3 text-sm leading-6 text-muted-foreground">
					<p>
						Watch the video, work the packet in order, and keep the answers
						sharp enough to ship something real by Sunday.
					</p>
					<ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
						{[
							DESIGN_PACK_LABEL,
							MARKETING_PACK_LABEL,
							BUILD_PACK_LABEL,
							STARTER_SNAPSHOT_LABEL,
						].map((artifactLabel) => (
							<li
								key={artifactLabel}
								className="border-t border-border/60 pt-2 text-foreground/85"
							>
								{artifactLabel}
							</li>
						))}
					</ul>
				</div>
				<Button asChild size="lg" className="w-full sm:w-auto">
					<Link href={nextStage.route}>Continue with {nextStage.label}</Link>
				</Button>
			</div>
		</section>
	);
}
