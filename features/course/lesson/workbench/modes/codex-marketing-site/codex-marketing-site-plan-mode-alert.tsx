import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function CodexMarketingSitePlanModeAlert() {
	return (
		<Alert>
			<AlertTitle>Skip plan mode for this lesson</AlertTitle>
			<AlertDescription className="text-muted-foreground">
				Ask your agent for a <strong>copy pass</strong> first—then refine the
				headlines, CTAs, and bullets conversationally. Do not kick off plan mode
				or auto-apply file edits for this exercise; iterate in chat until the
				copy feels right, then commit and push yourself.
			</AlertDescription>
		</Alert>
	);
}
