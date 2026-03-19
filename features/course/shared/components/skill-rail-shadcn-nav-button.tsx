"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SkillRailNavigationTarget } from "@/features/course/shared/utils/skill-rail-navigation";

export function SkillRailShadcnNavButton({
	direction,
	target,
	isCrossStage,
	onNavigate,
}: {
	direction: "previous" | "next";
	target: SkillRailNavigationTarget | null;
	isCrossStage: boolean;
	onNavigate: (href: string) => void;
}) {
	const shortcutKeys =
		direction === "previous" ? "ArrowLeft Q" : "ArrowRight E";
	const actionLabel =
		direction === "previous"
			? isCrossStage
				? "Previous stage"
				: "Previous"
			: isCrossStage
				? "Next stage"
				: "Next";
	const title = target
		? `Open ${direction} ${isCrossStage ? "stage" : "lesson"}${
				target.shortTitle ? `: ${target.shortTitle}` : ""
			}`
		: `No ${direction} lesson available`;

	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			disabled={!target}
			data-disabled={target ? "false" : "true"}
			data-href={target?.href}
			className="h-11 min-w-[104px] shrink-0 rounded-none border-0 border-border/80 border-r shadow-none"
			onClick={() => target && onNavigate(target.href)}
			title={title}
			aria-label={title}
			aria-keyshortcuts={shortcutKeys}
		>
			{direction === "previous" ? (
				<ChevronLeft className="size-4 shrink-0" aria-hidden />
			) : null}
			<span>{actionLabel}</span>
			{direction === "next" ? (
				<ChevronRight className="size-4 shrink-0" aria-hidden />
			) : null}
		</Button>
	);
}
