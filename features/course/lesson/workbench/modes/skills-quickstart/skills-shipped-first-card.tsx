"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function SkillsShippedFirstCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Use shipped skills first</CardTitle>
				<CardDescription>
					Reach for maintained skills before writing your own.
				</CardDescription>
			</CardHeader>
			<CardContent className="text-sm leading-relaxed text-muted-foreground">
				<p>
					Add a custom skill only when you can write very granular steps and
					context — otherwise you are duplicating what a public skill already
					encodes.
				</p>
			</CardContent>
		</Card>
	);
}
