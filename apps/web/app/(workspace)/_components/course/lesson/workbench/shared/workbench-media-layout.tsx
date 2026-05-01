import type { ReactNode } from "react";
import type {
	LessonConfig,
	LessonLayoutMode,
} from "@/lib/course/lesson/model/manifest";

type WorkbenchMediaLesson = Pick<
	LessonConfig,
	"coachVideoPlacement" | "workbenchMediaLayout"
>;

export function WorkbenchMediaLayout({
	media,
	children,
}: {
	media: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(300px,0.88fr)_minmax(0,1.12fr)] xl:items-start">
			<div className="min-w-0 xl:sticky xl:top-0 xl:z-1 xl:self-start">
				{media}
			</div>
			<div className="min-w-0">{children}</div>
		</div>
	);
}

function shouldShowWorkbenchMedia(lesson: WorkbenchMediaLesson) {
	return lesson.coachVideoPlacement === "workbench";
}

function shouldUseSplitWorkbenchMedia(
	lesson: WorkbenchMediaLesson,
	layoutMode: LessonLayoutMode,
) {
	return (
		shouldShowWorkbenchMedia(lesson) &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus"
	);
}

export function WorkbenchMediaPlacement({
	lesson,
	layoutMode,
	media,
	children,
}: {
	lesson: WorkbenchMediaLesson;
	layoutMode: LessonLayoutMode;
	media: ReactNode;
	children: ReactNode;
}) {
	if (shouldUseSplitWorkbenchMedia(lesson, layoutMode)) {
		return (
			<WorkbenchMediaLayout media={media}>{children}</WorkbenchMediaLayout>
		);
	}

	if (shouldShowWorkbenchMedia(lesson)) {
		return (
			<>
				{media}
				{children}
			</>
		);
	}

	return <>{children}</>;
}
