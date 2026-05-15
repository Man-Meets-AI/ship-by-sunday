import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EnrichedLesson } from "@/lib/course/mission/mission-page-model";

export function MissionLessonChip({ lesson }: { lesson: EnrichedLesson }) {
	const content = (
		<span className="flex flex-col gap-0.5 text-left sm:flex-row sm:items-center sm:gap-2">
			<span className="text-xs text-muted-foreground">
				{lesson.displayLabel}
			</span>
			<span className="text-sm font-medium">{lesson.shortTitle}</span>
		</span>
	);

	if (lesson.status === "locked") {
		return (
			<Badge
				variant="secondary"
				className="h-auto gap-0 px-3 py-1.5 font-normal"
			>
				{content}
			</Badge>
		);
	}

	return (
		<Button asChild variant="outline" size="sm" className="h-auto py-1.5">
			<Link href={lesson.href}>{content}</Link>
		</Button>
	);
}
