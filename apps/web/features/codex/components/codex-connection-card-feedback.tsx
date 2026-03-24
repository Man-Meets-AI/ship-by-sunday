import { FieldDescription, FieldError } from "@/components/ui/field";
import type { FeedbackState } from "@/features/codex/lib/codex-connection-card";

export function CodexConnectionCardFeedback({
	feedback,
}: {
	feedback: FeedbackState | null;
}) {
	if (!feedback) {
		return null;
	}

	if (feedback.tone === "error") {
		return <FieldError>{feedback.message}</FieldError>;
	}

	return (
		<FieldDescription aria-live="polite">{feedback.message}</FieldDescription>
	);
}
