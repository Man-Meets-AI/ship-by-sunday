import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	getNextLesson,
	getPreviousLesson,
} from "@/lib/course/lesson/model/manifest";
import { getLessonHref } from "@/lib/course/lesson/routing/lesson-routes";
import { getLessonMapHref } from "@/lib/workspace-navigation/lesson-map-href";

export function BonusLessonFooter({
	lessonKey,
	onOpenLessonMap,
}: {
	lessonKey: string;
	onOpenLessonMap?: () => void;
}) {
	const previousLesson = getPreviousLesson(lessonKey);
	const nextLesson = getNextLesson(lessonKey);

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<p className="text-sm leading-6 text-muted-foreground">
				Bonus progress updates when you open a lesson here.
			</p>
			<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
				{previousLesson ? (
					<Button
						asChild
						variant="ghost"
						size="sm"
						data-testid="lesson-bonus-footer-previous"
						className="gap-1.5"
					>
						<Link href={getLessonHref(previousLesson.lessonKey)}>
							<ArrowLeft className="size-3.5" aria-hidden />
							<span>{previousLesson.displayLabel}</span>
						</Link>
					</Button>
				) : null}
				{onOpenLessonMap ? (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onOpenLessonMap}
						data-testid="lesson-bonus-footer-lesson-map"
					>
						Lesson Map
					</Button>
				) : (
					<Button
						asChild
						variant="outline"
						size="sm"
						data-testid="lesson-bonus-footer-lesson-map"
					>
						<Link href={getLessonMapHref()}>Lesson Map</Link>
					</Button>
				)}
				{nextLesson ? (
					<Button
						asChild
						variant="default"
						size="sm"
						data-testid="lesson-bonus-footer-next"
						className="gap-1.5"
					>
						<Link href={getLessonHref(nextLesson.lessonKey)}>
							<span>{nextLesson.displayLabel}</span>
							<ArrowRight className="size-3.5" aria-hidden />
						</Link>
					</Button>
				) : null}
			</div>
		</div>
	);
}
