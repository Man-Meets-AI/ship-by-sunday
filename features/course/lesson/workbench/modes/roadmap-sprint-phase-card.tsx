import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { productConfig } from "@/config/product";
import type { LessonConfig } from "@/features/course/lesson/model/manifest";
import { getOrderedBlocks } from "@/features/course/lesson/model/registry";
import { cn } from "@/lib/utils";

export function RoadmapSprintPhaseCard({ lesson }: { lesson: LessonConfig }) {
	const blocks = getOrderedBlocks();

	return (
		<Card className="gap-0 py-0">
			<CardHeader className="border-b border-border/60 px-4 py-4 sm:px-5">
				<div className="flex flex-wrap items-center gap-2">
					<CardTitle className="text-base font-semibold tracking-tight text-foreground">
						Sprint path
					</CardTitle>
					<Badge variant="secondary" className="font-normal">
						{productConfig.name}
					</Badge>
					<Badge variant="outline" className="font-mono text-[10px]">
						{lesson.id}
					</Badge>
					<Badge variant="default" className="font-normal">
						Problem space next
					</Badge>
				</div>
				<CardDescription className="mt-3 max-w-[65ch] text-sm leading-relaxed">
					You are in the CEO block. Next you will tighten the problem space
					before moving on to user, outcome, research, flow, and scope.
				</CardDescription>
			</CardHeader>
			<CardContent className="px-4 py-4 sm:px-5">
				<div
					className="flex flex-wrap items-center gap-x-2 gap-y-2"
					aria-label="Block order: CEO, then Design, Build, Ship"
				>
					{blocks.map((block, index) => (
						<div key={block.id} className="flex flex-wrap items-center gap-2">
							{index > 0 ? (
								<span className="text-muted-foreground" aria-hidden>
									→
								</span>
							) : null}
							<span
								className={cn(
									"rounded-md border px-2.5 py-1 text-xs font-semibold tracking-tight",
									block.id === lesson.block
										? "border-primary/40 bg-primary/10 text-foreground"
										: "border-border/60 bg-muted/30 text-muted-foreground",
								)}
							>
								{block.label}
							</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
