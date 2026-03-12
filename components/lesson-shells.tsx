"use client";

import Link from "next/link";

import { formatArtifactValue } from "@/components/lesson-workbench/shared/artifact-format";
import { getLesson, type LessonConfig } from "@/lib/course/manifest";
import type { LessonContent } from "@/lib/course/manifest";
import type {
	ObjectiveTask,
	PersistedFieldValues,
} from "@/lib/course/registry";

export type PinnedArtifact = {
	artifactKey: string;
	artifactLabel: string;
	contextTitle?: string;
	fieldValues: PersistedFieldValues;
	fields: Array<[string, unknown]>;
	lessonTitle: string;
};

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
					Next unlock
				</p>
				<p className="mt-0.5 text-[11px] font-medium leading-tight text-product-text">
					{nextLesson ? `${nextLesson.id} ${nextLesson.shortTitle}` : "Mission"}
				</p>
			</div>
		</aside>
	);
}

function CoachPanel({
	coachContent,
	activePanel,
	onPanelChange,
	pinnedArtifacts,
}: {
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

	const sections: Array<{
		key: CoachPanelKey;
		label: string;
		content: React.ReactNode;
	}> = [
		{
			key: "watch",
			label: "Watch",
			content:
				coachContent?.video?.status === "ready" && coachContent.video.url ? (
					<div className="space-y-1.5">
						<video
							controls
							poster={coachContent.video.posterUrl}
							className="w-full rounded-none border border-product-border bg-product-surface-strong"
							src={coachContent.video.url}
						/>
						<p className="text-[10px] font-medium uppercase tracking-[0.18em] text-product-muted">
							{coachContent.video.title ?? "Lesson video"}
						</p>
					</div>
				) : (
					<div className="rounded-none border border-dashed border-product-border bg-product-surface-strong/70 px-2 py-2 text-xs font-medium leading-snug text-product-muted">
						Video not wired yet.
					</div>
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
										<p>No saved preview yet.</p>
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
						{resources.map((resource) => (
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
						))}
					</div>
				) : (
					<p className="text-xs font-medium leading-snug text-product-muted">
						Resources will show here when assigned.
					</p>
				),
		},
	];

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
	return (
		<div className="grid gap-3 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,270px)_minmax(0,1fr)_minmax(280px,320px)]">
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
					coachContent={coachContent}
					activePanel={activeCoachPanel}
					onPanelChange={onCoachPanelChange}
					pinnedArtifacts={pinnedArtifacts}
				/>
			) : (
				<div className="rounded-none border border-dashed border-product-border/70 bg-product-surface/55 px-2 py-2 text-xs font-medium leading-snug text-product-muted shadow-panel backdrop-blur-lg xl:min-h-0 xl:overflow-y-auto">
					Coach hidden. Use HUD toggle to reopen.
				</div>
			)}
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
