import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function FreshTemplatePlanGoalAndBadges() {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Goal</CardTitle>
				<CardDescription>
					Create a fresh-template implementation plan in Codex before you write
					production code. The artifact for this lesson is the plan—not a built
					app.
				</CardDescription>
			</CardHeader>
			<CardFooter className="flex flex-wrap gap-2 border-t border-border pt-4">
				<Badge variant="secondary">Codex</Badge>
				<Badge variant="secondary">Convex</Badge>
				<Badge variant="secondary">Next.js</Badge>
			</CardFooter>
		</Card>
	);
}
