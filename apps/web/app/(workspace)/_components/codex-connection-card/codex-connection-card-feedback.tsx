import { FieldDescription, FieldError } from "@/components/ui/field";
import type { FeedbackState } from "@/app/(workspace)/_components/codex-connection-card/codex-connection-card-model";

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
