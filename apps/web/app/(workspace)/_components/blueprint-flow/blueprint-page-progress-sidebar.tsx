import { CheckCircle2Icon } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import type { BlueprintPageSectionStatus } from "@/app/(workspace)/_hooks/blueprint-flow/use-blueprint-page-state";
import { blueprintPageSections } from "@/lib/blueprint-flow/blueprint-page-sections";
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
	const progressPercent =
		sectionStatuses.length > 0
			? Math.round((completedCount / sectionStatuses.length) * 100)
			: 0;

	return (
		<aside className="space-y-4">
			<div className="space-y-2">
				<div className="flex items-baseline justify-between">
					<p className="text-xs font-medium text-muted-foreground">Progress</p>
					<p className="text-xs tabular-nums text-muted-foreground/70">
						{completedCount}/{sectionStatuses.length}
					</p>
				</div>
				<Progress value={progressPercent} className="h-1" />
			</div>
			<nav aria-label="Blueprint sections" className="space-y-px">
				{blueprintPageSections.map((section, index) => {
					const status = statusBySectionId.get(section.id);
					const isComplete = status?.isComplete ?? false;

					return (
						<Link
							key={section.id}
							href={`#${section.id}`}
							className={cn(
								"flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors hover:bg-muted/60",
								isComplete
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<span
								className={cn(
									"flex size-5 shrink-0 items-center justify-center rounded-md text-[11px] font-medium",
									isComplete
										? "bg-foreground text-background"
										: "border border-border/80 text-muted-foreground",
								)}
							>
								{isComplete ? (
									<CheckCircle2Icon className="size-3" />
								) : (
									index + 1
								)}
							</span>
							<span className={cn(isComplete && "font-medium")}>
								{section.label}
							</span>
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
