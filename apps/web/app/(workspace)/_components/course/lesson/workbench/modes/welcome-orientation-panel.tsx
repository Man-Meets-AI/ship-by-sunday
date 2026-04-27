"use client";

import type { ReactNode } from "react";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { LessonContent } from "@/lib/course/lesson/model/manifest";

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
		<Card>
			<CardHeader>
				<CardTitle>Ship by Sunday</CardTitle>
				<CardDescription>{purpose}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<WelcomeOrientationProgram />
				<WelcomeOrientationTooling />
			</CardContent>
			{workbenchCompletionSlot ? (
				<CardFooter className="flex flex-wrap gap-2">
					{workbenchCompletionSlot}
				</CardFooter>
			) : null}
		</Card>
	);
}
