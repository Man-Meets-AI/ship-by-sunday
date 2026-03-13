"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { LessonVideoSurface } from "@/components/lesson-video-surface";
import { formatArtifactValue } from "@/components/lesson-workbench/shared/artifact-format";
import type {
	LessonPromptResourceContent,
	LessonResourceContent,
} from "@/lib/course/contracts";
import { getLesson, type LessonConfig } from "@/lib/course/manifest";
import type { LessonContent } from "@/lib/course/manifest";
import { getPromptTemplateState } from "@/lib/course/research-prompt";
import type { ArtifactPreview, ObjectiveTask } from "@/lib/course/registry";

export type PinnedArtifact = ArtifactPreview;

function getPromptResourceState(
	resource: LessonPromptResourceContent,
	pinnedArtifacts: PinnedArtifact[],
) {
	return getPromptTemplateState(resource.promptTemplateId, pinnedArtifacts);
}

function CopyPromptResourceCard({
	resource,
	pinnedArtifacts,
}: {
	resource: LessonPromptResourceContent;
	pinnedArtifacts: PinnedArtifact[];
}) {
	const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
		"idle",
	);
	const resetTimeoutRef = useRef<number | null>(null);
	const { prompt, disabledReason } = getPromptResourceState(
		resource,
		pinnedArtifacts,
	);

	useEffect(() => {
		return () => {
			if (resetTimeoutRef.current !== null) {
				window.clearTimeout(resetTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		setCopyState("idle");
	}, [prompt, disabledReason]);

	const copyPrompt = () => {
		if (!prompt || disabledReason) {
			return;
		}

		if (!navigator.clipboard?.writeText) {
			setCopyState("error");
			return;
		}

		void navigator.clipboard.writeText(prompt).then(
			() => {
				if (resetTimeoutRef.current !== null) {
					window.clearTimeout(resetTimeoutRef.current);
				}

				setCopyState("copied");
				resetTimeoutRef.current = window.setTimeout(() => {
					resetTimeoutRef.current = null;
					setCopyState("idle");
				}, 1600);
			},
			() => {
				setCopyState("error");
			},
		);
	};

	return (
		<div className="rounded-none border border-product-border bg-product-surface-strong/80 px-2 py-2">
			<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
				custom prompt
			</p>
			<p className="mt-0.5 text-xs font-medium text-product-text">
				{resource.label}
			</p>
			{resource.body ? (
				<p className="mt-1 text-xs font-medium leading-snug text-product-muted">
					{resource.body}
				</p>
			) : null}
			{disabledReason ? (
				<p className="mt-1 text-xs font-medium leading-snug text-product-muted">
					{disabledReason}
				</p>
			) : null}
			<div className="mt-2 flex flex-wrap items-center gap-2">
				<button
					type="button"
					onClick={copyPrompt}
					disabled={Boolean(disabledReason)}
					className="rounded-none border border-product-accent bg-product-chip px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg disabled:cursor-not-allowed disabled:border-product-border disabled:bg-product-surface disabled:text-product-muted"
				>
					{copyState === "copied" ? "Copied" : "Copy prompt"}
				</button>
				{copyState === "error" && !disabledReason ? (
					<p className="text-[11px] font-medium leading-snug text-product-muted">
						Clipboard unavailable. Copy from the prompt block below.
					</p>
				) : null}
			</div>
			<div className="mt-2 rounded-none border border-product-border/80 bg-product-surface px-2 py-2">
				{prompt ? (
					<textarea
						readOnly
						value={prompt}
						rows={14}
						className="w-full resize-y border-0 bg-transparent p-0 font-mono text-[11px] leading-relaxed text-product-text outline-hidden"
						aria-label={`${resource.label} prompt`}
					/>
				) : (
					<p className="text-[11px] font-medium leading-snug text-product-muted">
						The prompt will appear here once your chosen user and outcome are
						saved.
					</p>
				)}
			</div>
		</div>
	);
}

type CoachPanelKey = "watch" | "transcript" | "examples" | "resources";

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

function ManualTaskRow({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<label
			className={`flex items-center gap-2 px-1 py-1 transition-colors ${
				checked ? "text-product-text" : "text-product-text"
			}`}
		>
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
				className="size-3 shrink-0 rounded-none border-product-border accent-[rgb(var(--product-accent))]"
			/>
			<span
				className={`text-[11px] leading-snug ${checked ? "text-product-muted line-through" : ""}`}
			>
				{label}
			</span>
		</label>
	);
}

function GeneratedTaskRow({
	label,
	complete,
}: {
	label: string;
	complete: boolean;
}) {
	return (
		<div className="flex items-start gap-2 px-1 py-1">
			<span
				className={`mt-0.5 inline-block h-3 w-3 shrink-0 border ${
					complete
						? "border-product-accent bg-product-accent"
						: "border-product-border bg-product-surface"
				}`}
			/>
			<span
				className={`text-[11px] leading-snug ${
					complete ? "text-product-muted line-through" : "text-product-text"
				}`}
			>
				{label}
			</span>
		</div>
	);
}

function ObjectivePanel({
	lesson,
	objectiveTasks,
	onObjectiveTaskToggle,
}: {
	lesson: LessonConfig;
	objectiveTasks: ObjectiveTask[];
	onObjectiveTaskToggle: (taskId: string, checked: boolean) => void;
}) {
	const nextLesson = lesson.nextLessonId
		? getLesson(lesson.nextLessonId)
		: undefined;
	const nextStepLabel =
		lesson.nextStepLabel ??
		(nextLesson ? `${nextLesson.id} ${nextLesson.shortTitle}` : "Mission");
	const completedCount = objectiveTasks.filter(
		(task) => task.status === "complete",
	).length;
	const sectionIds = Array.from(
		new Set(
			objectiveTasks
				.map((task) => task.sectionId)
				.filter((sectionId): sectionId is string => Boolean(sectionId)),
		),
	);
	const shouldGroupBySection = sectionIds.length > 1;
	const taskGroups = shouldGroupBySection
		? sectionIds.map((sectionId) => ({
				id: sectionId,
				title:
					objectiveTasks.find((task) => task.sectionId === sectionId)
						?.sectionTitle ?? sectionId,
				tasks: objectiveTasks.filter((task) => task.sectionId === sectionId),
			}))
		: [
				{
					id: "all",
					title: null,
					tasks: objectiveTasks,
				},
			];

	return (
		<aside className="flex min-w-0 flex-col rounded-none border border-product-border/70 bg-product-surface/68 shadow-panel backdrop-blur-lg xl:h-full xl:min-h-0">
			{/* Header */}
			<div className="sticky top-0 z-10 shrink-0 border-b border-product-border bg-product-surface/95 px-3 py-1.5 backdrop-blur-lg">
				<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
					{lesson.objectiveTitle}
				</p>
			</div>

			{/* Scrollable body */}
			<div className="min-h-0 flex-1 overflow-y-auto">
				{/* Helper text */}
				<div className="border-b border-product-border/60 px-3 py-2">
					<p className="text-[11px] font-medium leading-snug text-product-muted">
						{lesson.helperText ?? lesson.winCondition}
					</p>
				</div>

				{/* Output */}
				<div className="border-b border-product-border/60 px-3 py-1.5">
					<p className="font-mono text-[8px] uppercase tracking-[0.2em] text-product-muted">
						Output
					</p>
					<p className="mt-0.5 text-[11px] font-medium leading-tight text-product-text">
						{lesson.artifact.label}
					</p>
				</div>

				{/* Tasks */}
				<div className="px-3 py-2">
					<div className="mb-1.5 flex items-center justify-between gap-2">
						<p className="font-mono text-[8px] uppercase tracking-[0.2em] text-product-muted">
							Tasks
						</p>
						<p className="font-mono text-[9px] tabular-nums tracking-[0.15em] text-product-muted">
							{completedCount}/{objectiveTasks.length}
						</p>
					</div>
					<div className="space-y-2">
						{taskGroups.map((group) => (
							<div key={group.id} className="space-y-0.5">
								{group.title ? (
									<p className="font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
										{group.title}
									</p>
								) : null}
								<div className="space-y-0.5">
									{group.tasks.map((task) =>
										task.interactive ? (
											<ManualTaskRow
												key={task.id}
												label={task.label}
												checked={task.status === "complete"}
												onChange={(checked) =>
													onObjectiveTaskToggle(task.id, checked)
												}
											/>
										) : (
											<GeneratedTaskRow
												key={task.id}
												label={task.label}
												complete={task.status === "complete"}
											/>
										),
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Next unlock — pinned to bottom */}
			<div className="shrink-0 border-t border-product-border bg-product-surface-strong/70 px-3 py-1.5">
				<p className="font-mono text-[8px] uppercase tracking-[0.2em] text-product-muted">
					{lesson.nextStepLabel ? "Next step" : "Next unlock"}
				</p>
				<p className="mt-0.5 text-[11px] font-medium leading-tight text-product-text">
					{nextStepLabel}
				</p>
			</div>
		</aside>
	);
}

function CoachPanel({
	lesson,
	coachContent,
	activePanel,
	onPanelChange,
	pinnedArtifacts,
}: {
	lesson: LessonConfig;
	coachContent: LessonContent["coach"];
	activePanel: CoachPanelKey;
	onPanelChange: (panel: CoachPanelKey) => void;
	pinnedArtifacts: PinnedArtifact[];
}) {
	const examples = (coachContent?.examples ?? []).filter(
		(example) =>
			example.id !== "avoid-this" &&
			example.title.trim().toLowerCase() !== "avoid this",
	);
	const resources = coachContent?.resources ?? [];
	const emptyVideoState =
		lesson.id === "1.1"
			? {
					eyebrow: "No lesson video yet",
					title: "Use the guided path",
					body: "This lesson is still fully usable. Lean on the inline examples, the guided prompts, and the compare-your-three recap while you draft grounded candidate problems.",
				}
			: undefined;

	const sectionDefinitions: Array<{
		key: CoachPanelKey;
		label: string;
		content: React.ReactNode;
	}> = [
		{
			key: "watch",
			label: "Watch",
			content: (
				<LessonVideoSurface
					coachContent={coachContent}
					emptyState={emptyVideoState}
				/>
			),
		},
		{
			key: "transcript",
			label: "Transcript",
			content:
				coachContent?.transcript?.status === "ready" &&
				coachContent.transcript.body ? (
					<p className="whitespace-pre-wrap text-xs font-medium leading-relaxed text-product-text">
						{coachContent.transcript.body}
					</p>
				) : (
					<p className="text-xs font-medium leading-snug text-product-muted">
						Transcript will appear here when attached.
					</p>
				),
		},
		{
			key: "examples",
			label: "Examples",
			content:
				examples.length > 0 ? (
					<div className="space-y-1.5">
						{examples.map((example) => (
							<div
								key={example.id}
								className="rounded-none border border-product-border bg-product-surface-strong/80 px-2 py-1.5"
							>
								<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
									{example.title}
								</p>
								<p className="mt-1 whitespace-pre-wrap text-xs font-medium leading-snug text-product-text">
									{example.body}
								</p>
								{example.imageSrc ? (
									<div className="mt-2 space-y-1">
										<img
											src={example.imageSrc}
											alt={example.imageAlt ?? example.title}
											className="w-full rounded-none border border-product-border/70 bg-product-bg object-contain"
											loading="lazy"
										/>
										{example.imageCaption ? (
											<p className="text-[11px] font-medium leading-snug text-product-muted">
												{example.imageCaption}
											</p>
										) : null}
									</div>
								) : null}
							</div>
						))}
					</div>
				) : pinnedArtifacts.length > 0 ? (
					<div className="space-y-1.5">
						{pinnedArtifacts.slice(0, 3).map((artifact) => (
							<div
								key={artifact.artifactKey}
								className="rounded-none border border-product-border bg-product-surface-strong/80 px-2 py-1.5"
							>
								<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
									{artifact.lessonTitle}
								</p>
								<p className="mt-1 font-display text-sm uppercase tracking-[0.05em] text-product-text">
									{artifact.artifactLabel}
								</p>
								<div className="mt-1 space-y-1 text-xs font-medium text-product-muted">
									{artifact.fields.length === 0 ? (
										<p>No preview details attached.</p>
									) : (
										artifact.fields.slice(0, 2).map(([key, value]) => (
											<div key={key}>
												<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
													{key}
												</p>
												<p className="mt-0.5 text-product-text">
													{formatArtifactValue(value)}
												</p>
											</div>
										))
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-xs font-medium leading-snug text-product-muted">
						Examples will show here when attached.
					</p>
				),
		},
		{
			key: "resources",
			label: "Resources",
			content:
				resources.length > 0 ? (
					<div className="space-y-1.5">
						{resources.map((resource) =>
							resource.kind === "copy_prompt" ? (
								<CopyPromptResourceCard
									key={resource.id}
									resource={resource}
									pinnedArtifacts={pinnedArtifacts}
								/>
							) : (
								<Link
									key={resource.id}
									href={resource.href}
									target={resource.kind === "external" ? "_blank" : undefined}
									className="block rounded-none border border-product-border bg-product-surface-strong/80 px-2 py-1.5 transition-colors hover:bg-product-surface-alt"
								>
									<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
										{resource.kind}
									</p>
									<p className="mt-0.5 text-xs font-medium text-product-text">
										{resource.label}
									</p>
								</Link>
							),
						)}
					</div>
				) : (
					<p className="text-xs font-medium leading-snug text-product-muted">
						Resources will show here when assigned.
					</p>
				),
		},
	];
	const sections = sectionDefinitions.filter((section) =>
		lesson.coachVideoPlacement === "workbench" ? section.key !== "watch" : true,
	);

	return (
		<aside className="min-w-0 rounded-none border border-product-border/70 bg-product-surface/68 shadow-panel backdrop-blur-xl xl:h-full xl:min-h-0 xl:overflow-y-auto">
			<div className="sticky top-0 z-10 border-b border-product-border bg-product-surface/95 px-3 py-1.5 backdrop-blur-lg">
				<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
					Coach
				</p>
			</div>
			<div>
				{sections.map((section) => {
					const isOpen = section.key === activePanel;
					return (
						<div
							key={section.key}
							className={`border-b border-product-border last:border-b-0 ${
								isOpen ? "bg-product-surface-strong/65" : ""
							}`}
						>
							<button
								type="button"
								onClick={() => onPanelChange(section.key)}
								className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-product-surface-strong/50"
							>
								<div className="flex items-center gap-2">
									<span
										className={`inline-block h-2 w-2 border ${
											isOpen
												? "border-product-accent bg-product-accent"
												: "border-product-border bg-product-surface"
										}`}
									/>
									<span className="font-mono text-[10px] uppercase tracking-[0.2em] text-product-text">
										{section.label}
									</span>
								</div>
							</button>
							{isOpen ? (
								<div className="border-t border-product-border/80 px-3 py-3">
									{section.content}
								</div>
							) : null}
						</div>
					);
				})}
			</div>
		</aside>
	);
}

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
			<section className="min-w-0 rounded-none border border-product-border/75 bg-product-surface/82 shadow-panel backdrop-blur-lg xl:flex xl:min-h-0 xl:flex-col">
				<div className="sticky top-0 z-10 border-b border-product-border bg-product-surface/95 px-3 py-1.5 backdrop-blur-lg">
					<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
						Workbench
					</p>
				</div>
				<div className="min-w-0 px-3 py-2 xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
					{children}
				</div>
				<div className="shrink-0 border-t border-product-border bg-product-surface-strong/70 px-3 py-2">
					{footer}
				</div>
			</section>
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

export function LessonShellFocus({
	lesson,
	children,
	footer,
}: BaseLessonShellProps) {
	return (
		<section className="min-w-0 rounded-none border border-product-border/75 bg-product-surface/82 shadow-panel backdrop-blur-lg xl:flex xl:h-full xl:min-h-0 xl:flex-col">
			<div className="sticky top-0 z-10 border-b border-product-border bg-product-surface/95 px-3 py-1.5 backdrop-blur-lg">
				<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
					Workbench
				</p>
			</div>
			<div className="min-w-0 px-3 py-2 xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
				{children}
			</div>
			<div className="shrink-0 border-t border-product-border bg-product-surface-strong/70 px-3 py-2">
				{footer}
			</div>
		</section>
	);
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
		<section className="min-w-0 rounded-none border border-product-border/75 bg-product-surface/82 shadow-panel backdrop-blur-lg xl:flex xl:h-full xl:min-h-0 xl:flex-col">
			<div className="min-w-0 px-4 py-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:px-6 xl:py-6">
				<div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
					<div className="space-y-3 border-b border-product-border/70 pb-4">
						<div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-product-muted">
							<p>{lesson.id}</p>
							<p>{lesson.artifact.label}</p>
							{lesson.content.lessonMeta.runtimeLabel ? (
								<p>{lesson.content.lessonMeta.runtimeLabel}</p>
							) : null}
						</div>
						<div className="space-y-2">
							<h1 className="max-w-4xl text-balance font-display text-[2rem] uppercase leading-none tracking-[0.06em] text-product-text sm:text-[2.6rem]">
								{lesson.title}
							</h1>
							<p className="max-w-3xl text-sm font-medium leading-relaxed text-product-muted sm:text-base">
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
						<section className="rounded-none border border-product-border bg-product-surface-strong/70 px-4 py-4">
							<p className="font-mono text-[10px] uppercase tracking-[0.2em] text-product-muted">
								Transcript
							</p>
							<p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-relaxed text-product-text">
								{coachContent.transcript.body}
							</p>
						</section>
					) : null}
					{resourceLinks.length > 0 ? (
						<section className="rounded-none border border-product-border bg-product-surface-strong/70 px-4 py-4">
							<p className="font-mono text-[10px] uppercase tracking-[0.2em] text-product-muted">
								Resources
							</p>
							<div className="mt-2 grid gap-2 sm:grid-cols-2">
								{resourceLinks.map((resource) => (
									<Link
										key={resource.id}
										href={resource.href}
										target={resource.kind === "external" ? "_blank" : undefined}
										className="rounded-none border border-product-border bg-product-surface px-3 py-2 text-sm font-medium text-product-text transition-colors hover:bg-product-surface-alt"
									>
										{resource.label}
									</Link>
								))}
							</div>
						</section>
					) : null}
				</div>
			</div>
			<div className="shrink-0 border-t border-product-border bg-product-surface-strong/70 px-4 py-3 xl:px-6">
				<div className="mx-auto w-full max-w-5xl">{footer}</div>
			</div>
		</section>
	);
}
