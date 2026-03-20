"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import type { HomePageContent } from "@/features/marketing/content/home";
import { cn } from "@/lib/utils";

type Block = HomePageContent["sprintPathSection"]["blocks"][number];

export function SprintPathBlocksAccordion({
	blocks,
	outcomesLabel,
}: {
	blocks: readonly Block[];
	outcomesLabel: string;
}) {
	return (
		<Accordion
			type="single"
			collapsible
			className="flex w-full flex-col gap-3 rounded-2xl border border-border/40 bg-muted/15 p-2 sm:gap-3 sm:p-3"
		>
			{blocks.map((block) => (
				<AccordionItem
					key={block.name}
					value={block.name}
					className={cn(
						"overflow-hidden rounded-xl border border-border/45 bg-background/90 shadow-sm",
						"not-last:border-b-0",
					)}
				>
					<AccordionTrigger className="items-start gap-3 px-4 py-4 hover:no-underline sm:px-5 sm:py-4">
						<div className="flex min-w-0 flex-1 flex-col gap-2 text-left sm:flex-row sm:items-start sm:gap-5">
							<div className="flex shrink-0 items-baseline gap-2.5">
								<span className="tabular-nums text-xs font-medium text-muted-foreground">
									{block.eyebrow}
								</span>
								<span className="text-base font-semibold sm:text-lg">
									{block.name}
								</span>
							</div>
							<p className="min-w-0 text-sm leading-relaxed text-muted-foreground sm:max-w-xl sm:text-base">
								{block.summary}
							</p>
						</div>
					</AccordionTrigger>
					<AccordionContent>
						<div className="space-y-4 border-t border-border/40 px-4 pb-4 pt-4 sm:px-5">
							<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
								{block.description}
							</p>
							<ul className="space-y-1.5">
								{block.hover.map((item) => (
									<li
										key={item}
										className="text-sm leading-relaxed text-foreground/90"
									>
										{item}
									</li>
								))}
							</ul>
							<div className="rounded-lg bg-muted/25 px-3 py-3 sm:px-4 sm:py-3.5">
								<p className="mb-2 text-[11px] font-medium text-muted-foreground">
									{outcomesLabel}
								</p>
								<ul className="flex flex-wrap gap-1.5">
									{block.artifact.map((item) => (
										<li
											key={item}
											className="rounded-md border border-border/50 bg-background/90 px-2.5 py-1 text-left text-xs leading-snug text-foreground sm:text-sm"
										>
											{item}
										</li>
									))}
								</ul>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
}
