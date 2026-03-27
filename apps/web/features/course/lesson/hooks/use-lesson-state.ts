"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";

import { timingConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import type {
	PersistedFieldValue,
	PersistedFieldValues,
} from "@/features/course/lesson/model/registry";
import type { PinnedArtifact } from "@/features/course/lesson/shells";
import { useAutosave } from "@/features/shared/hooks/use-autosave";

type UnlockedLessonState = {
	accessStatus: "unlocked";
	fieldValues: PersistedFieldValues;
	status: string;
	pinnedArtifacts: PinnedArtifact[];
};

type LockedLessonState = {
	accessStatus: "locked";
};

type LessonState = UnlockedLessonState | LockedLessonState | undefined;

export type LessonSaveStatus = "idle" | "saved" | "saving" | "error";

function fieldValueMatches(
	left: PersistedFieldValue | undefined,
	right: PersistedFieldValue | undefined,
) {
	return JSON.stringify(left) === JSON.stringify(right);
}

function omitPendingFieldValue(
	pendingFieldValues: PersistedFieldValues,
	fieldId: string,
) {
	if (!(fieldId in pendingFieldValues)) {
		return pendingFieldValues;
	}

	const { [fieldId]: _removedFieldValue, ...remainingPendingFieldValues } =
		pendingFieldValues;
	return remainingPendingFieldValues;
}

function acknowledgeSavedFieldValues(
	pendingFieldValues: PersistedFieldValues,
	savedFieldValues: PersistedFieldValues,
) {
	return Object.fromEntries(
		Object.entries(pendingFieldValues).filter(
			([fieldId, value]) =>
				!fieldValueMatches(value, savedFieldValues[fieldId]),
		),
	) as PersistedFieldValues;
}

export function useLessonState({ lessonKey }: { lessonKey: string }) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const lessonState = useQuery(
		api.course.getLessonState,
		isAuthenticated && !isLoading ? { lessonKey } : "skip",
	) as LessonState;
	const unlockedLessonState =
		lessonState?.accessStatus === "unlocked" ? lessonState : null;
	const markLessonViewed = useMutation(api.course.markLessonViewed);
	const saveLessonDraft = useMutation(
		api.course.saveLessonDraft,
	).withOptimisticUpdate((localStore, args) => {
		const currentLessonState = localStore.getQuery(api.course.getLessonState, {
			lessonKey: args.lessonKey,
		});

		if (!currentLessonState || currentLessonState.accessStatus !== "unlocked") {
			return;
		}

		localStore.setQuery(
			api.course.getLessonState,
			{ lessonKey: args.lessonKey },
			{
				...currentLessonState,
				fieldValues: args.fieldValues,
				status:
					currentLessonState.status === "completed"
						? "completed"
						: "in_progress",
			},
		);
	});
	const [pendingFieldValues, setPendingFieldValues] =
		useState<PersistedFieldValues>({});
	const [saveStatus, setSaveStatus] = useState<LessonSaveStatus>("idle");
	const lastMarkedLessonKey = useRef<string | null>(null);
	const activeLessonKeyRef = useRef(lessonKey);
	const pendingFieldValuesRef = useRef<PersistedFieldValues>({});

	pendingFieldValuesRef.current = pendingFieldValues;

	const persistedFieldValues = unlockedLessonState?.fieldValues ?? {};
	const fieldValues = {
		...persistedFieldValues,
		...pendingFieldValues,
	};
	const fieldValuesReady = Boolean(unlockedLessonState);

	useEffect(() => {
		activeLessonKeyRef.current = lessonKey;
		setPendingFieldValues({});
		setSaveStatus("idle");
	}, [lessonKey]);

	const shouldAutosaveLessonDraft =
		fieldValuesReady &&
		Object.keys(pendingFieldValues).length > 0 &&
		saveStatus === "idle";

	useAutosave({
		shouldAutosave: shouldAutosaveLessonDraft,
		delayMs: timingConfig.lessonAutosaveDebounceMs,
		onAutosave: () => {
			if (!unlockedLessonState) {
				return;
			}

			const draftFieldValues = fieldValues;
			const autosavedLessonKey = lessonKey;

			setSaveStatus("saving");
			void saveLessonDraft({
				lessonKey: autosavedLessonKey,
				fieldValues: draftFieldValues,
			}).then(
				() => {
					if (activeLessonKeyRef.current !== autosavedLessonKey) {
						return;
					}

					const nextPendingFieldValues = acknowledgeSavedFieldValues(
						pendingFieldValuesRef.current,
						draftFieldValues,
					);

					pendingFieldValuesRef.current = nextPendingFieldValues;
					setPendingFieldValues(nextPendingFieldValues);
					setSaveStatus(
						Object.keys(nextPendingFieldValues).length === 0 ? "saved" : "idle",
					);
				},
				() => {
					if (activeLessonKeyRef.current !== autosavedLessonKey) {
						return;
					}

					setSaveStatus("error");
				},
			);
		},
	});

	useEffect(() => {
		if (!unlockedLessonState) {
			return;
		}

		if (lastMarkedLessonKey.current === lessonKey) {
			return;
		}

		lastMarkedLessonKey.current = lessonKey;
		void markLessonViewed({ lessonKey });
	}, [lessonKey, unlockedLessonState, markLessonViewed]);

	return {
		lessonState,
		fieldValues,
		fieldValuesReady,
		saveStatus,
		setFieldValue: (fieldId: string, value: unknown) => {
			const nextFieldValue = value as PersistedFieldValue;

			setPendingFieldValues((currentPendingFieldValues) =>
				fieldValueMatches(persistedFieldValues[fieldId], nextFieldValue)
					? omitPendingFieldValue(currentPendingFieldValues, fieldId)
					: {
							...currentPendingFieldValues,
							[fieldId]: nextFieldValue,
						},
			);
			setSaveStatus((currentSaveStatus) =>
				currentSaveStatus === "saving" ? currentSaveStatus : "idle",
			);
		},
		setSaveStatusError: () => {
			setSaveStatus("error");
		},
	};
}
