import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Item, ItemContent, ItemGroup } from "@/components/ui/item";
import { CircleIcon } from "lucide-react";

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
				<ItemGroup className="gap-1.5" role="list">
					{SPRINT_SEQUENCE_STEPS.map((label) => (
						<Item
							key={label}
							variant="outline"
							size="sm"
							role="listitem"
							className="border-border/50 bg-muted/10 px-3 py-2"
						>
							<ItemContent className="flex-row items-center gap-2.5">
								<CircleIcon
									className="size-3.5 shrink-0 text-muted-foreground"
									aria-hidden
								/>
								<span className="text-sm leading-snug text-foreground">
									{label}
								</span>
							</ItemContent>
						</Item>
					))}
				</ItemGroup>
			</CardContent>
		</Card>
	);
}
