import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const STARTER_SEQUENCE = [
	"Product strategy",
	"UX design crit",
	"Engineering / build",
] as const;

export function CeoSkillsCodexStarterCard() {
	return (
		<Card className="gap-0 py-0">
			<CardHeader className="space-y-1 border-b border-border pb-3">
				<CardTitle className="text-base font-semibold">
					Starter stack for this course
				</CardTitle>
				<CardDescription className="text-pretty text-sm">
					A sane default order—strategy, then critique, then build reps.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3 pt-3 pb-4">
				<div className="flex flex-wrap gap-1.5">
					<Badge variant="secondary">Recommended</Badge>
					<Badge variant="outline">Course</Badge>
				</div>
				<ol className="list-decimal space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
					{STARTER_SEQUENCE.map((label) => (
						<li key={label}>
							<span className="font-medium text-foreground">{label}</span>
						</li>
					))}
				</ol>
				<Separator />
				<p className="text-xs leading-relaxed text-muted-foreground">
					Output for this lesson is setup and clarity—not a large build artifact.
				</p>
			</CardContent>
		</Card>
	);
}
