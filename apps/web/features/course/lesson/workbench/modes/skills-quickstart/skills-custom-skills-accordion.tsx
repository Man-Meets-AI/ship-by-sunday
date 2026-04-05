"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export function SkillsCustomSkillsAccordion() {
	return (
		<Card>
			<CardContent className="pt-6">
				<Accordion type="single" collapsible className="w-full">
					<AccordionItem value="custom">
						<AccordionTrigger className="text-sm font-medium hover:no-underline">
							Making your own skills
						</AccordionTrigger>
						<AccordionContent>
							<p className="pb-2 text-sm leading-relaxed text-muted-foreground">
								Start from a small, repeatable workflow you have actually run
								more than once. Name the skill, write steps in order, list files
								or APIs the tool should assume, and add safeguards (what not to
								change). Install it next to your other skill files so Codex or
								Cursor can discover it the same way as shipped skills.
							</p>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</CardContent>
		</Card>
	);
}
