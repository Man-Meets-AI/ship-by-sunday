"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LessonVideoSurface } from "@/app/(workspace)/_components/course/lesson/components/lesson-video-surface";
import type {
	LessonPromptResourceContent,
	LessonResourceContent,
} from "@/lib/course/lesson/model/contracts";
import type {
	LessonConfig,
	LessonContent,
} from "@/lib/course/lesson/model/manifest";
import type { ObjectiveTask } from "@/lib/course/lesson/model/registry";

import { CoachPanel } from "./coach-panel";
import { CopyPromptResourceCard } from "./copy-prompt-resource-card";
import { ObjectivePanel } from "./objective-panel";
import type { CoachPanelKey, PinnedArtifact } from "./types";

export type { CoachPanelKey, PinnedArtifact } from "./types";

const shellEyebrowClass = "text-xs font-medium text-muted-foreground";

const shellPanelCardClass = "min-w-0 gap-0 py-0 xl:flex xl:min-h-0 xl:flex-col";

type BaseLessonShellProps = {
	lesson: LessonConfig;
	coachContent: LessonContent["coach"];
	children: React.ReactNode;
	footer: React.ReactNode;
};

type SplitLessonShellProps = BaseLessonShellProps & {
	objectiveTasks: ObjectiveTask[];
	onObjectiveTaskToggle: (taskId: string, checked: boolean) => void;
	activeCoachPanel: CoachPanelKey;
	onCoachPanelChange: (panel: CoachPanelKey) => void;
	pinnedArtifacts: PinnedArtifact[];
};

type WatchLessonShellProps = {
	lesson: LessonConfig;
	coachContent: LessonContent["coach"];
	footer: React.ReactNode;
	pinnedArtifacts: PinnedArtifact[];
};

export function LessonShellSplit({
	lesson,
	objectiveTasks,
	onObjectiveTaskToggle,
	activeCoachPanel,
	onCoachPanelChange,
	pinnedArtifacts,
	coachContent,
	children,
	footer,
}: SplitLessonShellProps) {
	return (
		<div className="grid gap-3 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,270px)_minmax(0,1fr)_minmax(280px,320px)]">
			<ObjectivePanel
				lesson={lesson}
				objectiveTasks={objectiveTasks}
				onObjectiveTaskToggle={onObjectiveTaskToggle}
			/>
			<WorkbenchPanel footer={footer}>{children}</WorkbenchPanel>
			<CoachPanel
				lesson={lesson}
				coachContent={coachContent}
				activePanel={activeCoachPanel}
				onPanelChange={onCoachPanelChange}
				pinnedArtifacts={pinnedArtifacts}
			/>
		</div>
	);
}

export function LessonShellFocus({ children, footer }: BaseLessonShellProps) {
	return <WorkbenchPanel footer={footer}>{children}</WorkbenchPanel>;
}

export function LessonShellWatch({
	lesson,
	coachContent,
	footer,
	pinnedArtifacts,
}: WatchLessonShellProps) {
	const copyPromptCards = (coachContent.resources ?? []).filter(
		(r): r is LessonPromptResourceContent => r.kind === "copy_prompt",
	);
	const helpfulLinks = (coachContent.resources ?? []).filter(
		(
			resource,
		): resource is Exclude<LessonResourceContent, { kind: "copy_prompt" }> =>
			resource.kind !== "copy_prompt",
	);
	const hasWatchSecondaryContent =
		copyPromptCards.length > 0 ||
		(coachContent.transcript?.status === "ready" &&
			Boolean(coachContent.transcript.body)) ||
		helpfulLinks.length > 0;

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="min-w-0 px-4 py-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:px-6 xl:py-8">
				<div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
					<div className="space-y-4">
						<div className={cn(shellEyebrowClass, "flex items-center gap-2")}>
							<span className="font-semibold text-foreground/80">
								{lesson.id}
							</span>
							<span>•</span>
							<span>{lesson.artifact.label}</span>
							{lesson.content.lessonMeta.runtimeLabel ? (
								<>
									<span>•</span>
									<span>{lesson.content.lessonMeta.runtimeLabel}</span>
								</>
							) : null}
						</div>
						<div className="space-y-3">
							<h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
								{lesson.title}
							</h1>
							<p className="max-w-[64ch] text-base leading-8 text-muted-foreground sm:text-lg">
								{lesson.content.intro}
							</p>
						</div>
					</div>
					<div className="space-y-8">
						<LessonVideoSurface
							coachContent={coachContent}
							variant="watch-shell"
							playerFrame="bare"
							className="max-w-none"
						/>
						{hasWatchSecondaryContent ? (
							<>
								{copyPromptCards.length > 0 ? (
									<div className="space-y-3">
										{copyPromptCards.map((resource) => (
											<CopyPromptResourceCard
												key={resource.id}
												resource={resource}
												pinnedArtifacts={pinnedArtifacts}
											/>
										))}
									</div>
								) : null}
								{coachContent.transcript?.status === "ready" &&
								coachContent.transcript.body ? (
									<section className="space-y-3">
										<Separator />
										<h2 className={shellEyebrowClass}>Transcript</h2>
										<p className="max-w-[64ch] whitespace-pre-wrap text-sm leading-7 text-foreground">
											{coachContent.transcript.body}
										</p>
									</section>
								) : null}
								{helpfulLinks.length > 0 ? (
									<section className="space-y-3">
										<Separator />
										<h2 className={shellEyebrowClass}>Helpful links</h2>
										<div className="grid gap-3 sm:grid-cols-2">
											{helpfulLinks.map((resource) => (
												<Button
													key={resource.id}
													asChild
													variant="outline"
													className="h-auto min-h-0 justify-start px-4 py-3 text-left font-medium whitespace-normal"
												>
													<Link
														href={resource.href}
														target={
															resource.kind === "external"
																? "_blank"
																: undefined
														}
													>
														{resource.label}
													</Link>
												</Button>
											))}
										</div>
									</section>
								) : null}
							</>
						) : null}
					</div>
				</div>
			</div>
			<div className="shrink-0 border-t border-border/60 bg-muted/20 px-4 py-4 xl:px-6">
				<div className="mx-auto w-full max-w-5xl">{footer}</div>
			</div>
		</div>
	);
}

function WorkbenchPanel({
	children,
	footer,
}: {
	children: React.ReactNode;
	footer: React.ReactNode;
}) {
	return (
		<Card className={shellPanelCardClass}>
			<div className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-2 backdrop-blur">
				<CardTitle className={shellEyebrowClass}>Workbench</CardTitle>
			</div>
			<div className="min-w-0 px-4 py-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto sm:px-5">
				{children}
			</div>
			<div className="shrink-0 border-t border-border/60 bg-muted/30 px-4 py-3 sm:px-5">
				{footer}
			</div>
		</Card>
	);
}
