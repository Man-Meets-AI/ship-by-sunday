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

export function useLessonState({ lessonId }: { lessonId: string }) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const lessonState = useQuery(
		api.course.getLessonState,
		isAuthenticated && !isLoading ? { lessonId } : "skip",
	) as LessonState;
	const unlockedLessonState =
		lessonState?.accessStatus === "unlocked" ? lessonState : null;
	const markLessonViewed = useMutation(api.course.markLessonViewed);
	const saveLessonDraft = useMutation(api.course.saveLessonDraft);
	const [fieldValues, setFieldValues] = useState<PersistedFieldValues>({});
	const [fieldValuesReady, setFieldValuesReady] = useState(false);
	const [saveStatus, setSaveStatus] = useState<LessonSaveStatus>("idle");
	const initializedForLessonId = useRef<string | null>(null);
	const lastMarkedLessonId = useRef<string | null>(null);
	const lastSavedSnapshot = useRef("");

	useEffect(() => {
		initializedForLessonId.current = null;
		lastSavedSnapshot.current = "";
		setFieldValues({});
		setFieldValuesReady(false);
		setSaveStatus("idle");
	}, [lessonId]);

	useEffect(() => {
		if (!unlockedLessonState) {
			setFieldValuesReady(false);
			return;
		}

		if (initializedForLessonId.current !== lessonId) {
			const nextValues = unlockedLessonState.fieldValues;
			setFieldValues(nextValues);
			initializedForLessonId.current = lessonId;
			lastSavedSnapshot.current = JSON.stringify(nextValues);
			setSaveStatus("idle");
			setFieldValuesReady(true);
			return;
		}

		setFieldValuesReady(true);
	}, [lessonId, unlockedLessonState]);

	useEffect(() => {
		if (
			!unlockedLessonState ||
			!fieldValuesReady ||
			initializedForLessonId.current !== lessonId
		) {
			return;
		}

		const snapshot = JSON.stringify(fieldValues);
		if (snapshot === lastSavedSnapshot.current) {
			return;
		}

		const timeout = window.setTimeout(() => {
			setSaveStatus("saving");
			void saveLessonDraft({ lessonId, fieldValues }).then(
				() => {
					lastSavedSnapshot.current = JSON.stringify(fieldValues);
					setSaveStatus("saved");
				},
				() => {
					setSaveStatus("error");
				},
			);
		}, timingConfig.lessonAutosaveDebounceMs);

		return () => window.clearTimeout(timeout);
	}, [
		fieldValues,
		fieldValuesReady,
		lessonId,
		unlockedLessonState,
		saveLessonDraft,
	]);

	useEffect(() => {
		if (!unlockedLessonState) {
			return;
		}

		if (lastMarkedLessonId.current === lessonId) {
			return;
		}

		lastMarkedLessonId.current = lessonId;
		void markLessonViewed({ lessonId });
	}, [lessonId, unlockedLessonState, markLessonViewed]);

	return {
		lessonState,
		fieldValues,
		fieldValuesReady,
		saveStatus,
		setFieldValue: (fieldId: string, value: unknown) => {
			setFieldValues((current) => ({
				...current,
				[fieldId]: value as PersistedFieldValue,
			}));
		},
		setSaveStatusError: () => {
			setSaveStatus("error");
		},
	};
}
