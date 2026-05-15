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
					<AccordionTrigger className="relative text-left text-base after:absolute after:bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-foreground/30 motion-safe:after:transition-transform motion-safe:after:duration-300 data-[state=open]:after:scale-x-100 sm:text-lg">
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
