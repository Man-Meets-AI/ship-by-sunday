import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Item, ItemContent, ItemGroup } from "@/components/ui/item";
import type { BlockId } from "@/features/course/lesson/model/manifest";
import {
	getOrderedBlocks,
	getStudentFacingLessons,
} from "@/features/course/lesson/model/registry";
import type { WorkbenchModeProps } from "../types";

const roadmapBlockDescriptionsById: Record<BlockId, string> = {
	CEO: "Choose the problem, user, outcome, flow, and scope before you build.",
	DESIGN:
		"Turn the brief into screens and decisions so the build is translation, not guessing.",
	BUILD: "Use AI and your tools to implement the core flow without spiraling.",
	SHIP: "Deploy, demo, share, and capture the first feedback loop.",
};

function normalizeRoadmapBlockDescription(
	blockLabel: string,
	description: string,
) {
	return description.replace(
		new RegExp(`^${blockLabel}\\s+Block\\s*=\\s*`, "i"),
		"",
	);
}

export function RoadmapSprintOverview({
	lessonContent,
}: {
	lessonContent: WorkbenchModeProps["lessonContent"];
}) {
	const orderedBlocks = getOrderedBlocks().map((block, index) => ({
		...block,
		description: normalizeRoadmapBlockDescription(
			block.label,
			lessonContent.workbench.teachingPoints?.[index] ??
				roadmapBlockDescriptionsById[block.id],
		),
		lessons: getStudentFacingLessons().filter(
			(lesson) => lesson.block === block.id,
		),
	}));

	return (
		<div className="space-y-4">
			<Card className="gap-0 bg-muted/30 py-0">
				<CardContent className="px-4 py-5 text-card-foreground sm:px-5">
					<CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground">
						Sprint roadmap
					</CardTitle>
					<CardDescription className="mt-3 max-w-[60ch] text-sm leading-relaxed">
						Each block solves a different problem. Move through them in order so
						each rep makes the next one easier.
					</CardDescription>
				</CardContent>
			</Card>
			<div className="grid gap-3 sm:gap-4 xl:grid-cols-4 xl:items-stretch">
				{orderedBlocks.map((block) => (
					<Card
						key={block.id}
						className="flex h-full min-h-0 flex-col gap-0 py-0"
					>
						<CardHeader className="border-b border-border/60 px-4 py-3">
							<div className="flex items-center justify-between gap-2">
								<CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground">
									{block.label}
								</CardTitle>
								<span className="shrink-0 text-xs font-medium text-muted-foreground">
									{block.lessons.length} lessons
								</span>
							</div>
							<CardDescription className="mt-3 text-sm leading-relaxed">
								{block.description}
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-1 flex-col px-3 py-4 sm:px-4">
							<ItemGroup className="gap-2">
								{block.lessons.map((lesson) => (
									<Item
										key={lesson.id}
										variant="outline"
										size="sm"
										className="border-border/60 bg-muted/20 px-3 py-2.5"
									>
										<ItemContent className="flex-row flex-wrap items-baseline gap-x-2 gap-y-1">
											<span className="text-xs font-medium tabular-nums text-muted-foreground">
												{lesson.id}
											</span>
											<span className="min-w-0 text-sm leading-snug text-foreground">
												{lesson.shortTitle}
											</span>
										</ItemContent>
									</Item>
								))}
							</ItemGroup>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
