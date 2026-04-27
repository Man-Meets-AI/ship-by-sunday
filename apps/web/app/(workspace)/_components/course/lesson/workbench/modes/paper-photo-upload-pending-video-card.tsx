"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

export type CoachExample = {
	id: string;
	title: string;
	body: string;
};

const chromeLabelClass =
	"text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground";

export function PendingVideoFallback({
	currentWorkaround,
	outcome,
	fallbackExamples,
}: {
	currentWorkaround: string;
	outcome: string;
	fallbackExamples: CoachExample[];
}) {
	const [examplesOpen, setExamplesOpen] = useState(false);

	return (
		<Card className="mt-3">
			<CardContent className="space-y-3 pt-6">
				<p className="text-sm leading-relaxed text-foreground [text-wrap:pretty]">
					Until the walkthrough lands, use one rule: draw the smallest
					believable path from {currentWorkaround} to {outcome}.
				</p>
				{fallbackExamples.length > 0 ? (
					<Collapsible open={examplesOpen} onOpenChange={setExamplesOpen}>
						<CollapsibleTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className={`h-auto px-0 ${chromeLabelClass} hover:bg-transparent`}
							>
								{examplesOpen ? "Hide example" : "Need an example?"}
							</Button>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<div className="mt-3 grid gap-3 md:grid-cols-2">
								{fallbackExamples.map((example) => (
									<Card key={example.id} className="bg-muted/30">
										<CardHeader className="pb-2">
											<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
												{example.title}
											</CardTitle>
										</CardHeader>
										<CardContent className="pt-0">
											<p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
												{example.body}
											</p>
										</CardContent>
									</Card>
								))}
							</div>
						</CollapsibleContent>
					</Collapsible>
				) : null}
			</CardContent>
		</Card>
	);
}
