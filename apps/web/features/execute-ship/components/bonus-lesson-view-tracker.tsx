"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function BonusLessonViewTracker({ lessonKey }: { lessonKey: string }) {
	const markBonusLessonViewed = useMutation(api.course.markBonusLessonViewed);
	const hasMarkedLessonRef = useRef(false);

	useEffect(() => {
		if (hasMarkedLessonRef.current) {
			return;
		}

		hasMarkedLessonRef.current = true;
		void markBonusLessonViewed({ lessonKey });
	}, [lessonKey, markBonusLessonViewed]);

	return null;
}
