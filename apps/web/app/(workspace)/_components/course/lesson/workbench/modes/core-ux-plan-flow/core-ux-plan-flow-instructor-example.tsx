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
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";

import { CORE_UX_PLAN_INSTRUCTOR_DECISIONS } from "@/lib/course/lesson/workbench/modes/core-ux-plan-flow/core-ux-plan-flow-constants";

export function CoreUxPlanFlowInstructorExample() {
	return (
		<TabsContent value="instructor" className="mt-4 space-y-4">
			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-base">
						Clarifying questions (example)
					</CardTitle>
					<CardDescription>
						In planning mode, Codex surfaces questions like these—answer them in
						your own product terms before you accept defaults.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
						<li>How will you distribute the release (web-led vs other)?</li>
						<li>Whether to keep the local Codex bridge in scope.</li>
						<li>
							The buyer-facing AI promise (what you actually ship vs imply).
						</li>
						<li>Where buyers go after purchase to install or finish setup.</li>
					</ul>
				</CardContent>
			</Card>

			<div className="space-y-2">
				<p className="text-sm font-medium text-foreground">
					Example decisions from the walkthrough
				</p>
				<p className="text-xs text-muted-foreground">
					Open each row to see the chosen answer and why you should read the
					rationale—not blindly accept the default.
				</p>
				<Accordion
					type="multiple"
					className="w-full rounded-lg border border-border"
				>
					{CORE_UX_PLAN_INSTRUCTOR_DECISIONS.map((decision) => (
						<AccordionItem key={decision.id} value={decision.id}>
							<AccordionTrigger className="px-4 text-left text-sm">
								{decision.title}
							</AccordionTrigger>
							<AccordionContent className="space-y-4 px-4 pb-4">
								<p className="text-sm text-muted-foreground">
									{decision.questionLine}
								</p>
								<div className="space-y-2">
									<Label className="text-xs text-muted-foreground">
										Chosen answer (example)
									</Label>
									<div className="flex flex-wrap items-center gap-2">
										<Badge
											variant="secondary"
											className="max-w-full text-left font-normal"
										>
											{decision.chosenAnswer}
										</Badge>
									</div>
									<p className="text-xs text-muted-foreground">
										Other options from the walkthrough:{" "}
										{decision.selectOptions
											.filter((opt) => opt !== decision.chosenAnswer)
											.join(" · ")}
									</p>
								</div>
								<div>
									<p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
										Recommendation details
									</p>
									<ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
										{decision.rationale.map((line) => (
											<li key={line}>{line}</li>
										))}
									</ul>
								</div>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</TabsContent>
	);
}
