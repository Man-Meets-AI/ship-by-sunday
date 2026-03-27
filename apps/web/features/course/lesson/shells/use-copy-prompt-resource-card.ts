import { useEffect, useRef, useState } from "react";

import { timingConfig } from "@/config/product";
import { copyCoursePromptToClipboard } from "@/features/course/lesson/lib/copy-course-prompt";
import type { LessonPromptResourceContent } from "@/features/course/lesson/model/contracts";

import type { PinnedArtifact } from "./types";

function getCopySuccessMessage(resource: LessonPromptResourceContent) {
	return (
		resource.copySuccessToastMessage ??
		"Copied prompt. Go paste it in your favorite model."
	);
}

export function useCopyPromptResourceCard(
	resource: LessonPromptResourceContent,
	_pinnedArtifacts: PinnedArtifact[],
) {
	const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
		"idle",
	);
	const resetTimeoutRef = useRef<number | null>(null);
	const prompt = resource.body?.trim() || null;
	const disabledReason = prompt
		? null
		: "This prompt card does not have copy text yet.";

	useEffect(() => {
		return () => {
			if (resetTimeoutRef.current !== null) {
				window.clearTimeout(resetTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		setCopyState("idle");
	}, [disabledReason, prompt]);

	const copyPrompt = () => {
		if (!prompt || disabledReason) {
			return;
		}

		void copyCoursePromptToClipboard(
			prompt,
			getCopySuccessMessage(resource),
		).then((result) => {
			if (result === "copied") {
				if (resetTimeoutRef.current !== null) {
					window.clearTimeout(resetTimeoutRef.current);
				}
				setCopyState("copied");
				resetTimeoutRef.current = window.setTimeout(() => {
					resetTimeoutRef.current = null;
					setCopyState("idle");
				}, timingConfig.promptCopyResetMs);
			} else if (result === "unavailable") {
				setCopyState("error");
			}
		});
	};

	return { copyState, copyPrompt, prompt, disabledReason };
}
