import { Progress } from "@/components/ui/progress";
import { BLUEPRINT_OVERVIEW_ID } from "@/lib/blueprint-flow/blueprint-page-sections";

export function BlueprintPageOverview({
	completedSectionCount,
	totalSectionCount,
}: {
	completedSectionCount: number;
	totalSectionCount: number;
}) {
	const progressPercent =
		totalSectionCount > 0
			? Math.round((completedSectionCount / totalSectionCount) * 100)
			: 0;
	const isAllComplete = completedSectionCount === totalSectionCount;

	return (
		<section id={BLUEPRINT_OVERVIEW_ID} className="scroll-mt-24 pb-8 pt-2">
			<h1 className="text-2xl font-semibold tracking-tight">Blueprint</h1>
			<p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
				{isAllComplete
					? "All sections complete. Continue to review when ready."
					: "Fill in each section below, then continue to review."}
			</p>
			<div className="mt-4 flex items-center gap-3 xl:hidden">
				<Progress value={progressPercent} className="h-1 flex-1" />
				<span className="shrink-0 text-xs tabular-nums text-muted-foreground">
					{completedSectionCount}/{totalSectionCount}
				</span>
			</div>
		</section>
	);
}
