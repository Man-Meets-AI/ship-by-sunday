"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { routeConfig } from "@/config/product";
import { workspaceDisplayConfig } from "@/features/starter/lib/starter-selectors";

type LessonPageLockedCardProps = {
	lessonId: string;
	shortTitle: string;
	prevLessonId: string | null;
	onGoBack: () => void;
};

export function LessonPageLockedCard({
	lessonId,
	shortTitle,
	prevLessonId,
	onGoBack,
}: LessonPageLockedCardProps) {
	return (
		<Card className="mx-auto w-full max-w-2xl text-center">
			<CardHeader>
				<CardDescription>Lesson locked</CardDescription>
				<CardTitle className="text-2xl">
					{lessonId} {shortTitle}
				</CardTitle>
				<CardDescription className="text-pretty pt-2 text-base leading-relaxed">
					This lesson is locked. Go back to the{" "}
					{workspaceDisplayConfig.homeNoun} and finish{" "}
					{prevLessonId ?? "the previous unlocked lesson"} first.
				</CardDescription>
			</CardHeader>
			<CardFooter className="flex flex-wrap justify-center gap-3">
				<Button type="button" onClick={onGoBack} variant="secondary">
					Go back
				</Button>
				<Button asChild variant="default">
					<Link href={routeConfig.mission}>
						{workspaceDisplayConfig.openHomeActionLabel}
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
