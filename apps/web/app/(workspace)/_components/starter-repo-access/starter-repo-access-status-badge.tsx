import { Badge } from "@/components/ui/badge";
import {
	getStarterRepoStatusLabel,
	type StarterRepoAccessStatus,
} from "@/config/starter-repo-access-copy";
import { cn } from "@/lib/utils";

export function StarterRepoAccessStatusBadge({
	status,
}: {
	status: StarterRepoAccessStatus;
}) {
	const variant =
		status === "accepted"
			? "secondary"
			: status === "failed"
				? "destructive"
				: status === "requested" || status === "invited" || status === "loading"
					? "outline"
					: "outline";

	return (
		<Badge
			variant={variant}
			className={cn(
				"shrink-0",
				variant === "outline" &&
					"border-border/70 text-foreground dark:border-border/60",
			)}
			data-testid="starter-repo-status"
		>
			{getStarterRepoStatusLabel(status)}
		</Badge>
	);
}
