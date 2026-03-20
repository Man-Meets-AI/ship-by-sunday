import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export function CodexMarketingSiteAdvancedAccordion() {
	return (
		<Accordion type="single" collapsible className="w-full rounded-md border border-border px-3">
			<AccordionItem value="advanced" className="border-none">
				<AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
					Optional: advanced ideas
				</AccordionTrigger>
				<AccordionContent className="space-y-3 pb-3 text-xs text-muted-foreground">
					<div>
						<p className="font-medium text-foreground">Competitor comparison</p>
						<p className="mt-1 leading-relaxed">
							If it helps, sketch a simple table: you vs. one alternative on
							price, setup time, and who it is for—not required for this lesson.
						</p>
					</div>
					<div>
						<p className="font-medium text-foreground">
							Custom copywriting skill
						</p>
						<p className="mt-1 leading-relaxed">
							Later you can package your voice rules as a Codex skill (e.g.
							Ogilvy-style constraints). Skip while you are still shipping v1
							copy.
						</p>
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
