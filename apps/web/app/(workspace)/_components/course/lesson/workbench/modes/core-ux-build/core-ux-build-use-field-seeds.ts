"use client";

import { useEffect, useRef } from "react";

import {
	CORE_UX_BUILD_DEFAULT_CODEX_BRIEF,
	CORE_UX_BUILD_DEFAULT_STRATEGY_PROMPT,
	CORE_UX_BUILD_FIELD_IDS,
} from "@/lib/course/lesson/workbench/modes/core-ux-build/core-ux-build-constants";

type Args = {
	fieldValuesReady: boolean;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
};

export function useCoreUxBuildFieldSeeds({
	fieldValuesReady,
	fieldValues,
	onFieldChange,
}: Args) {
	const seededRef = useRef(false);

	useEffect(() => {
		if (!fieldValuesReady || seededRef.current) {
			return;
		}
		seededRef.current = true;
		const strategy = fieldValues[CORE_UX_BUILD_FIELD_IDS.strategyPrompt];
		if (
			strategy === undefined ||
			strategy === null ||
			(typeof strategy === "string" && !strategy.trim())
		) {
			onFieldChange(
				CORE_UX_BUILD_FIELD_IDS.strategyPrompt,
				CORE_UX_BUILD_DEFAULT_STRATEGY_PROMPT,
			);
		}
		const brief = fieldValues[CORE_UX_BUILD_FIELD_IDS.codexBrief];
		if (
			brief === undefined ||
			brief === null ||
			(typeof brief === "string" && !brief.trim())
		) {
			onFieldChange(
				CORE_UX_BUILD_FIELD_IDS.codexBrief,
				CORE_UX_BUILD_DEFAULT_CODEX_BRIEF,
			);
		}
	}, [fieldValuesReady, fieldValues, onFieldChange]);
}
