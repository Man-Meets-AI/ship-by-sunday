import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export function CeoSkillsCodexAlerts() {
	return (
		<div className="space-y-3">
			<Alert>
				<AlertTitle>Skills lists feel huge</AlertTitle>
				<AlertDescription className="text-sm leading-relaxed">
					That is normal. For this sprint, stay on the{" "}
					<span className="font-medium text-foreground">
						course-recommended starter stack
					</span>{" "}
					— you do not need to install everything you see.
				</AlertDescription>
			</Alert>
			<Alert
				className={cn(
					"border-violet-500/40 bg-violet-500/5 dark:border-violet-400/35 dark:bg-violet-500/10",
				)}
			>
				<AlertTitle className="text-violet-950 dark:text-violet-100">
					Look for UX design crit
				</AlertTitle>
				<AlertDescription className="text-sm leading-relaxed text-violet-950/90 dark:text-violet-100/90">
					In the video, the instructor points at the{" "}
					<span className="font-medium">purple UX design crit</span> example in the
					skills UI—use it as the anchor for what a “skill job” looks like in
					practice.
				</AlertDescription>
			</Alert>
		</div>
	);
}
