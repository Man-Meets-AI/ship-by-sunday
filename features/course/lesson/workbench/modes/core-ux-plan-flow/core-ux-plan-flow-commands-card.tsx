"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { copyLessonTextToClipboard } from "@/features/course/lesson/lib/copy-course-prompt";

import {
	CORE_UX_PLAN_FALLBACK_PROMPT,
	CORE_UX_PLAN_PLANNING_TRIGGER,
} from "./core-ux-plan-flow-constants";

export function CoreUxPlanFlowCommandsCard() {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">
					Commands used in this lesson
				</CardTitle>
				<CardDescription>
					Trigger Codex planning mode from the keyboard, or paste the fallback
					prompt if the shortcut is not available.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableBody>
						<TableRow>
							<TableCell className="w-[min(11rem,32%)] align-top text-xs font-medium tracking-wide text-muted-foreground uppercase">
								Planning trigger
							</TableCell>
							<TableCell className="whitespace-normal">
								<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
									<p className="font-mono text-sm text-foreground">
										{CORE_UX_PLAN_PLANNING_TRIGGER}
									</p>
									<Button
										type="button"
										variant="secondary"
										size="sm"
										className="w-fit shrink-0"
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
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="align-top text-xs font-medium tracking-wide text-muted-foreground uppercase">
								Fallback prompt
							</TableCell>
							<TableCell className="whitespace-normal">
								<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
									<p className="min-w-0 flex-1 font-mono text-xs leading-relaxed text-foreground">
										{CORE_UX_PLAN_FALLBACK_PROMPT}
									</p>
									<Button
										type="button"
										variant="secondary"
										size="sm"
										className="w-fit shrink-0"
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
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
