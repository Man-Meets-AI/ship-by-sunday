import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MissionSectionLabel } from "@/features/course/mission/components/mission/mission-section-label";
import type {
	EnrichedBlock,
	EnrichedLesson,
} from "@/features/course/mission/lib/mission-page-model";

function HeroActive({
	lesson,
	block,
}: {
	lesson: EnrichedLesson;
	block: EnrichedBlock;
}) {
	const ctaLabel =
		lesson.status === "in_progress"
			? `Resume ${lesson.id}`
			: `Start ${lesson.id}`;

	return (
		<>
			<CardHeader className="gap-4 pb-0">
				<div className="flex flex-wrap items-center gap-2">
					<MissionSectionLabel>
						Step {block.level} of 4 &mdash; {block.label}
					</MissionSectionLabel>
					<Badge>Now</Badge>
				</div>
				<CardTitle className="text-2xl leading-tight tracking-tight sm:text-3xl">
					<span className="text-muted-foreground">{lesson.id}</span>{" "}
					{lesson.shortTitle}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-4 text-sm leading-relaxed sm:grid-cols-2">
					<div className="space-y-1">
						<MissionSectionLabel>What you&apos;ll do</MissionSectionLabel>
						<p className="text-foreground">{lesson.objectiveTitle}</p>
					</div>
					<div className="space-y-1">
						<MissionSectionLabel>When you&apos;re done</MissionSectionLabel>
						<p className="text-foreground">{lesson.winCondition}</p>
					</div>
				</div>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<Button asChild size="lg">
						<Link href={lesson.href}>{ctaLabel}</Link>
					</Button>
					<p className="text-sm text-muted-foreground">
						Output:{" "}
						<span className="font-medium text-foreground">
							{lesson.artifactLabel}
						</span>
					</p>
				</div>
				<div className="space-y-2">
					<div className="flex items-baseline justify-between text-xs text-muted-foreground">
						<span>{block.label} progress</span>
						<span className="font-medium text-foreground">
							{block.completedCount}/{block.totalLessons}
						</span>
					</div>
					<Progress value={block.pct} />
				</div>
			</CardContent>
		</>
	);
}

function HeroDone({ block }: { block: EnrichedBlock }) {
	return (
		<>
			<CardHeader className="gap-4 pb-0">
				<div className="flex flex-wrap items-center gap-2">
					<MissionSectionLabel>
						Step {block.level} of 4 &mdash; {block.label}
					</MissionSectionLabel>
					<Badge variant="secondary">Done</Badge>
				</div>
				<CardTitle className="text-2xl tracking-tight sm:text-3xl">
					{block.label} complete
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-sm leading-relaxed text-muted-foreground">
					Everything in {block.label} is done. Nice work.
				</p>
			</CardContent>
		</>
	);
}

export function MissionHeroCard({ block }: { block: EnrichedBlock }) {
	const ctaLesson = block.currentLesson ?? block.allLessons[0] ?? null;

	return (
		<Card className="ring-1 ring-primary/20">
			{ctaLesson ? (
				<HeroActive lesson={ctaLesson} block={block} />
			) : (
				<HeroDone block={block} />
			)}
		</Card>
	);
}
