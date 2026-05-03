"use client";

import { Check, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

import type { SkillRailStepState } from "./skill-rail-shared";

export function SkillRailShadcnStepBody({
	displayLabel,
	shortTitle,
	state,
}: {
	displayLabel: string;
	shortTitle: string;
	state: SkillRailStepState;
}) {
	return (
		<span className="flex min-w-0 max-w-full items-center gap-1.5 sm:gap-2">
			<span
				className={cn(
					"flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold font-number sm:size-6 sm:text-[11px]",
					state === "done"
						? "border-primary/35 bg-primary/8 text-foreground"
						: "border-border text-muted-foreground",
				)}
			>
				{displayLabel}
			</span>
			{state === "done" ? (
				<Check
					className="size-3 shrink-0 text-primary sm:size-3.5"
					strokeWidth={3}
					aria-hidden
				/>
			) : null}
			{state === "locked" ? (
				<Lock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
			) : null}
			<span className="truncate text-left text-sm font-medium">
				{shortTitle}
			</span>
		</span>
	);
}
