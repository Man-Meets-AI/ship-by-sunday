"use client";

import { LessonVideoSurface } from "@/app/(app)/_components/course/lesson/components/lesson-video-surface";
import {
	ProtectedRouteDescription,
	ProtectedRouteEyebrow,
	ProtectedRouteHeader,
	ProtectedRouteTitle,
} from "@/components/app/protected-route-surface";
import type {
	LessonPromptResourceContent,
	LessonResourceContent,
} from "@/lib/course/lesson/model/contracts";
import type {
	LessonConfig,
	LessonContent,
} from "@/lib/course/lesson/model/manifest";

import { LessonWatchSecondaryContent } from "./lesson-watch-secondary-content";
import type { PinnedArtifact } from "./types";

const shellEyebrowSeparatorClass = "text-muted-foreground/40";

export function LessonShellWatch({
	lesson,
	coachContent,
	footer,
	pinnedArtifacts,
}: {
	lesson: LessonConfig;
	coachContent: LessonContent["coach"];
	footer: React.ReactNode;
	pinnedArtifacts: PinnedArtifact[];
}) {
	const copyPromptCards = (coachContent.resources ?? []).filter(
		(r): r is LessonPromptResourceContent => r.kind === "copy_prompt",
	);
	const helpfulLinks = (coachContent.resources ?? []).filter(
		(
			resource,
		): resource is Exclude<LessonResourceContent, { kind: "copy_prompt" }> =>
			resource.kind !== "copy_prompt",
	);

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="min-w-0 px-4 py-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:px-6 xl:py-8">
				<div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
					<ProtectedRouteHeader>
						<ProtectedRouteEyebrow className="flex flex-wrap items-center gap-2">
							<span className="text-foreground/80">{lesson.id}</span>
							<span className={shellEyebrowSeparatorClass} aria-hidden>
								•
							</span>
							<span>{lesson.artifact.label}</span>
							{lesson.content.lessonMeta.runtimeLabel ? (
								<>
									<span className={shellEyebrowSeparatorClass} aria-hidden>
										•
									</span>
									<span>{lesson.content.lessonMeta.runtimeLabel}</span>
								</>
							) : null}
						</ProtectedRouteEyebrow>
						<ProtectedRouteTitle className="max-w-4xl text-balance">
							{lesson.title}
						</ProtectedRouteTitle>
						<ProtectedRouteDescription className="max-w-[64ch] text-base leading-7">
							{lesson.content.intro}
						</ProtectedRouteDescription>
					</ProtectedRouteHeader>
					<div className="space-y-8">
						<LessonVideoSurface
							coachContent={coachContent}
							variant="watch-shell"
							playerFrame="bare"
							className="max-w-none"
						/>
						<LessonWatchSecondaryContent
							copyPromptCards={copyPromptCards}
							transcript={coachContent.transcript}
							helpfulLinks={helpfulLinks}
							pinnedArtifacts={pinnedArtifacts}
						/>
					</div>
				</div>
			</div>
			<div className="shrink-0 border-t border-border/60 bg-muted/20 px-4 py-4 xl:px-6">
				<div className="mx-auto w-full max-w-5xl">{footer}</div>
			</div>
		</div>
	);
}
