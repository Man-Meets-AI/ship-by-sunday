"use client";

import { toast } from "sonner";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import {
	BUILD_SLICES_EXAMPLE_PROMPT,
	BUILD_SLICES_LOOP_STEPS,
	BUILD_SLICES_NICHE_RESEARCH_EXAMPLE,
	BUILD_SLICES_SLICE_HELP,
} from "./build-setting-up-slices-constants";
import { BuildSettingUpSlicesPlanningRadio } from "./build-setting-up-slices-planning-radio";

export function BuildSettingUpSlicesGuide({
	value,
	onChange,
}: {
	value: unknown;
	onChange: (value: unknown) => void;
}) {
	return (
		<Card>
			<CardHeader className="space-y-1 pb-3">
				<CardTitle className="text-base">Reference</CardTitle>
				<CardDescription>
					Loop, planning mode, example prompt, and definitions.
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-0">
				<Tabs defaultValue="loop">
					<TabsList className="mb-4 w-full min-w-0 sm:w-auto">
						<TabsTrigger value="loop" className="flex-1 sm:flex-initial">
							Loop
						</TabsTrigger>
						<TabsTrigger value="planning" className="flex-1 sm:flex-initial">
							Planning
						</TabsTrigger>
						<TabsTrigger value="example" className="flex-1 sm:flex-initial">
							Example &amp; help
						</TabsTrigger>
					</TabsList>
					<TabsContent value="loop" className="space-y-2">
						<p className="text-sm text-muted-foreground">
							Run this loop whenever you move from UX to planning and back.
						</p>
						<ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
							{BUILD_SLICES_LOOP_STEPS.map((label) => (
								<li key={label}>{label}</li>
							))}
						</ol>
					</TabsContent>
					<TabsContent value="planning">
						<BuildSettingUpSlicesPlanningRadio
							value={value}
							onChange={onChange}
						/>
					</TabsContent>
					<TabsContent value="example" className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Problem, current belief, uncertainty, and a supporting link—then
							adapt the labels to your situation.
						</p>
						<Textarea
							readOnly
							className="min-h-[180px] resize-y font-mono text-xs leading-relaxed"
							value={BUILD_SLICES_EXAMPLE_PROMPT}
							aria-label="Example planning prompt"
						/>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={() => {
								void (async () => {
									try {
										await navigator.clipboard.writeText(
											BUILD_SLICES_EXAMPLE_PROMPT,
										);
										toast.success("Example prompt copied");
									} catch {
										toast.error(
											"Could not copy—try selecting the text manually",
										);
									}
								})();
							}}
						>
							Copy example prompt
						</Button>
						<Accordion type="multiple" className="border-t border-border pt-4">
							<AccordionItem value="slice">
								<AccordionTrigger className="text-sm font-medium">
									What is a slice? What is the blueprint?
								</AccordionTrigger>
								<AccordionContent className="text-sm leading-relaxed text-muted-foreground">
									{BUILD_SLICES_SLICE_HELP} The planner returns a{" "}
									<strong className="text-foreground">blueprint</strong> of
									candidate slices; you pick one, implement it, then test
									against your core UX.
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="research">
								<AccordionTrigger className="text-sm font-medium">
									Research question example (niche)
								</AccordionTrigger>
								<AccordionContent className="text-sm leading-relaxed text-muted-foreground">
									{BUILD_SLICES_NICHE_RESEARCH_EXAMPLE}
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
