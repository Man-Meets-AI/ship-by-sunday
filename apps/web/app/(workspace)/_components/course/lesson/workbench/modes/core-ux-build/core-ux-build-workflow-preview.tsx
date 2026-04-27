import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function CoreUxBuildWorkflowPreview() {
	return (
		<div className="space-y-3">
			<Separator />
			<div className="space-y-2">
				<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					After setup unlocks
				</p>
				<div className="flex flex-wrap gap-2">
					<Badge variant="outline">Ideas shown</Badge>
					<Badge variant="outline">Generate posts</Badge>
				</div>
				<p className="text-xs text-muted-foreground">
					Preview only—this lesson stops at handoff-ready artifacts.
				</p>
			</div>
		</div>
	);
}
