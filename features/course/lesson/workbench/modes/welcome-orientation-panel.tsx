"use client";

import type { ReactNode } from "react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { LessonContent } from "@/features/course/lesson/model/manifest";

import { WelcomeOrientationProgram } from "./welcome-orientation-program";
import { WelcomeOrientationTooling } from "./welcome-orientation-tooling";

export function WelcomeOrientationPanel({
	lessonContent,
	workbenchCompletionSlot,
}: {
	lessonContent: LessonContent;
	workbenchCompletionSlot?: ReactNode;
}) {
	const purpose =
		lessonContent.lessonMeta.purpose ??
		"Orient you to the sprint, the Product Trinity, and tooling—then lock a weekend-sized brief.";

	return (
		<div className="space-y-4">
			<Card className="gap-0 py-0">
				<CardHeader className="space-y-3 border-b border-border pb-4">
					<CardTitle className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
						Ship by Sunday
					</CardTitle>
					<CardDescription className="text-pretty text-sm leading-relaxed text-muted-foreground">
						{purpose}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6 pt-5">
					<WelcomeOrientationProgram />
					<WelcomeOrientationTooling />
					{workbenchCompletionSlot ? (
						<div className="flex flex-wrap gap-2 border-t border-border pt-4">
							{workbenchCompletionSlot}
						</div>
					) : null}
				</CardContent>
			</Card>
			<Separator className="bg-border" />
		</div>
	);
}
