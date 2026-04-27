"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function SkillsDecisionRuleCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Which category first?</CardTitle>
				<CardDescription>
					Use this order when you are unsure where to start.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ul className="list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
					<li>
						<span className="font-medium text-foreground">Auth / identity</span>{" "}
						→ Clerk skills
					</li>
					<li>
						<span className="font-medium text-foreground">
							Backend data / realtime
						</span>{" "}
						→ Convex skills
					</li>
					<li>
						<span className="font-medium text-foreground">Scope creep</span> →
						workflow skills like avoid-feature-creep
					</li>
					<li>
						<span className="font-medium text-foreground">Browser QA</span> →
						qa-browser
					</li>
				</ul>
			</CardContent>
		</Card>
	);
}
