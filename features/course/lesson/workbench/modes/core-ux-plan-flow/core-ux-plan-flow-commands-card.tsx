"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { copyLessonTextToClipboard } from "@/features/course/lesson/lib/copy-course-prompt";

import {
	CORE_UX_PLAN_FALLBACK_PROMPT,
	CORE_UX_PLAN_PLANNING_TRIGGER,
} from "./core-ux-plan-flow-constants";

export function CoreUxPlanFlowCommandsCard() {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Commands used in this lesson</CardTitle>
				<CardDescription>
					Trigger Codex planning mode from the keyboard, or paste the fallback
					prompt if the shortcut is not available.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-col gap-2 rounded-md border border-border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Planning trigger
						</p>
						<p className="font-mono text-sm text-foreground">
							{CORE_UX_PLAN_PLANNING_TRIGGER}
						</p>
					</div>
					<Button
						type="button"
						variant="secondary"
						size="sm"
						className="shrink-0"
						onClick={() =>
							void copyLessonTextToClipboard(
								CORE_UX_PLAN_PLANNING_TRIGGER,
								"Copied trigger",
							)
						}
					>
						Copy
					</Button>
				</div>
				<div className="flex flex-col gap-2 rounded-md border border-border bg-muted/20 p-3 sm:flex-row sm:items-start sm:justify-between">
					<div className="min-w-0 flex-1">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Fallback prompt
						</p>
						<p className="font-mono text-xs leading-relaxed text-foreground">
							{CORE_UX_PLAN_FALLBACK_PROMPT}
						</p>
					</div>
					<Button
						type="button"
						variant="secondary"
						size="sm"
						className="shrink-0"
						onClick={() =>
							void copyLessonTextToClipboard(
								CORE_UX_PLAN_FALLBACK_PROMPT,
								"Copied prompt",
							)
						}
					>
						Copy
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
