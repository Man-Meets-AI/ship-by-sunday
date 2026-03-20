"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function CoreUxPlanFlowPlanOutcome() {
	return (
		<div className="space-y-4">
			<Alert variant="default">
				<AlertTitle>Recommendations are a draft</AlertTitle>
				<AlertDescription>
					Codex defaults are not always correct. Inspect each recommendation,
					then choose answers and submit a plan you actually stand behind.
				</AlertDescription>
			</Alert>

			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-base">What the plan should include</CardTitle>
					<CardDescription>
						When you generate the v1 plan, it should name these explicitly.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
						<li>Slices (ordered work chunks for this pass)</li>
						<li>Affected codebase areas (where you expect churn)</li>
						<li>Risks (what could blow up scope or quality)</li>
						<li>Dependencies (services, keys, people, or prior lessons)</li>
					</ul>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-base">Referenced in the example</CardTitle>
					<CardDescription>
						Concrete services and destinations from the walkthrough—not generic
						placeholders.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-2">
					{[
						"StoryBlast",
						"Stripe",
						"Community Listing",
						"Local Codex Bridge",
						"ChatGPT",
					].map((label) => (
						<Badge key={label} variant="secondary">
							{label}
						</Badge>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-base">Alternate starting input</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">
					The same planning flow can start from a whiteboard or paper sketch
					photo—rough input is fine as long as you still run clarifying questions
					and review recommendations.
				</CardContent>
			</Card>
		</div>
	);
}
