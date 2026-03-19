"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export type FAQItem = {
	question: string;
	answer: string;
};

export default function FAQAccordion({ items }: { items: readonly FAQItem[] }) {
	return (
		<Accordion type="single" collapsible className="w-full">
			{items.map((item, index) => (
				<AccordionItem key={item.question} value={`faq-${index}`}>
					<AccordionTrigger className="text-left text-base sm:text-lg">
						{item.question}
					</AccordionTrigger>
					<AccordionContent className="text-muted-foreground">
						{item.answer}
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
}
