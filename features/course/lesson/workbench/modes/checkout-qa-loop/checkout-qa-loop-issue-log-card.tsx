"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
	CHECKOUT_QA_CLERK_SETTING_NOTE,
	CHECKOUT_QA_PARALLEL_AGENTS_NOTE,
	CHECKOUT_QA_TRANSCRIPT_ISSUES,
} from "./checkout-qa-loop-constants";

export function CheckoutQaLoopIssueLogCard() {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">
					Bugs from the lesson transcript
				</CardTitle>
				<CardDescription>
					Use as a checklist when comparing your run—your QA report should call
					out what still reproduces.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<ul className="list-inside list-disc space-y-1.5 text-sm text-foreground">
					{CHECKOUT_QA_TRANSCRIPT_ISSUES.map((line) => (
						<li key={line}>{line}</li>
					))}
				</ul>
				<Collapsible className="w-full border-t border-border pt-2">
					<CollapsibleTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							className="h-auto w-full justify-start px-0 py-2 font-medium"
						>
							Setup notes (short)
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent className="space-y-3 pb-2 text-sm text-muted-foreground">
						<p>{CHECKOUT_QA_PARALLEL_AGENTS_NOTE}</p>
						<p>{CHECKOUT_QA_CLERK_SETTING_NOTE}</p>
					</CollapsibleContent>
				</Collapsible>
			</CardContent>
		</Card>
	);
}
