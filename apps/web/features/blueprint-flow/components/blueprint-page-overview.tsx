import { Badge } from "@/components/ui/badge";
import { BlueprintVideoCard } from "@/features/blueprint-flow/components/video/blueprint-video-card";
import { BLUEPRINT_OVERVIEW_ID } from "@/features/blueprint-flow/lib/blueprint-page-sections";
import { getBlueprintStartPageMedia } from "@/features/blueprint-flow/lib/blueprint-stage-videos";

export function BlueprintPageOverview({
	isReviewReady,
	missingRequiredCount,
}: {
	isReviewReady: boolean;
	missingRequiredCount: number;
}) {
	return (
		<section
			id={BLUEPRINT_OVERVIEW_ID}
			className="grid gap-6 rounded-[28px] border border-border/60 bg-muted/20 p-6 scroll-mt-24 lg:grid-cols-[minmax(0,1fr)_20rem]"
		>
			<div className="space-y-4">
				<Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
					Canonical intake
				</Badge>
				<div className="space-y-3">
					<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
						Blueprint
					</h1>
					<p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
						Answer the full reduced blueprint here, keep the draft local until
						you press Continue to Review, and let the review page stay focused
						on readiness plus the Ship by Sunday Blueprint download.
					</p>
				</div>
				<div className="flex flex-wrap gap-3">
					<OverviewStat
						label="Required blockers"
						value={isReviewReady ? "0" : String(missingRequiredCount)}
					/>
					<OverviewStat
						label="Canonical routes"
						value={isReviewReady ? "/blueprint + /review" : "/blueprint"}
					/>
				</div>
			</div>
			<BlueprintVideoCard content={getBlueprintStartPageMedia()} />
		</section>
	);
}

function OverviewStat({ label, value }: { label: string; value: string }) {
	return (
		<div className="min-w-36 rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
			<p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
				{label}
			</p>
			<p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
		</div>
	);
}
