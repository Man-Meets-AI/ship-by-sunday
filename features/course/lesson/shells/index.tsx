"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LessonVideoSurface } from "@/features/course/lesson/components/lesson-video-surface";
import type {
	LessonPromptResourceContent,
	LessonResourceContent,
} from "@/features/course/lesson/model/contracts";
import type {
	LessonConfig,
	LessonContent,
} from "@/features/course/lesson/model/manifest";
import type { ObjectiveTask } from "@/features/course/lesson/model/registry";

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
	const copyPromptResources = (coachContent.resources ?? []).filter(
		(r): r is LessonPromptResourceContent => r.kind === "copy_prompt",
	);
	const resourceLinks = (coachContent.resources ?? []).filter(
		(
			resource,
		): resource is Exclude<LessonResourceContent, { kind: "copy_prompt" }> =>
			resource.kind !== "copy_prompt",
	);

	return (
		<Card className={cn(shellPanelCardClass, "xl:h-full")}>
			<div className="min-w-0 px-4 py-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:px-6 xl:py-6">
				<div className="flex w-full flex-col gap-5">
					<div className="space-y-3 border-b border-border/60 pb-4">
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="secondary">{lesson.id}</Badge>
							<Badge variant="outline">{lesson.artifact.label}</Badge>
							{lesson.content.lessonMeta.runtimeLabel ? (
								<span className={shellEyebrowClass}>
									{lesson.content.lessonMeta.runtimeLabel}
								</span>
							) : null}
						</div>
						<div className="space-y-2">
							<h1 className="max-w-4xl text-balance text-3xl font-semibold text-foreground sm:text-4xl">
								{lesson.title}
							</h1>
							<p className="max-w-[64ch] text-sm leading-7 text-muted-foreground sm:text-base">
								{lesson.content.intro}
							</p>
						</div>
					</div>
					<LessonVideoSurface
						coachContent={coachContent}
						variant="watch-shell"
					/>
					{copyPromptResources.length > 0 ? (
						<div className="space-y-3">
							{copyPromptResources.map((resource) => (
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
						<>
							<Separator />
							<section className="space-y-3">
								<h2 className={shellEyebrowClass}>Transcript</h2>
								<p className="max-w-[64ch] whitespace-pre-wrap text-sm leading-7 text-foreground">
									{coachContent.transcript.body}
								</p>
							</section>
						</>
					) : null}
					{resourceLinks.length > 0 ? (
						<>
							<Separator />
							<section className="space-y-3">
								<h2 className={shellEyebrowClass}>Resources</h2>
								<div className="grid gap-3 sm:grid-cols-2">
									{resourceLinks.map((resource) => (
										<Button
											key={resource.id}
											asChild
											variant="outline"
											className="h-auto min-h-0 justify-start px-4 py-3 text-left font-medium whitespace-normal"
										>
											<Link
												href={resource.href}
												target={
													resource.kind === "external" ? "_blank" : undefined
												}
											>
												{resource.label}
											</Link>
										</Button>
									))}
								</div>
							</section>
						</>
					) : null}
				</div>
			</div>
			<div className="shrink-0 border-t border-border/60 bg-muted/30 px-4 py-3 xl:px-6">
				<div className="w-full">{footer}</div>
			</div>
		</Card>
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
