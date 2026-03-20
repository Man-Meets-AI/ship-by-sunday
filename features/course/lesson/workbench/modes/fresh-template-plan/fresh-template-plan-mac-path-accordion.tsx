import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export function FreshTemplatePlanMacPathAccordion() {
	return (
		<Accordion type="single" collapsible className="w-full">
			<AccordionItem value="mac-path">
				<AccordionTrigger className="text-sm font-medium">
					Copy a folder path on macOS
				</AccordionTrigger>
				<AccordionContent className="text-sm text-muted-foreground">
					In Finder, right-click the folder, hold{" "}
					<kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-xs">
						Option
					</kbd>
					, then choose <strong>Copy … as Pathname</strong>. Paste that path
					into Reference codebase path above.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
