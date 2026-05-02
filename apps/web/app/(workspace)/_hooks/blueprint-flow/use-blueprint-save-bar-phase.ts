"use client";

import { useEffect, useRef, useState } from "react";
import type { BlueprintStepInlineFeedback } from "@/lib/blueprint-flow/blueprint-step-save-feedback";

export type BlueprintSaveBarPhase = "idle" | "saving" | "redirecting";

const REDIRECT_PHASE_VISIBLE_MS = 1200;

export function useBlueprintSaveBarPhase({
	feedback,
	isSaving,
}: {
	feedback: BlueprintStepInlineFeedback | null;
	isSaving: boolean;
}): BlueprintSaveBarPhase {
	const [phase, setPhase] = useState<BlueprintSaveBarPhase>("idle");
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
