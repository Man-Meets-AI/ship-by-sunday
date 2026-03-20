import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { ROUTE_ACCESS_GLOSSARY_ITEMS } from "./route-access-orientation-constants";

export function RouteAccessGlossary() {
	return (
		<Card>
			<CardHeader className="space-y-3 pb-2">
				<CardTitle className="text-base font-semibold">Glossary</CardTitle>
				<CardDescription>
					Short definitions for access vocabulary.
				</CardDescription>
				<Accordion type="single" collapsible className="w-full border-t pt-2">
					{ROUTE_ACCESS_GLOSSARY_ITEMS.map((item) => (
						<AccordionItem key={item.term} value={item.term}>
							<AccordionTrigger className="text-sm font-medium">
								{item.term}
							</AccordionTrigger>
							<AccordionContent className="text-sm leading-relaxed text-muted-foreground">
								{item.body}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</CardHeader>
		</Card>
	);
}
