"use client";

import { ArrowLeft, ArrowRight, ListVideo } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/app/(protected)/_components/app-shell";
import { LessonShellWatch } from "@/app/(protected)/_components/course/lesson/shells/lesson-shell-watch";
import { Button } from "@/components/ui/button";
import {
	getNextLesson,
	getPreviousLesson,
	type LessonConfig,
} from "@/lib/course/lesson/model/manifest";
import {
	getTutorialsHref,
	getTutorialVideoHref,
} from "@/lib/course/lesson/routing/tutorial-routes";

function TutorialVideoFooter({ lesson }: { lesson: LessonConfig }) {
	const previousLesson = getPreviousLesson(lesson.lessonKey);
	const nextLesson = getNextLesson(lesson.lessonKey);

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<Button asChild variant="ghost" className="w-fit justify-start">
				<Link href={getTutorialsHref()}>
					<ListVideo className="size-4" aria-hidden />
					Tutorial Videos
				</Link>
			</Button>
			<div className="flex flex-wrap items-center gap-2">
				{previousLesson ? (
					<Button asChild variant="outline" className="w-fit">
						<Link href={getTutorialVideoHref(previousLesson.lessonKey)}>
							<ArrowLeft className="size-4" aria-hidden />
							Previous video
						</Link>
					</Button>
				) : null}
				{nextLesson ? (
					<Button asChild className="w-fit">
						<Link href={getTutorialVideoHref(nextLesson.lessonKey)}>
							Next video
							<ArrowRight className="size-4" aria-hidden />
						</Link>
					</Button>
				) : null}
			</div>
		</div>
	);
}

export function TutorialVideoPage({ lesson }: { lesson: LessonConfig }) {
	return (
		<AppShell viewportMode="app" appScrollMode="page" showSkillRail={false}>
			<LessonShellWatch
				lesson={lesson}
				coachContent={lesson.content.coach}
				footer={<TutorialVideoFooter lesson={lesson} />}
				pinnedArtifacts={[]}
			/>
		</AppShell>
	);
}
