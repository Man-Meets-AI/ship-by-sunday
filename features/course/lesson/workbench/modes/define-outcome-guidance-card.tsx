import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function DefineOutcomeGuidanceCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Writing prompt</CardTitle>
				<ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
					<li>What is the problem?</li>
					<li>Who is the person?</li>
					<li>What does it do for them?</li>
					<li>What do they get out of this?</li>
				</ul>
			</CardHeader>
			<CardContent>
				<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					Template
				</p>
				<p className="mt-2 font-mono text-sm leading-relaxed text-foreground">
					For [person], who struggles with [problem], this helps them [result] so
					they can [benefit].
				</p>
			</CardContent>
		</Card>
	);
}
