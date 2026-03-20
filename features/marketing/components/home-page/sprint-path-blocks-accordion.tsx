"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { HomePageContent } from "@/features/marketing/content/home";

type Block = HomePageContent["sprintPathSection"]["blocks"][number];

export function SprintPathBlocksAccordion({
	blocks,
	outcomesLabel,
}: {
	blocks: readonly Block[];
	outcomesLabel: string;
}) {
	return (
		<Accordion type="single" collapsible className="w-full">
			{blocks.map((block) => (
				<AccordionItem key={block.name} value={block.name}>
					<AccordionTrigger className="items-start gap-3 text-left hover:no-underline">
						<div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
							<div className="flex shrink-0 items-baseline gap-2">
								<span className="text-xs tabular-nums text-muted-foreground">
									{block.eyebrow}
								</span>
								<span className="text-base font-semibold sm:text-lg">
									{block.name}
								</span>
							</div>
							<p className="text-sm text-muted-foreground">
								{block.summary}
							</p>
						</div>
					</AccordionTrigger>
					<AccordionContent>
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground sm:text-base">
								{block.description}
							</p>
							<ul className="space-y-1.5">
								{block.hover.map((item) => (
									<li key={item} className="text-sm">
										{item}
									</li>
								))}
							</ul>
							<div>
								<p className="mb-2 text-xs font-medium text-muted-foreground">
									{outcomesLabel}
								</p>
								<div className="flex flex-wrap gap-1.5">
									{block.artifact.map((item) => (
										<Badge key={item} variant="outline">
											{item}
										</Badge>
									))}
								</div>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
}
