import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BonusMissionState } from "@/features/execute-ship/lib/bonus-mission-types";
import { getBonusBlockPresentation } from "@/features/execute-ship/lib/bonus-library-presentation";

type BonusMissionBlock = BonusMissionState["blocks"][number];

function getLessonStatusLabel(status: "available" | "opened" | "completed") {
	return status === "available" ? "Unopened" : "Explored";
}

export function BonusMissionBlockCard({ block }: { block: BonusMissionBlock }) {
	const presentation = getBonusBlockPresentation(block.id);
	const exploredCount = block.lessons.filter(
		(lesson) => lesson.status !== "available",
	).length;

	return (
		<Card className="border-border/70">
			<CardHeader className="gap-3">
				<div className="flex flex-wrap items-center gap-2">
					<Badge
						variant={presentation.kind === "featured" ? "default" : "outline"}
					>
						{presentation.kind === "featured" ? "Recommended" : "Reference"}
					</Badge>
					<p className="text-sm font-medium text-muted-foreground">
						{exploredCount}/{block.lessons.length} explored
					</p>
				</div>
				<div className="space-y-1">
					<CardTitle className="text-2xl">{presentation.label}</CardTitle>
					<p className="text-sm leading-6 text-muted-foreground">
						{presentation.summary}
					</p>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3">
					{block.lessons.map((lesson) => (
						<Link
							key={lesson.lessonKey}
							href={`/lesson/${lesson.routeSegment}`}
							className="rounded-2xl border border-border/60 bg-muted/20 p-4 transition hover:bg-muted/35"
						>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<p className="text-sm font-semibold text-foreground">
									{lesson.displayLabel} {lesson.shortTitle}
								</p>
								<Badge variant="secondary">
									{getLessonStatusLabel(lesson.status)}
								</Badge>
							</div>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								{lesson.title}
							</p>
							<div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
								<span>{lesson.artifactLabel}</span>
								{lesson.durationLabel ? (
									<span>{lesson.durationLabel}</span>
								) : null}
							</div>
						</Link>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
