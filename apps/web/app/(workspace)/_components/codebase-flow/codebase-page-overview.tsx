import { Progress } from "@/components/ui/progress";
import { CODEBASE_OVERVIEW_ID } from "@/lib/codebase-flow/codebase-page-sections";

export function CodebasePageOverview({
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
			id={CODEBASE_OVERVIEW_ID}
			className="scroll-mt-24 pb-8 pt-2"
			data-testid="codebase-page-overview"
		>
			<p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
				Authoring
			</p>
			<h1 className="font-heading-serif mt-1 text-2xl font-normal sm:text-[1.75rem]">
				Codebase
			</h1>
			<p className="mt-2 max-w-md text-[13.5px] leading-6 text-muted-foreground">
				{isAllComplete
					? "All sections complete. Continue to review when ready."
					: "Fill in each section below, then continue to review."}
			</p>
			<div className="mt-5 flex items-center gap-3 xl:hidden">
				<Progress value={progressPercent} className="h-1 flex-1" />
				<span className="shrink-0 text-xs font-number text-muted-foreground">
					{completedSectionCount}/{totalSectionCount}
				</span>
			</div>
		</section>
	);
}
