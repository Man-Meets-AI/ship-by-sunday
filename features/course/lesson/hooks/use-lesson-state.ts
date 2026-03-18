"use client";

import { useEffect, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import { timingConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import type { PinnedArtifact } from "@/features/course/lesson/shells";
import type {
	PersistedFieldValue,
	PersistedFieldValues,
} from "@/features/course/lesson/model/registry";

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
	const markLessonViewed = useMutation(api.course.markLessonViewed);
	const saveLessonDraft = useMutation(api.course.saveLessonDraft);
	const [fieldValues, setFieldValues] = useState<PersistedFieldValues>({});
	const [fieldValuesReady, setFieldValuesReady] = useState(false);
	const [saveStatus, setSaveStatus] = useState<LessonSaveStatus>("idle");
	const initializedForLessonId = useRef<string | null>(null);
	const lastMarkedLessonId = useRef<string | null>(null);
	const lastSavedSnapshot = useRef("");

	useEffect(() => {
		setFieldValuesReady(false);
	}, [lessonId]);

	useEffect(() => {
		if (!lessonState || lessonState.accessStatus !== "unlocked") {
			setFieldValuesReady(false);
			return;
		}

		if (initializedForLessonId.current !== lessonId) {
			const nextValues = lessonState.fieldValues ?? {};
			setFieldValues(nextValues);
			initializedForLessonId.current = lessonId;
			lastSavedSnapshot.current = JSON.stringify(nextValues);
			setSaveStatus("idle");
			setFieldValuesReady(true);
			return;
		}

		setFieldValuesReady(true);
	}, [lessonId, lessonState]);

	useEffect(() => {
		if (
			!lessonState ||
			lessonState.accessStatus !== "unlocked" ||
			initializedForLessonId.current !== lessonId
		) {
			return;
		}

		const snapshot = JSON.stringify(fieldValues);
		if (snapshot === lastSavedSnapshot.current) {
			return;
		}

		setSaveStatus("saving");
		const timeout = window.setTimeout(() => {
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
	}, [fieldValues, lessonId, lessonState, saveLessonDraft]);

	useEffect(() => {
		if (!lessonState || lessonState.accessStatus !== "unlocked") {
			return;
		}

		if (lastMarkedLessonId.current === lessonId) {
			return;
		}

		lastMarkedLessonId.current = lessonId;
		void markLessonViewed({ lessonId });
	}, [lessonId, lessonState, markLessonViewed]);

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
