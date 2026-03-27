import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	getLessonHref,
	getNextLesson,
	getPreviousLesson,
} from "@/features/course/lesson/model/manifest";

export function BonusLessonFooter({ lessonKey }: { lessonKey: string }) {
	const previousLesson = getPreviousLesson(lessonKey);
	const nextLesson = getNextLesson(lessonKey);

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<p className="text-sm leading-6 text-muted-foreground">
				Bonus progress updates when you open a lesson here.
			</p>
			<div className="flex flex-wrap gap-2 sm:justify-end">
				<Button asChild variant="link" className="h-auto min-h-0 p-0 text-sm">
					<Link href="/mission">Bonus library</Link>
				</Button>
				{previousLesson ? (
					<Button asChild variant="link" className="h-auto min-h-0 p-0 text-sm">
						<Link href={getLessonHref(previousLesson.lessonKey)}>
							{previousLesson.displayLabel}
						</Link>
					</Button>
				) : null}
				{nextLesson ? (
					<Button asChild variant="link" className="h-auto min-h-0 p-0 text-sm">
						<Link href={getLessonHref(nextLesson.lessonKey)}>
							{nextLesson.displayLabel}
						</Link>
					</Button>
				) : null}
			</div>
		</div>
	);
}
