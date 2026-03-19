import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Item, ItemContent, ItemDescription } from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MissionCurrentStep } from "@/features/course/mission/components/mission/mission-current-step";
import { MissionLessonChip } from "@/features/course/mission/components/mission/mission-lesson-chip";
import { MissionSectionLabel } from "@/features/course/mission/components/mission/mission-section-label";
import { MissionUpcomingSteps } from "@/features/course/mission/components/mission/mission-upcoming-steps";
import {
	type EnrichedBlock,
	type MissionState,
	getToneVariant,
} from "@/features/course/mission/lib/mission-page-model";

export function MissionSprintOverview({
	block,
	nextBlock,
	mission,
}: {
	block: EnrichedBlock;
	nextBlock: EnrichedBlock | null;
	mission: MissionState;
}) {
	const ctaLesson = block.currentLesson ?? block.allLessons[0] ?? null;
	const unlockCopy = nextBlock
		? block.status === "completed"
			? `${nextBlock.label} is unlocked and ready when you are.`
			: `Finish ${block.label} to unlock ${nextBlock.label}.`
		: "This is the final block. Finish the remaining steps to complete the sprint.";
	const blockBadgeTone = block.status === "completed" ? "done" : "now";
	const blockBadgeLabel = block.status === "completed" ? "Done" : "Now";

	return (
		<Card>
			<CardHeader className="gap-3">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
					<div className="min-w-0 space-y-3">
						<MissionSectionLabel>Current block</MissionSectionLabel>
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-sm text-muted-foreground">
								Step {block.level} of 4
							</span>
							<Badge variant={getToneVariant(blockBadgeTone)}>
								{blockBadgeLabel}
							</Badge>
						</div>
						<CardTitle className="text-2xl sm:text-3xl">
							{block.label}
						</CardTitle>
						<CardDescription className="text-base leading-relaxed">
							{block.summary}
						</CardDescription>
					</div>
					<Item variant="outline" className="shrink-0 text-right">
						<ItemContent className="items-end">
							<p className="text-xl font-semibold tracking-tight">
								{mission.progressCount}/{mission.totalLessons}
							</p>
							<ItemDescription>Lessons this weekend</ItemDescription>
						</ItemContent>
					</Item>
				</div>
			</CardHeader>

			<Separator />

			<CardContent className="grid gap-8 pt-6 lg:grid-cols-[1fr_minmax(240px,0.4fr)]">
				<div className="space-y-8">
					{ctaLesson ? (
						<MissionCurrentStep lesson={ctaLesson} />
					) : (
						<Item variant="muted" className="p-5">
							<ItemContent>
								<div className="flex flex-wrap items-center gap-2">
									<MissionSectionLabel>Lesson to open</MissionSectionLabel>
									<Badge variant="secondary">Done</Badge>
								</div>
								<ItemDescription className="mt-2 line-clamp-none text-foreground">
									Everything in {block.label} is done.
								</ItemDescription>
							</ItemContent>
						</Item>
					)}

					<MissionUpcomingSteps lessons={block.upcomingLessons} />
				</div>

				<aside className="space-y-5 border-t pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
					<div>
						<div className="flex items-baseline justify-between gap-2">
							<MissionSectionLabel>{block.label} progress</MissionSectionLabel>
							<span className="text-sm font-medium">
								{block.completedCount}/{block.totalLessons}
							</span>
						</div>
						<Progress value={block.pct} className="mt-3" />
					</div>

					<p className="text-sm leading-relaxed text-muted-foreground">
						{unlockCopy}
					</p>

					{block.completedLessons.length > 0 ? (
						<div className="space-y-2">
							<MissionSectionLabel>
								Completed in {block.label}
							</MissionSectionLabel>
							<div className="flex flex-wrap gap-2">
								{block.completedLessons.map((lesson) => (
									<MissionLessonChip key={lesson.id} lesson={lesson} />
								))}
							</div>
						</div>
					) : null}
				</aside>
			</CardContent>
		</Card>
	);
}
