import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { CardDescription, CardTitle } from "@/components/ui/card";
import type { BlockConfig } from "@/lib/course/lesson/model/contracts";
import type { LessonConfig } from "@/lib/course/lesson/model/manifest";

export type RoadmapCatalogBlock = BlockConfig & {
	description: string;
	lessons: LessonConfig[];
};

export function RoadmapSprintCatalogAccordion({
	orderedBlocks,
}: {
	orderedBlocks: RoadmapCatalogBlock[];
}) {
	return (
		<Accordion
			type="single"
			collapsible
			className="w-full rounded-lg border border-border/60 px-3"
		>
			<AccordionItem value="catalog" className="border-0">
				<AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
					See full lesson list
				</AccordionTrigger>
				<AccordionContent>
					<div className="grid gap-4 pb-2 sm:grid-cols-2 xl:grid-cols-4">
						{orderedBlocks.map((block) => (
							<div
								key={block.id}
								className="flex min-h-0 flex-col rounded-lg border border-border/60 bg-muted/10"
							>
								<div className="border-b border-border/60 px-3 py-3">
									<div className="flex items-center justify-between gap-2">
										<CardTitle className="text-xs font-semibold tracking-tight text-muted-foreground">
											{block.label}
										</CardTitle>
										<span className="shrink-0 text-[10px] font-medium text-muted-foreground">
											{block.lessons.length} lessons
										</span>
									</div>
									<CardDescription className="mt-2 text-xs leading-relaxed">
										{block.description}
									</CardDescription>
								</div>
								<div className="flex flex-1 flex-col gap-1.5 px-2 py-3">
									{block.lessons.map((lesson) => (
										<div
											key={lesson.id}
											className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-md border border-border/50 bg-background/60 px-2.5 py-2"
										>
											<span className="text-[10px] font-medium tabular-nums text-muted-foreground">
												{lesson.id}
											</span>
											<span className="min-w-0 text-xs leading-snug text-foreground">
												{lesson.shortTitle}
											</span>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
