"use client";

import Link from "next/link";

import { LessonVideoSurface } from "@/features/course/lesson/components/lesson-video-surface";
import type { LessonResourceContent } from "@/features/course/lesson/model/contracts";
import type {
	LessonConfig,
	LessonContent,
} from "@/features/course/lesson/model/manifest";
import type { ObjectiveTask } from "@/features/course/lesson/model/registry";
import {
	workbenchChromeLabelClass,
	workbenchPanelClass,
} from "@/features/course/lesson/workbench/shared/workbench-readability";

import { CoachPanel } from "./coach-panel";
import { ObjectivePanel } from "./objective-panel";
import type { CoachPanelKey, PinnedArtifact } from "./types";

export type { CoachPanelKey, PinnedArtifact } from "./types";

type BaseLessonShellProps = {
	lesson: LessonConfig;
	objectiveTasks: ObjectiveTask[];
	onObjectiveTaskToggle: (taskId: string, checked: boolean) => void;
	coachVisible: boolean;
	activeCoachPanel: CoachPanelKey;
	onCoachPanelChange: (panel: CoachPanelKey) => void;
	pinnedArtifacts: PinnedArtifact[];
	coachContent: LessonContent["coach"];
	children: React.ReactNode;
	footer: React.ReactNode;
};

type WatchLessonShellProps = {
	lesson: LessonConfig;
	coachContent: LessonContent["coach"];
	footer: React.ReactNode;
};

export function LessonShellSplit({
	lesson,
	objectiveTasks,
	onObjectiveTaskToggle,
	coachVisible,
	activeCoachPanel,
	onCoachPanelChange,
	pinnedArtifacts,
	coachContent,
	children,
	footer,
}: BaseLessonShellProps) {
	const gridClassName = coachVisible
		? "grid gap-3 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,270px)_minmax(0,1fr)_minmax(280px,320px)]"
		: "grid gap-3 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,270px)_minmax(0,1fr)]";

	return (
		<div className={gridClassName}>
			<ObjectivePanel
				lesson={lesson}
				objectiveTasks={objectiveTasks}
				onObjectiveTaskToggle={onObjectiveTaskToggle}
			/>
			<WorkbenchPanel footer={footer}>{children}</WorkbenchPanel>
			{coachVisible ? (
				<CoachPanel
					lesson={lesson}
					coachContent={coachContent}
					activePanel={activeCoachPanel}
					onPanelChange={onCoachPanelChange}
					pinnedArtifacts={pinnedArtifacts}
				/>
			) : null}
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
}: WatchLessonShellProps) {
	const resourceLinks = (coachContent.resources ?? []).filter(
		(
			resource,
		): resource is Exclude<LessonResourceContent, { kind: "copy_prompt" }> =>
			resource.kind !== "copy_prompt",
	);

	return (
		<section
			className={`min-w-0 xl:flex xl:h-full xl:min-h-0 xl:flex-col ${workbenchPanelClass}`}
		>
			<div className="min-w-0 px-4 py-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:px-6 xl:py-6">
				<div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
					<div className="space-y-3 border-b border-product-border/70 pb-4">
						<div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
							<p>{lesson.id}</p>
							<p>{lesson.artifact.label}</p>
							{lesson.content.lessonMeta.runtimeLabel ? (
								<p>{lesson.content.lessonMeta.runtimeLabel}</p>
							) : null}
						</div>
						<div className="space-y-2">
							<h1 className="max-w-4xl text-balance font-display text-[2.2rem] uppercase leading-[0.92] tracking-[0.05em] text-product-text sm:text-[2.85rem]">
								{lesson.title}
							</h1>
							<p className="max-w-[64ch] text-[15px] leading-[1.72] text-product-muted sm:text-[16px]">
								{lesson.content.intro}
							</p>
						</div>
					</div>
					<LessonVideoSurface
						coachContent={coachContent}
						variant="watch-shell"
					/>
					{coachContent.transcript?.status === "ready" &&
					coachContent.transcript.body ? (
						<section className="rounded-none border border-product-border/55 bg-product-surface-strong/70 px-5 py-5">
							<p className={workbenchChromeLabelClass}>Transcript</p>
							<p className="mt-3 max-w-[64ch] whitespace-pre-wrap text-[15px] leading-[1.72] text-product-text">
								{coachContent.transcript.body}
							</p>
						</section>
					) : null}
					{resourceLinks.length > 0 ? (
						<section className="rounded-none border border-product-border/55 bg-product-surface-strong/70 px-5 py-5">
							<p className={workbenchChromeLabelClass}>Resources</p>
							<div className="mt-3 grid gap-3 sm:grid-cols-2">
								{resourceLinks.map((resource) => (
									<Link
										key={resource.id}
										href={resource.href}
										target={resource.kind === "external" ? "_blank" : undefined}
										className="rounded-none border border-product-border/55 bg-product-surface px-4 py-3 text-[14px] font-medium text-product-text transition-colors hover:bg-product-surface-alt"
									>
										{resource.label}
									</Link>
								))}
							</div>
						</section>
					) : null}
				</div>
			</div>
			<div className="shrink-0 border-t border-product-border/55 bg-product-surface-strong/70 px-4 py-3 xl:px-6">
				<div className="mx-auto w-full max-w-5xl">{footer}</div>
			</div>
		</section>
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
		<section
			className={`min-w-0 xl:flex xl:min-h-0 xl:flex-col ${workbenchPanelClass}`}
		>
			<div className="sticky top-0 z-10 border-b border-product-border/55 bg-product-surface/95 px-4 py-2 backdrop-blur-lg">
				<p className={workbenchChromeLabelClass}>Workbench</p>
			</div>
			<div className="min-w-0 px-4 py-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto sm:px-5">
				{children}
			</div>
			<div className="shrink-0 border-t border-product-border/55 bg-product-surface-strong/70 px-4 py-3 sm:px-5">
				{footer}
			</div>
		</section>
	);
}
