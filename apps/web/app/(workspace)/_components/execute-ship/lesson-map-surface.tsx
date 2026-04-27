import { Accordion } from "@/components/ui/accordion";
import {
	getOrderedBonusBlocks,
	getRecommendedBuildLessonHref,
} from "@/lib/execute-ship/bonus-library-presentation";
import type { BonusMissionState } from "@/lib/execute-ship/bonus-mission-types";
import { BonusMissionBlockSection } from "./bonus-mission-block-card";
import { BonusMissionHeroCard } from "./bonus-mission-hero-card";

export function LessonMapSurface({
	id,
	currentBlockId = "BUILD",
	missionState,
}: {
	id?: string;
	currentBlockId?: string;
	missionState: BonusMissionState;
}) {
	const orderedBlocks = getOrderedBonusBlocks(missionState);

	return (
		<section
			id={id}
			className="space-y-6 rounded-[28px] border border-border/60 bg-muted/15 p-6 scroll-mt-24 sm:p-8"
		>
			<div className="space-y-2">
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
					Lesson Map
				</p>
				<p className="text-sm leading-6 text-muted-foreground">
					Use this as the optional overview. Build remains the default path.
				</p>
			</div>
			<BonusMissionHeroCard
				exploredCount={missionState.exploredCount}
				totalLessons={missionState.totalLessons}
				recommendedLessonHref={getRecommendedBuildLessonHref(missionState)}
			/>
			<Accordion
				type="single"
				collapsible
				defaultValue={
					orderedBlocks.some((block) => block.id === currentBlockId)
						? currentBlockId
						: "BUILD"
				}
			>
				{orderedBlocks.map((block) => (
					<BonusMissionBlockSection key={block.id} block={block} />
				))}
			</Accordion>
		</section>
	);
}
