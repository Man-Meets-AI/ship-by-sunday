"use client";

import { toast } from "sonner";

export type CopyCoursePromptResult = "copied" | "unavailable" | "blocked";

/** Copy lesson text to the clipboard and show Sonner on success (prompts, commands, URLs, etc.). */
export async function copyCoursePromptToClipboard(
	text: string,
	successMessage: string,
): Promise<CopyCoursePromptResult> {
	if (!text.trim()) {
		return "blocked";
	}
	if (!navigator.clipboard?.writeText) {
		return "unavailable";
	}
	try {
		await navigator.clipboard.writeText(text);
		toast.success(successMessage);
		return "copied";
	} catch {
		return "unavailable";
	}
}

/** Same as {@link copyCoursePromptToClipboard}; use when the copied string is not a “prompt.” */
export const copyLessonTextToClipboard = copyCoursePromptToClipboard;
