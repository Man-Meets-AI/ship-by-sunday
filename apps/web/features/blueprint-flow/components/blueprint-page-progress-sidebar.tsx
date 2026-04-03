import Link from "next/link";
import type { BlueprintPageSectionStatus } from "@/features/blueprint-flow/hooks/use-blueprint-page-state";
import { blueprintPageSections } from "@/features/blueprint-flow/lib/blueprint-page-sections";
import { cn } from "@/lib/utils";

export function BlueprintPageProgressSidebar({
	sectionStatuses,
}: {
	sectionStatuses: BlueprintPageSectionStatus[];
}) {
	const statusBySectionId = new Map(
		sectionStatuses.map((sectionStatus) => [
			sectionStatus.sectionId,
			sectionStatus,
		]),
	);
	const completedCount = sectionStatuses.filter(
		(sectionStatus) => sectionStatus.isComplete,
	).length;

	return (
		<aside className="space-y-5 rounded-[24px] border border-border/60 bg-background/90 p-5">
			<div className="space-y-2">
				<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
					Blueprint progress
				</p>
				<h2 className="text-lg font-semibold tracking-tight">
					{completedCount} / {sectionStatuses.length} sections ready
				</h2>
				<p className="text-sm leading-6 text-muted-foreground">
					Use the section links below to move through the canonical blueprint in
					order.
				</p>
			</div>
			<nav aria-label="Blueprint sections" className="space-y-2">
				{blueprintPageSections.map((section) => {
					const status = statusBySectionId.get(section.id);
					const isComplete = status?.isComplete ?? false;
					const missingCount = status?.missingFactKeys.length ?? 0;

					return (
						<Link
							key={section.id}
							href={`#${section.id}`}
							className={cn(
								"flex items-center justify-between rounded-2xl border px-3 py-2.5 text-sm transition-colors",
								isComplete
									? "border-emerald-500/20 bg-emerald-50/50 text-emerald-950 dark:bg-emerald-500/10 dark:text-emerald-100"
									: "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/35",
							)}
						>
							<span>{section.label}</span>
							<span className="text-xs">
								{isComplete ? "Ready" : `${missingCount} left`}
							</span>
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
