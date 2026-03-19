"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import {
	getSkillRailNavigation,
	getSkillRailShortcutDirection,
	type SkillRailLesson,
	type SkillRailNavigationTarget,
	shouldHandleSkillRailShortcut,
} from "@/features/course/shared/utils/skill-rail-navigation";

function isCrossStageNavigationTarget(
	target: SkillRailNavigationTarget | null,
	lessons: SkillRailLesson[],
) {
	if (!target) {
		return false;
	}

	return !lessons.some((lesson) => lesson.id === target.id);
}

export function useSkillRailNavigation({
	lessons,
	navigationLessons,
	currentLessonId,
}: {
	lessons: SkillRailLesson[];
	navigationLessons?: SkillRailLesson[];
	currentLessonId?: string;
}) {
	const router = useRouter();
	const navigateToLesson = useCallback(
		(href: string) => {
			router.push(href, { scroll: false });
		},
		[router],
	);

	const showStageNavigation = Boolean(currentLessonId);
	const resolvedNavigationLessons = navigationLessons ?? lessons;
	const { previousTarget, nextTarget } = useMemo(
		() => getSkillRailNavigation(resolvedNavigationLessons, currentLessonId),
		[resolvedNavigationLessons, currentLessonId],
	);
	const previousIsCrossStage = isCrossStageNavigationTarget(
		previousTarget,
		lessons,
	);
	const nextIsCrossStage = isCrossStageNavigationTarget(nextTarget, lessons);

	useEffect(() => {
		if (!currentLessonId) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (!shouldHandleSkillRailShortcut(event)) {
				return;
			}

			const direction = getSkillRailShortcutDirection(event.key);
			const target =
				direction === "previous"
					? previousTarget
					: direction === "next"
						? nextTarget
						: null;

			if (!target) {
				return;
			}

			event.preventDefault();
			router.push(target.href, { scroll: false });
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [currentLessonId, nextTarget, previousTarget, router]);

	return {
		navigateToLesson,
		showStageNavigation,
		previousTarget,
		nextTarget,
		previousIsCrossStage,
		nextIsCrossStage,
	};
}
