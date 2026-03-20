import { SkillRailShadcn } from "@/features/course/shared/components/skill-rail-shadcn";
import type { SkillRailCompletionCue } from "@/features/course/shared/components/skill-rail";

type FooterLesson = {
	lessonKey: string;
	id: string;
	displayLabel: string;
	title: string;
	shortTitle: string;
	status: "available" | "completed" | "in_progress" | "locked";
	artifactLabel: string;
	isImplemented: boolean;
};

type AppShellFooterRailProps = {
	viewportMode: "document" | "app";
	activeBlock: {
		label: string;
		lessons: FooterLesson[];
	};
	navigationLessons: FooterLesson[] | undefined;
	currentLessonId: string | undefined;
	completionCue: SkillRailCompletionCue | null | undefined;
};

export function AppShellFooterRail({
	viewportMode,
	activeBlock,
	navigationLessons,
	currentLessonId,
	completionCue,
}: AppShellFooterRailProps) {
	return (
		<footer className="shrink-0 border-t bg-background/95 backdrop-blur">
			<div
				className={
					viewportMode === "app"
						? "mx-auto w-full max-w-[1920px] px-2 py-1.5 sm:px-3 sm:py-2"
						: "flex justify-center px-3 py-2"
				}
			>
				<SkillRailShadcn
					label={activeBlock.label}
					lessons={activeBlock.lessons}
					navigationLessons={navigationLessons}
					currentLessonId={currentLessonId}
					completionCue={completionCue}
				/>
			</div>
		</footer>
	);
}
