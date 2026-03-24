import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const DELIVERABLES = [
	"Selected user",
	"Outcome statement",
	"Research notes",
	"User flow",
	"Build scope",
] as const;

export function RoadmapSprintDeliverablesCard() {
	return (
		<Card className="gap-0 py-0">
			<CardHeader className="border-b border-border/60 px-4 py-4 sm:px-5">
				<CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground">
					What this sprint produces
				</CardTitle>
				<CardDescription className="mt-2 max-w-[60ch] text-sm leading-relaxed">
					Concrete outputs you will create as you move through CEO and into
					Design.
				</CardDescription>
			</CardHeader>
			<CardContent className="px-4 py-4 sm:px-5">
				<ul className="list-inside list-disc space-y-1.5 text-sm leading-relaxed text-foreground">
					{DELIVERABLES.map((line) => (
						<li key={line}>{line}</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
