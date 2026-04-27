"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function SkillsHowItWorksCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>How skills work</CardTitle>
				<CardDescription>
					A skill is a short job description plus instructions and context the
					tool reads before it helps you. You still ask a normal question — the
					skill shapes how the assistant thinks.
				</CardDescription>
			</CardHeader>
			<CardContent className="text-sm leading-relaxed text-muted-foreground">
				<p>
					Skills live as files on your machine; invoking one pulls that file
					into context. Compared to guessing from generic web docs, you get
					product-shaped defaults — when you pick the right specialist.
				</p>
			</CardContent>
		</Card>
	);
}
