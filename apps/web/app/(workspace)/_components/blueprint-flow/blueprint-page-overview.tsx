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
		<section
			id={BLUEPRINT_OVERVIEW_ID}
			className="scroll-mt-24 pb-8 pt-2"
			data-testid="blueprint-page-overview"
		>
			<p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
				Authoring
			</p>
			<h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
				Blueprint
			</h1>
			<p className="mt-2 max-w-md text-[13.5px] leading-6 text-muted-foreground">
				{isAllComplete
					? "All sections complete. Continue to review when ready."
					: "Fill in each section below, then continue to review."}
			</p>
			<div className="mt-5 flex items-center gap-3 xl:hidden">
				<Progress value={progressPercent} className="h-1 flex-1" />
				<span className="shrink-0 text-xs tabular-nums text-muted-foreground">
					{completedSectionCount}/{totalSectionCount}
				</span>
			</div>
		</section>
	);
}
