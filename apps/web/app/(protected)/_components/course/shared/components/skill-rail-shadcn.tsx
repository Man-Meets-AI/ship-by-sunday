"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSkillRailNavigation } from "@/app/(protected)/_hooks/course/shared/use-skill-rail-navigation";
import type { SkillRailLesson } from "@/lib/course/shared/utils/skill-rail-navigation";

import { SkillRailShadcnNavButton } from "./skill-rail-shadcn-nav-button";
import { SkillRailShadcnStep } from "./skill-rail-shadcn-step";
import {
	getSkillRailStepState,
	type SkillRailCompletionCue,
} from "./skill-rail-shared";

export function SkillRailShadcn({
	label,
	lessons,
	navigationLessons,
	currentLessonId,
	completionCue,
}: {
	label: string;
	lessons: SkillRailLesson[];
	navigationLessons?: SkillRailLesson[];
	currentLessonId?: string;
	completionCue?: SkillRailCompletionCue | null;
}) {
	const {
		navigateToLesson,
		showStageNavigation,
		previousTarget,
		nextTarget,
		previousIsCrossStage,
		nextIsCrossStage,
	} = useSkillRailNavigation({
		lessons,
		navigationLessons,
		currentLessonId,
	});

	return (
		<Card
			className="flex w-full min-w-0 flex-row items-stretch gap-0 overflow-hidden rounded-lg border py-0 shadow-none ring-1 ring-border"
			role="navigation"
			aria-label={`${label} lesson navigation`}
		>
			{showStageNavigation ? (
				<>
					<SkillRailShadcnNavButton
						direction="previous"
						target={previousTarget}
						isCrossStage={previousIsCrossStage}
						onNavigate={navigateToLesson}
					/>
					<Separator orientation="vertical" decorative />
				</>
			) : null}
			<div className="flex min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				<div className="flex min-w-max flex-1">
					{lessons.map((lesson) => {
						const isCurrent = lesson.lessonKey === currentLessonId;
						const state = getSkillRailStepState(lesson, currentLessonId);
						const isCompleting =
							completionCue?.completedLessonId === lesson.lessonKey;
						const isUnlocking =
							completionCue?.nextLessonId === lesson.lessonKey;

						return (
							<SkillRailShadcnStep
								key={lesson.lessonKey}
								lesson={lesson}
								state={state}
								isCurrent={isCurrent}
								isCompleting={isCompleting}
								isUnlocking={isUnlocking}
								onNavigate={navigateToLesson}
							/>
						);
					})}
				</div>
			</div>
			{showStageNavigation ? (
				<>
					<Separator orientation="vertical" decorative />
					<SkillRailShadcnNavButton
						direction="next"
						target={nextTarget}
						isCrossStage={nextIsCrossStage}
						onNavigate={navigateToLesson}
					/>
				</>
			) : null}
		</Card>
	);
}
