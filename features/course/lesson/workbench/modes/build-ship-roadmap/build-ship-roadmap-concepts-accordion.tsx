"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

import { CONCEPT_ACCORDION_ITEMS } from "./build-ship-roadmap-constants";

export function BuildShipRoadmapConceptsAccordion() {
	return (
		<Accordion type="multiple" className="w-full">
			{CONCEPT_ACCORDION_ITEMS.map((item) => (
				<AccordionItem key={item.value} value={item.value}>
					<AccordionTrigger className="text-left text-sm font-medium">
						{item.title}
					</AccordionTrigger>
					<AccordionContent className="text-sm leading-relaxed text-muted-foreground">
						{item.body}
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
}
