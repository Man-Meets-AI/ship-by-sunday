import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MissionSectionLabel } from "@/app/(protected)/_components/course/mission/components/mission/mission-section-label";
import type { EnrichedLesson } from "@/lib/course/mission/mission-page-model";

export function MissionCurrentStep({ lesson }: { lesson: EnrichedLesson }) {
	const ctaLabel =
		lesson.status === "in_progress"
			? `Resume ${lesson.displayLabel}`
			: `Start ${lesson.displayLabel}`;

	return (
		<div className="space-y-5">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="space-y-1.5">
					<MissionSectionLabel>Lesson to open</MissionSectionLabel>
					<p className="text-xl font-semibold tracking-tight sm:text-2xl">
						<span className="text-muted-foreground">{lesson.displayLabel}</span>{" "}
						{lesson.shortTitle}
					</p>
				</div>
				<Badge>Now</Badge>
			</div>
			<div className="grid gap-6 text-sm leading-relaxed sm:grid-cols-2">
				<div className="space-y-1.5">
					<MissionSectionLabel>What you&apos;ll do</MissionSectionLabel>
					<p className="text-foreground">{lesson.objectiveTitle}</p>
				</div>
				<div className="space-y-1.5">
					<MissionSectionLabel>When you&apos;re done</MissionSectionLabel>
					<p className="text-foreground">{lesson.winCondition}</p>
				</div>
			</div>
			<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
				<Button asChild size="default">
					<Link href={lesson.href}>{ctaLabel}</Link>
				</Button>
				<p className="text-sm text-muted-foreground">
					Output in your workbook:{" "}
					<span className="font-medium text-foreground">
						{lesson.artifactLabel}
					</span>
				</p>
			</div>
		</div>
	);
}
