"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export function SkillsCustomSkillsAccordion() {
	return (
		<Accordion type="single" collapsible className="w-full rounded-lg border px-3">
			<AccordionItem value="custom" className="border-0">
				<AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
					Making your own skills
				</AccordionTrigger>
				<AccordionContent>
					<p className="pb-2 text-sm leading-relaxed text-muted-foreground">
						Start from a small, repeatable workflow you have actually run more
						than once. Name the skill, write steps in order, list files or APIs
						the tool should assume, and add guardrails (what not to change).
						Install it next to your other skill files so Codex or Cursor can
						discover it the same way as shipped skills.
					</p>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
