"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { FieldDescription, FieldError } from "@/components/ui/field";
import type { FeedbackState } from "@/app/(app)/_components/codex-connection-card/codex-connection-card-model";

export function CodexConnectionCardFeedback({
	feedback,
}: {
	feedback: FeedbackState | null;
}) {
	const reduceMotion = useReducedMotion() ?? false;

	return (
		<AnimatePresence initial={false} mode="wait">
			{feedback ? (
				<motion.div
					key={`${feedback.tone}:${feedback.message}`}
					initial={reduceMotion ? undefined : { opacity: 0, y: 4 }}
					animate={{ opacity: 1, y: 0 }}
					exit={reduceMotion ? undefined : { opacity: 0, y: -2 }}
					transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
					data-testid="codex-connection-feedback"
				>
					{feedback.tone === "error" ? (
						<FieldError>{feedback.message}</FieldError>
					) : (
						<FieldDescription aria-live="polite">
							{feedback.message}
						</FieldDescription>
					)}
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
