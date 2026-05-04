"use client";

import { useEffect, useRef, useState } from "react";
import type { CodebaseStepInlineFeedback } from "@/lib/codebase-flow/codebase-step-save-feedback";

export type CodebaseSaveBarPhase = "idle" | "saving" | "redirecting";

const REDIRECT_PHASE_VISIBLE_MS = 1200;

export function useCodebaseSaveBarPhase({
	feedback,
	isSaving,
}: {
	feedback: CodebaseStepInlineFeedback | null;
	isSaving: boolean;
}): CodebaseSaveBarPhase {
	const [phase, setPhase] = useState<CodebaseSaveBarPhase>("idle");
	const wasSavingRef = useRef(isSaving);

	useEffect(() => {
		const wasSaving = wasSavingRef.current;
		wasSavingRef.current = isSaving;

		if (isSaving) {
			setPhase("saving");
			return;
		}
		if (wasSaving && feedback?.tone === "success") {
			setPhase("redirecting");
			const timer = window.setTimeout(
				() => setPhase("idle"),
				REDIRECT_PHASE_VISIBLE_MS,
			);
			return () => window.clearTimeout(timer);
		}
		setPhase("idle");
	}, [isSaving, feedback]);

	return phase;
}
