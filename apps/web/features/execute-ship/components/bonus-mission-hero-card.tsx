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
						Packet ready. BUILD is the continuation path.
					</CardTitle>
				</div>
				<p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
					Everything here is unlocked as post-review bonus material. Start in
					BUILD to turn the packet into working software, and treat the other
					sections as reference shelves when you need to sharpen the work.
				</p>
			</CardHeader>
			<CardContent className="space-y-5">
				<div className="grid gap-3 sm:grid-cols-3">
					<div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
						<p className="text-sm font-medium text-muted-foreground">
							Explored
						</p>
						<p className="mt-3 text-3xl font-semibold text-foreground">
							{exploredCount}/{totalLessons}
						</p>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Lessons opened from the bonus library.
						</p>
					</div>
					<div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
						<p className="text-sm font-medium text-muted-foreground">
							Recommended start
						</p>
						<p className="mt-3 text-lg font-semibold text-foreground">
							Lesson 3.1
						</p>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Use the packet as the brief, then iterate the product with AI.
						</p>
					</div>
					<div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
						<p className="text-sm font-medium text-muted-foreground">
							Full library
						</p>
						<p className="mt-3 text-lg font-semibold text-foreground">
							Product, Design, Build, Ship
						</p>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Keep the rest unlocked for context, QA, and launch decisions.
						</p>
					</div>
				</div>
				<div className="flex flex-col gap-3 sm:flex-row">
					<Button asChild size="lg">
						<Link href={recommendedLessonHref}>Continue in Build</Link>
					</Button>
					<Button asChild size="lg" variant="outline">
						<Link href={getLessonHref("1.1")}>Start from the beginning</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
