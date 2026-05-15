import {
	ProtectedRouteDescription,
	ProtectedRouteEyebrow,
	ProtectedRouteHeader,
	ProtectedRouteTitle,
} from "@/components/app/protected-route-surface";
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
			className="scroll-mt-24 pb-6"
			data-testid="codebase-page-overview"
		>
			<ProtectedRouteHeader
				actions={
					<div className="flex min-w-[10rem] items-center gap-3 xl:hidden">
						<Progress value={progressPercent} className="h-1 flex-1" />
						<span className="shrink-0 text-xs font-number text-muted-foreground">
							{completedSectionCount}/{totalSectionCount}
						</span>
					</div>
				}
			>
				<ProtectedRouteEyebrow>Authoring</ProtectedRouteEyebrow>
				<ProtectedRouteTitle>Codebase</ProtectedRouteTitle>
				<ProtectedRouteDescription>
					{isAllComplete
						? "All sections complete. Continue to review when ready."
						: "Fill in each section below, then continue to review."}
				</ProtectedRouteDescription>
			</ProtectedRouteHeader>
		</section>
	);
}
