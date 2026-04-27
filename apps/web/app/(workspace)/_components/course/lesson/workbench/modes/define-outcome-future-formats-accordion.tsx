import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export function DefineOutcomeFutureFormatsAccordion() {
	return (
		<Accordion type="single" collapsible className="w-full">
			<AccordionItem value="next">
				<AccordionTrigger>Where this goes next</AccordionTrigger>
				<AccordionContent>
					<ul className="list-disc space-y-1.5 pb-2 pl-5 text-sm text-muted-foreground">
						<li>One-liner</li>
						<li>Two-liner</li>
						<li>30-second pitch</li>
						<li>90-second pitch</li>
					</ul>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
