import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const SPRINT_SEQUENCE_STEPS = [
	"Problem space",
	"Pick one user",
	"Outcome statement",
	"Light research",
	"User flow (Design)",
	"Scope what to build",
	"Design block (screens and decisions)",
] as const;

export function RoadmapSprintSequencePreview() {
	return (
		<Card className="gap-0 py-0">
			<CardHeader className="border-b border-border/60 px-4 py-4 sm:px-5">
				<CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground">
					Sequence ahead
				</CardTitle>
				<CardDescription className="mt-2 max-w-[60ch] text-sm leading-relaxed">
					This is the order the sprint expects. Complete lessons in
					sequence—each one sets up the next.
				</CardDescription>
			</CardHeader>
			<CardContent className="px-3 py-4 sm:px-4">
				<ol className="space-y-1 p-0">
					{SPRINT_SEQUENCE_STEPS.map((label, i) => (
						<li key={label} className="flex items-center gap-3 py-1">
							<span className="text-xs tabular-nums text-muted-foreground">
								{i + 1}.
							</span>
							<span className="text-sm leading-snug text-foreground">
								{label}
							</span>
						</li>
					))}
				</ol>
			</CardContent>
		</Card>
	);
}
