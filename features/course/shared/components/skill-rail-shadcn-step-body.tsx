"use client";

import { Check, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { SkillRailStepState } from "./skill-rail-shared";

export function SkillRailShadcnStepBody({
	stepNumber,
	shortTitle,
	state,
}: {
	stepNumber: number;
	shortTitle: string;
	state: SkillRailStepState;
}) {
	return (
		<span className="flex min-w-0 max-w-full items-center gap-2">
			<Badge
				variant="outline"
				className={
					state === "done"
						? "size-6 shrink-0 justify-center rounded-full border-primary/35 bg-primary/8 px-0 py-0 tabular-nums text-foreground"
						: "size-6 shrink-0 justify-center rounded-full border px-0 py-0 tabular-nums"
				}
			>
				{stepNumber}
			</Badge>
			{state === "done" ? (
				<Check
					className="size-3.5 shrink-0 text-primary"
					strokeWidth={2.5}
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
