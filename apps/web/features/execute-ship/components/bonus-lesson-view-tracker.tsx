"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const TERMINAL_VIEW_TRACKER_ERROR_MESSAGES = new Set([
	"Unauthorized",
	"Access required",
	"Execute / Ship is still locked",
]);

function getErrorMessage(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === "string") {
		return error;
	}

	return null;
}

function isTerminalViewTrackerError(error: unknown) {
	const message = getErrorMessage(error);
	if (!message) {
		return false;
	}

	return Array.from(TERMINAL_VIEW_TRACKER_ERROR_MESSAGES).some(
		(candidateMessage) =>
			message === candidateMessage || message.includes(candidateMessage),
	);
}

export function BonusLessonViewTracker({ lessonKey }: { lessonKey: string }) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const markBonusLessonViewed = useMutation(api.course.markBonusLessonViewed);
	const markAttemptStateRef = useRef<"idle" | "pending" | "done">("idle");

	useEffect(() => {
		if (isLoading || !isAuthenticated) {
			return;
		}

		if (markAttemptStateRef.current !== "idle") {
			return;
		}

		markAttemptStateRef.current = "pending";
		void (async () => {
			try {
				await markBonusLessonViewed({ lessonKey });
				markAttemptStateRef.current = "done";
			} catch (error) {
				markAttemptStateRef.current = isTerminalViewTrackerError(error)
					? "done"
					: "idle";
			}
		})();
	}, [isAuthenticated, isLoading, lessonKey, markBonusLessonViewed]);

	return null;
}
