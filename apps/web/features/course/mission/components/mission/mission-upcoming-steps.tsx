import { Badge } from "@/components/ui/badge";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
} from "@/components/ui/item";
import { MissionSectionLabel } from "@/features/course/mission/components/mission/mission-section-label";
import type { EnrichedLesson } from "@/features/course/mission/lib/mission-page-model";

export function MissionUpcomingSteps({
	lessons,
}: {
	lessons: EnrichedLesson[];
}) {
	if (lessons.length === 0) return null;

	return (
		<div className="space-y-3">
			<MissionSectionLabel>Next in this block</MissionSectionLabel>
			<ItemGroup className="gap-2">
				{lessons.map((lesson, index) => (
					<Item key={lesson.lessonKey} variant="outline" size="sm">
						<ItemContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div className="min-w-0 space-y-1">
								<Badge variant={index === 0 ? "default" : "outline"}>
									{index === 0 ? "Next" : "Then"}
								</Badge>
								<p className="text-sm font-medium">
									<span className="text-muted-foreground">{lesson.displayLabel}</span>{" "}
									{lesson.shortTitle}
								</p>
							</div>
							<ItemDescription className="line-clamp-none shrink-0 sm:text-right">
								{lesson.artifactLabel}
							</ItemDescription>
						</ItemContent>
					</Item>
				))}
			</ItemGroup>
		</div>
	);
}
