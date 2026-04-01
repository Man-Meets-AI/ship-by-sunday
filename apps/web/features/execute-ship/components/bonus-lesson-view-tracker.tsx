"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

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
		void markBonusLessonViewed({ lessonKey }).then(
			() => {
				markAttemptStateRef.current = "done";
			},
			() => {
				markAttemptStateRef.current = "idle";
			},
		);
	}, [isAuthenticated, isLoading, lessonKey, markBonusLessonViewed]);

	return null;
}
