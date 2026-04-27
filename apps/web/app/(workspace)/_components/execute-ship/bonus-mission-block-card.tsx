import Link from "next/link";
import { Check } from "lucide-react";
import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { BonusMissionState } from "@/lib/execute-ship/bonus-mission-types";
import { getBonusBlockPresentation } from "@/lib/execute-ship/bonus-library-presentation";

type BonusMissionBlock = BonusMissionState["blocks"][number];

export function BonusMissionBlockSection({
	block,
}: {
	block: BonusMissionBlock;
}) {
	const presentation = getBonusBlockPresentation(block.id);
	const exploredCount = block.lessons.filter(
		(lesson) => lesson.status !== "available",
	).length;
	const progressPercent =
		block.lessons.length > 0
			? Math.round((exploredCount / block.lessons.length) * 100)
			: 0;

	return (
		<AccordionItem value={block.id}>
			<AccordionTrigger className="px-1 py-4 hover:no-underline">
				<div className="flex flex-1 flex-col gap-2 pr-2">
					<div className="flex items-center gap-3">
						<span className="text-lg font-semibold">{presentation.label}</span>
						{presentation.kind === "featured" && (
							<Badge variant="default" className="text-xs">
								Recommended
							</Badge>
						)}
						<span className="ml-auto text-sm text-muted-foreground">
							{exploredCount}/{block.lessons.length}
						</span>
					</div>
					<Progress value={progressPercent} />
				</div>
			</AccordionTrigger>
			<AccordionContent>
				<p className="mb-3 px-1 text-sm text-muted-foreground">
					{presentation.summary}
				</p>
				<ItemGroup>
					{block.lessons.map((lesson) => (
						<Item key={lesson.lessonKey} asChild size="sm">
							<Link href={`/lesson/${lesson.routeSegment}`}>
								<ItemContent>
									<ItemTitle>
										{lesson.displayLabel} {lesson.shortTitle}
									</ItemTitle>
									<ItemDescription>
										{lesson.title}
										{lesson.durationLabel ? ` · ${lesson.durationLabel}` : ""}
									</ItemDescription>
								</ItemContent>
								{lesson.status !== "available" && (
									<ItemActions>
										<Check className="size-4 text-emerald-500" />
									</ItemActions>
								)}
							</Link>
						</Item>
					))}
				</ItemGroup>
			</AccordionContent>
		</AccordionItem>
	);
}
