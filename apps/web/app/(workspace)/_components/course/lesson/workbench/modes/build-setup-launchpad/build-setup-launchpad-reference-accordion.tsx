"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

import {
	BUILD_SETUP_MAC_TIP,
	BUILD_SETUP_PROXY_ACCORDION_COPY,
} from "@/lib/course/lesson/workbench/modes/build-setup-launchpad/build-setup-launchpad-constants";

export function BuildSetupLaunchpadReferenceAccordion() {
	return (
		<Accordion type="single" collapsible className="w-full">
			<AccordionItem value="proxy">
				<AccordionTrigger className="text-left text-sm font-semibold">
					{BUILD_SETUP_PROXY_ACCORDION_COPY.title}
				</AccordionTrigger>
				<AccordionContent>
					<p className="text-sm leading-relaxed text-muted-foreground">
						{BUILD_SETUP_PROXY_ACCORDION_COPY.body}
					</p>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="mac">
				<AccordionTrigger className="text-left text-sm font-semibold text-muted-foreground">
					Optional: Mac / folder layout
				</AccordionTrigger>
				<AccordionContent>
					<p className="text-sm leading-relaxed text-muted-foreground">
						{BUILD_SETUP_MAC_TIP}
					</p>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
