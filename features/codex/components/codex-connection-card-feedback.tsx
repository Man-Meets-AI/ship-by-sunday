import { Alert, AlertDescription } from "@/components/ui/alert";
import type { FeedbackState } from "@/features/codex/lib/codex-connection-card";

export function CodexConnectionCardFeedback({
	feedback,
}: {
	feedback: FeedbackState | null;
}) {
	return (
		<div aria-live="polite" className="min-h-4">
			{feedback ? (
				<Alert variant={feedback.tone === "error" ? "destructive" : "default"}>
					<AlertDescription>{feedback.message}</AlertDescription>
				</Alert>
			) : null}
		</div>
	);
}
