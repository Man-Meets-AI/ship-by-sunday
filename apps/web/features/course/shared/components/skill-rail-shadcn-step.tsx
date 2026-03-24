"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLessonHref } from "@/features/course/lesson/model/manifest";
import type { SkillRailLesson } from "@/features/course/shared/utils/skill-rail-navigation";

import {
	getSkillRailStepAriaLabel,
	SKILL_RAIL_LOCKED_REASON,
	type SkillRailStepState,
} from "./skill-rail-shared";
import { SkillRailShadcnStepBody } from "./skill-rail-shadcn-step-body";

export function SkillRailShadcnStep({
	lesson,
	state,
	isCompleting,
	isUnlocking,
	isCurrent,
	stepNumber,
	totalSteps,
	onNavigate,
}: {
	lesson: SkillRailLesson;
	state: SkillRailStepState;
	isCompleting: boolean;
	isUnlocking: boolean;
	isCurrent: boolean;
	stepNumber: number;
	totalSteps: number;
	onNavigate: (href: string) => void;
}) {
	const label = getSkillRailStepAriaLabel(lesson, state);
	const lessonHref = getLessonHref(lesson.lessonKey);

	let variant: ComponentProps<typeof Button>["variant"] = "ghost";
	if (isUnlocking) {
		variant = "secondary";
	} else if (isCompleting) {
		variant = "default";
	} else if (state === "current") {
		variant = "secondary";
	} else if (state === "done") {
		variant = "outline";
	}

	const baseStep =
		"h-auto min-h-11 min-w-0 flex-1 rounded-none border-x-0 border-t-0 border-r border-border/80 px-3 py-1 shadow-none";
	const className = cn(
		baseStep,
		state === "current" || isCompleting
			? "border-b-2 border-b-primary"
			: "border-b-0",
		isCompleting &&
			!isUnlocking &&
			"bg-primary/10 text-primary hover:bg-primary/15",
	);

	if (state === "locked") {
		return (
			<Button
				type="button"
				variant="ghost"
				disabled
				className="h-auto min-h-11 min-w-0 flex-1 cursor-not-allowed rounded-none border-0 border-border/80 border-r px-3 py-1 opacity-70 shadow-none"
				aria-label={label}
				title={SKILL_RAIL_LOCKED_REASON}
				onClick={(e) => e.preventDefault()}
			>
				<SkillRailShadcnStepBody
					displayLabel={lesson.displayLabel}
					shortTitle={lesson.shortTitle}
					state={state}
				/>
			</Button>
		);
	}

	return (
		<Button
			type="button"
			variant={variant}
			className={className}
			aria-label={label}
			aria-current={isCurrent ? "step" : undefined}
			data-href={lessonHref}
			onClick={() => onNavigate(lessonHref)}
		>
			<SkillRailShadcnStepBody
				displayLabel={lesson.displayLabel}
				shortTitle={lesson.shortTitle}
				state={state}
			/>
		</Button>
	);
}
