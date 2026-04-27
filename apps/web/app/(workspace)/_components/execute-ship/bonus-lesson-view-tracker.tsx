"use client";

import { useEffect, useRef } from "react";
import {
	BONUS_LESSON_VIEWED_ENDPOINT,
	BONUS_LESSON_VIEW_ERROR_CODES,
} from "@/lib/execute-ship/bonus-lesson-view-contract";

const TERMINAL_VIEW_TRACKER_ERROR_CODES = new Set<string>([
	BONUS_LESSON_VIEW_ERROR_CODES.unauthorized,
	BONUS_LESSON_VIEW_ERROR_CODES.forbidden,
	BONUS_LESSON_VIEW_ERROR_CODES.notFound,
	BONUS_LESSON_VIEW_ERROR_CODES.badRequest,
]);

type BonusLessonViewTrackerResponse = {
	code?: unknown;
	error?: unknown;
};

function getTerminalResponseCode(responseBody: BonusLessonViewTrackerResponse) {
	return typeof responseBody.code === "string" ? responseBody.code : null;
}

function isTerminalViewTrackerResponse(
	response: Response,
	responseBody: BonusLessonViewTrackerResponse,
) {
	if (response.ok) {
		return true;
	}

	const code = getTerminalResponseCode(responseBody);
	if (!code) {
		return false;
	}

	return TERMINAL_VIEW_TRACKER_ERROR_CODES.has(code);
}

async function markBonusLessonViewed(lessonKey: string) {
	const response = await fetch(BONUS_LESSON_VIEWED_ENDPOINT, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ lessonKey }),
		keepalive: true,
	});
	const responseBody = (await response
		.json()
		.catch(() => ({}))) as BonusLessonViewTrackerResponse;

	return isTerminalViewTrackerResponse(response, responseBody)
		? "done"
		: "idle";
}

export function BonusLessonViewTracker({ lessonKey }: { lessonKey: string }) {
	const markAttemptStateRef = useRef<"idle" | "pending" | "done">("idle");

	useEffect(() => {
		if (markAttemptStateRef.current !== "idle") {
			return;
		}

		markAttemptStateRef.current = "pending";
		void (async () => {
			try {
				markAttemptStateRef.current = await markBonusLessonViewed(lessonKey);
			} catch {
				markAttemptStateRef.current = "idle";
			}
		})();
	}, [lessonKey]);

	return null;
}
