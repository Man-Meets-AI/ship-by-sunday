import { BLUEPRINT_OVERVIEW_ID } from "@/features/blueprint-flow/lib/blueprint-page-sections";

export function BlueprintPageOverview({
	completedSectionCount,
	totalSectionCount,
}: {
	completedSectionCount: number;
	totalSectionCount: number;
}) {
	return (
		<section id={BLUEPRINT_OVERVIEW_ID} className="scroll-mt-24 pb-2 pt-2">
			<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
				Blueprint
			</h1>
			<p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">
				Fill in each section below, then continue to review when you are ready.
			</p>
			<p className="mt-1 text-sm text-muted-foreground/70">
				{completedSectionCount} of {totalSectionCount} sections complete
			</p>
		</section>
	);
}
