import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLessonHref } from "@/features/course/lesson/model/manifest";

export function BonusMissionHeroCard({
	exploredCount,
	totalLessons,
	recommendedLessonHref,
}: {
	exploredCount: number;
	totalLessons: number;
	recommendedLessonHref: string;
}) {
	return (
		<Card className="border-border/70">
			<CardHeader className="gap-4">
				<div className="space-y-1">
					<CardTitle className="max-w-3xl text-3xl leading-tight sm:text-4xl">
						Your Ship by Sunday Blueprint is ready. Build is next.
					</CardTitle>
				</div>
				<p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
					You have finished the core Ship Blueprint run. Use Build to turn your
					product truth, Agent-Ready Packs, and Ship by Sunday Blueprint into a
					working product. Product, Design, and Ship stay here as reference when
					you need to tighten decisions or finish the launch.
				</p>
			</CardHeader>
			<CardContent className="space-y-5">
				<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
					<span>
						<span className="text-lg font-semibold text-foreground">
							{exploredCount}/{totalLessons}
						</span>{" "}
						explored
					</span>
					<span>
						Recommended start:{" "}
						<span className="font-medium text-foreground">Lesson 3.1</span>
					</span>
					<span>
						Sections:{" "}
						<span className="font-medium text-foreground">
							Product, Design, Build, Ship
						</span>
					</span>
				</div>
				<div className="flex flex-col gap-3 sm:flex-row">
					<Button asChild size="lg">
						<Link href={recommendedLessonHref}>Continue in Build</Link>
					</Button>
					<Button asChild size="lg" variant="outline">
						<Link href={getLessonHref("1.1")}>Review the full library</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
