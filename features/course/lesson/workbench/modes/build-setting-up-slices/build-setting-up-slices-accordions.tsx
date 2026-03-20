"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import {
	BUILD_SLICES_NICHE_RESEARCH_EXAMPLE,
	BUILD_SLICES_SLICE_HELP,
} from "./build-setting-up-slices-constants";

export function BuildSettingUpSlicesAccordions() {
	return (
		<Card>
			<CardHeader className="space-y-1 pb-2">
				<CardTitle className="text-base">Packets and examples</CardTitle>
				<CardDescription>
					Open a section when you want the definition or a niche pattern.
				</CardDescription>
			</CardHeader>
			<Accordion type="multiple" className="border-t border-border px-6 pb-4">
				<AccordionItem value="slice">
					<AccordionTrigger className="text-sm font-medium">
						What is a slice? What is the packet?
					</AccordionTrigger>
					<AccordionContent className="text-sm leading-relaxed text-muted-foreground">
						{BUILD_SLICES_SLICE_HELP} The planner returns a{" "}
						<strong className="text-foreground">packet</strong> of candidate
						slices; you pick one, implement it, then test against your core UX.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="research">
					<AccordionTrigger className="text-sm font-medium">
						<span className="flex flex-wrap items-center gap-2">
							Research question example
							<Badge variant="secondary">Niche</Badge>
							<Badge variant="outline">Research</Badge>
						</span>
					</AccordionTrigger>
					<AccordionContent className="text-sm leading-relaxed text-muted-foreground">
						{BUILD_SLICES_NICHE_RESEARCH_EXAMPLE}
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</Card>
	);
}
