import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export function CompetitorResearchExampleAccordion() {
	return (
		<Accordion type="single" collapsible className="w-full">
			<AccordionItem value="example">
				<AccordionTrigger className="text-left text-sm font-medium">
					Example (food delivery): quick pattern scan
				</AccordionTrigger>
				<AccordionContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
					<p>
						Compare how DoorDash, Uber Eats, and calling a restaurant directly
						solve &quot;I want food here soon.&quot; Pricing: fees vs. minimums
						vs. cash. Messaging: speed vs. selection vs. trust. Product:
						tracking, re-order, support.
					</p>
					<p className="text-foreground">
						You are doing the same shape of pass for your user and outcome—just
						enough to spot what to borrow or avoid.
					</p>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
