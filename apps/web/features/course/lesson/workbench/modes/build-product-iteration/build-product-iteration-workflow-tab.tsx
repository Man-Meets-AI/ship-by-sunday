"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

const STEPS = [
	{
		title: "Clarify before building",
		body: "Ask questions until the model understands the screen, user, and constraint—not a vague goal.",
	},
	{
		title: "Run the real product",
		body: "Boot the stack or app locally, click the flow, and reproduce what you see—don’t guess from memory.",
	},
	{
		title: "Show evidence",
		body: "Capture screenshots of UI and errors. File bugs with screenshots and repro steps, then discuss before asking for a big plan.",
	},
] as const;

export function BuildProductIterationWorkflowTab() {
	return (
		<div className="space-y-3">
			<p className="text-sm text-muted-foreground">
				Three-step loop the instructor uses when iterating with AI—keep it
				lightweight.
			</p>
			<Accordion type="single" collapsible className="w-full">
				{STEPS.map((step, index) => (
					<AccordionItem key={step.title} value={`step-${index}`}>
						<AccordionTrigger className="text-left text-sm font-medium">
							{index + 1}. {step.title}
						</AccordionTrigger>
						<AccordionContent className="text-sm text-muted-foreground">
							{step.body}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);
}
