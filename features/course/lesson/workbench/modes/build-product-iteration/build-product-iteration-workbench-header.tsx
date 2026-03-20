import { Badge } from "@/components/ui/badge";
import type {
	LessonConfig,
	LessonContent,
} from "@/features/course/lesson/model/manifest";

function renderLessonTitle(title: string) {
	const protectedPhrase = "Ship by Sunday";
	const phraseStart = title.indexOf(protectedPhrase);

	if (phraseStart === -1) {
		return title;
	}

	const before = title.slice(0, phraseStart);
	const after = title.slice(phraseStart + protectedPhrase.length);

	return (
		<>
			{before}
			<span className="whitespace-nowrap">{protectedPhrase}</span>
			{after}
		</>
	);
}

export function BuildProductIterationWorkbenchHeader({
	lesson,
	lessonContent,
}: {
	lesson: LessonConfig;
	lessonContent: LessonContent;
}) {
	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center gap-2 text-muted-foreground">
				<Badge variant="secondary" className="text-xs font-medium">
					{lesson.id}
				</Badge>
				<Badge variant="outline" className="text-xs font-medium">
					{lesson.artifact.label}
				</Badge>
				{lessonContent.lessonMeta.runtimeLabel ? (
					<span className="text-xs font-medium text-muted-foreground">
						{lessonContent.lessonMeta.runtimeLabel}
					</span>
				) : null}
			</div>
			<h1 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">
				{renderLessonTitle(lesson.title)}
			</h1>
			<p className="max-w-prose pt-0.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
				{lessonContent.intro}
			</p>
		</div>
	);
}
