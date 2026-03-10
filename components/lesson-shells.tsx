"use client";

import Link from "next/link";

import {
	getLesson,
	type ChecklistItemValue,
	type LessonConfig,
} from "@/app/lessonRegistry";
import type { LessonContent } from "@/content/lessons/types";

export type PinnedArtifact = {
	artifactKey: string;
	artifactLabel: string;
	fields: Array<[string, unknown]>;
	lessonTitle: string;
};

type CoachPanelKey = "watch" | "transcript" | "examples" | "resources";

type BaseLessonShellProps = {
	lesson: LessonConfig;
	objectiveCollapsed: boolean;
	onToggleObjective: () => void;
	objectiveChecklistItems: ChecklistItemValue[];
	onObjectiveChecklistToggle: (index: number, checked: boolean) => void;
	coachVisible: boolean;
	activeCoachPanel: CoachPanelKey;
	onCoachPanelChange: (panel: CoachPanelKey) => void;
	pinnedArtifacts: PinnedArtifact[];
	coachContent: LessonContent["coach"];
	children: React.ReactNode;
	footer: React.ReactNode;
};

function formatArtifactValue(value: unknown) {
	if (!value) {
		return "No saved value yet.";
	}

	if (typeof value === "object" && !Array.isArray(value) && "fileName" in (value as object)) {
		return String((value as { fileName?: string }).fileName ?? "Uploaded file");
	}

	return Array.isArray(value) ? JSON.stringify(value) : String(value);
}

function ChecklistRow({
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
			className={`flex items-center gap-3 rounded-none border px-3 py-2 transition-colors ${
				checked
					? "border-product-accent bg-product-chip text-product-text"
					: "border-product-border bg-product-surface text-product-text"
			}`}
		>
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
				className="size-4 rounded-none border-product-border accent-[rgb(var(--product-accent))]"
			/>
			<span className={`text-sm font-medium ${checked ? "line-through opacity-70" : ""}`}>
				{label}
			</span>
		</label>
	);
}

function ObjectivePanel({
	lesson,
	collapsed,
	onToggle,
	objectiveChecklistItems,
	onObjectiveChecklistToggle,
}: {
	lesson: LessonConfig;
	collapsed: boolean;
	onToggle: () => void;
	objectiveChecklistItems: ChecklistItemValue[];
	onObjectiveChecklistToggle: (index: number, checked: boolean) => void;
}) {
	const nextLesson = lesson.nextLessonId ? getLesson(lesson.nextLessonId) : undefined;
	const completedCount = objectiveChecklistItems.filter((item) => item.checked).length;

	if (collapsed) {
		return (
			<aside className="flex min-h-[320px] min-w-0 flex-col items-center justify-between rounded-none border border-product-border bg-product-surface/82 p-3 shadow-panel backdrop-blur-xl xl:h-full xl:min-h-0 xl:overflow-y-auto">
				<div className="w-full space-y-3">
					<div className="border border-product-border bg-product-surface px-2 py-2 text-center">
						<p className="font-mono text-[10px] uppercase tracking-[0.24em] text-product-muted">
							Objective
						</p>
						<p className="mt-2 font-display text-3xl uppercase leading-none tracking-[0.06em] text-product-text">
							{lesson.id}
						</p>
					</div>
					<div className="border border-product-border bg-product-surface-strong/90 px-2 py-2 text-center">
						<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-product-muted">
							Ready
						</p>
						<p className="mt-1 font-display text-2xl uppercase leading-none tracking-[0.05em] text-product-text">
							{completedCount}/{objectiveChecklistItems.length}
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={onToggle}
					className="rounded-none border border-product-border bg-product-surface-alt/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-product-text"
				>
					Open
				</button>
			</aside>
		);
	}

	return (
		<aside className="min-w-0 rounded-none border border-product-border bg-product-surface/82 shadow-panel backdrop-blur-lg xl:h-full xl:min-h-0 xl:overflow-y-auto">
			<div className="sticky top-0 z-10 border-b border-product-border bg-product-surface/95 px-4 py-4 backdrop-blur-lg">
				<div className="flex items-start justify-between gap-3">
					<div className="space-y-3">
						<p className="font-mono text-[11px] uppercase tracking-[0.22em] text-product-muted">
							Current objective
						</p>
						<div className="inline-flex border border-product-border bg-product-surface-strong/90 px-3 py-2">
							<h2 className="font-display text-4xl uppercase leading-none tracking-[0.06em] text-product-text">
								{lesson.id}
							</h2>
						</div>
					</div>
					<button
						type="button"
						onClick={onToggle}
						className="rounded-none border border-product-border bg-product-surface-alt/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-product-text"
					>
						Collapse
					</button>
				</div>
			</div>
			<div className="space-y-3 p-4">
				<div className="border border-product-border bg-product-surface-strong/90 p-3">
					<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-product-muted">
						Win condition
					</p>
					<p className="mt-3 font-mono text-sm uppercase tracking-[0.08em] text-product-text">
						{lesson.objectiveTitle}
					</p>
					<p className="mt-3 text-sm font-medium leading-relaxed text-product-muted">
						{lesson.helperText ?? lesson.winCondition}
					</p>
				</div>
				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
					<div className="border border-product-border bg-product-surface p-3">
						<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-product-muted">
							Output
						</p>
						<p className="mt-3 font-display text-2xl uppercase leading-none tracking-[0.05em] text-product-text">
							{lesson.artifact.label}
						</p>
					</div>
					<div className="border border-product-border bg-product-surface p-3">
						<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-product-muted">
							Next unlock
						</p>
						<p className="mt-3 font-mono text-sm uppercase tracking-[0.08em] text-product-text">
							{nextLesson ? `${nextLesson.id} ${nextLesson.shortTitle}` : "Mission"}
						</p>
					</div>
				</div>
				<div className="border border-product-border bg-product-surface-strong/90 p-3">
					<div className="flex items-center justify-between gap-3">
						<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
							Checklist
						</p>
						<div className="border border-product-border bg-product-surface px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-product-text">
							{completedCount}/{objectiveChecklistItems.length} ready
						</div>
					</div>
					<div className="mt-3 space-y-2">
						{objectiveChecklistItems.map((item, index) => (
							<ChecklistRow
								key={item.label}
								label={item.label}
								checked={item.checked}
								onChange={(checked) => onObjectiveChecklistToggle(index, checked)}
							/>
						))}
					</div>
				</div>
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
	const examples = coachContent?.examples ?? [];
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
					<div className="space-y-3">
						<video
							controls
							poster={coachContent.video.posterUrl}
							className="w-full rounded-none border border-product-border bg-product-surface-strong"
							src={coachContent.video.url}
						/>
						<p className="text-xs font-medium uppercase tracking-[0.18em] text-product-muted">
							{coachContent.video.title ?? "Lesson video"}
						</p>
					</div>
				) : (
					<div className="rounded-none border border-dashed border-product-border bg-product-surface-strong/70 p-4 text-sm font-medium leading-relaxed text-product-muted">
						Video hosting is not wired yet. The watch slot is ready for the lesson
						asset once upload and delivery are finalized.
					</div>
				),
		},
		{
			key: "transcript",
			label: "Transcript",
			content:
				coachContent?.transcript?.status === "ready" && coachContent.transcript.body ? (
					<p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-product-text">
						{coachContent.transcript.body}
					</p>
				) : (
					<p className="text-sm font-medium leading-relaxed text-product-muted">
						Transcript content will drop into this panel when it is attached to the
						lesson.
					</p>
				),
		},
		{
			key: "examples",
			label: "Examples",
			content:
				examples.length > 0 ? (
					<div className="space-y-3">
						{examples.map((example) => (
							<div
								key={example.id}
								className="rounded-none border border-product-border bg-product-surface-strong/80 p-4"
							>
								<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
									{example.title}
								</p>
								<p className="mt-3 text-sm font-medium leading-relaxed text-product-text">
									{example.body}
								</p>
							</div>
						))}
					</div>
				) : pinnedArtifacts.length > 0 ? (
					<div className="space-y-3">
						{pinnedArtifacts.slice(0, 3).map((artifact) => (
							<div
								key={artifact.artifactKey}
								className="rounded-none border border-product-border bg-product-surface-strong/80 p-4"
							>
								<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
									{artifact.lessonTitle}
								</p>
								<p className="mt-3 font-display text-xl uppercase tracking-[0.05em] text-product-text">
									{artifact.artifactLabel}
								</p>
								<div className="mt-3 space-y-2 text-sm font-medium text-product-muted">
									{artifact.fields.length === 0 ? (
										<p>No saved preview yet.</p>
									) : (
										artifact.fields.slice(0, 2).map(([key, value]) => (
											<div key={key}>
												<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-product-muted">
													{key.replaceAll("_", " ")}
												</p>
												<p className="mt-1 text-product-text">
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
					<p className="text-sm font-medium leading-relaxed text-product-muted">
						Examples and artifact callouts will show here when they are attached to
						the lesson.
					</p>
				),
		},
		{
			key: "resources",
			label: "Resources",
			content:
				resources.length > 0 ? (
					<div className="space-y-3">
						{resources.map((resource) => (
							<Link
								key={resource.id}
								href={resource.href}
								target={resource.kind === "external" ? "_blank" : undefined}
								className="block rounded-none border border-product-border bg-product-surface-strong/80 p-4 transition-colors hover:bg-product-surface-alt"
							>
								<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
									{resource.kind}
								</p>
								<p className="mt-2 font-medium text-product-text">{resource.label}</p>
							</Link>
						))}
					</div>
				) : (
					<p className="text-sm font-medium leading-relaxed text-product-muted">
						Worksheets, links, and support downloads will show here when they are
						assigned to the lesson.
					</p>
				),
		},
	];

	return (
		<aside className="min-w-0 rounded-none border border-product-border bg-product-surface/78 shadow-panel backdrop-blur-xl xl:h-full xl:min-h-0 xl:overflow-y-auto">
			<div className="sticky top-0 z-10 border-b border-product-border bg-product-surface/95 px-5 py-4 backdrop-blur-lg">
				<div className="flex items-center justify-between gap-3">
					<div>
						<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
							Coach
						</p>
						<p className="mt-1 text-sm font-medium text-product-muted">
							Watch, reference, and examples
						</p>
					</div>
					<div className="border border-product-border bg-product-surface px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-product-text">
						{activePanel}
					</div>
				</div>
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
								className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-product-surface-strong/50"
							>
								<div className="flex items-center gap-3">
									<span
										className={`inline-block h-2.5 w-2.5 border ${
											isOpen
												? "border-product-accent bg-product-accent"
												: "border-product-border bg-product-surface"
										}`}
									/>
									<span className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-text">
										{section.label}
									</span>
								</div>
								<span className="font-mono text-[10px] uppercase tracking-[0.24em] text-product-muted">
									{isOpen ? "open" : "closed"}
								</span>
							</button>
							{isOpen ? (
								<div className="border-t border-product-border/80 px-5 py-5">
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
	objectiveCollapsed,
	onToggleObjective,
	objectiveChecklistItems,
	onObjectiveChecklistToggle,
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
				collapsed={objectiveCollapsed}
				onToggle={onToggleObjective}
				objectiveChecklistItems={objectiveChecklistItems}
				onObjectiveChecklistToggle={onObjectiveChecklistToggle}
			/>
			<section className="min-w-0 rounded-none border border-product-border bg-product-surface/78 shadow-panel backdrop-blur-lg xl:flex xl:min-h-0 xl:flex-col">
				<div className="sticky top-0 z-10 border-b border-product-border bg-product-surface/95 px-4 py-3 backdrop-blur-lg">
					<div className="flex items-center justify-between gap-3">
						<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
							Workbench - {lesson.id}
						</p>
						<div className="border border-product-border bg-product-surface px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-product-text">
							{lesson.shortTitle}
						</div>
					</div>
				</div>
				<div className="min-w-0 px-4 py-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
					{children}
				</div>
				<div className="shrink-0 border-t border-product-border bg-product-surface-strong/70 px-4 py-3">
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
				<div className="rounded-none border border-dashed border-product-border bg-product-surface/60 p-4 text-sm font-medium leading-relaxed text-product-muted shadow-panel backdrop-blur-lg xl:min-h-0 xl:overflow-y-auto">
					Coach hidden. Use the HUD toggle to reopen the lesson video and reference
					panels.
				</div>
			)}
		</div>
	);
}

export function LessonShellFocus({
	lesson,
	objectiveCollapsed,
	onToggleObjective,
	objectiveChecklistItems,
	onObjectiveChecklistToggle,
	coachVisible,
	activeCoachPanel,
	onCoachPanelChange,
	pinnedArtifacts,
	coachContent,
	children,
	footer,
}: BaseLessonShellProps) {
	return (
		<div className="relative space-y-4 xl:h-full xl:min-h-0 xl:space-y-0">
			<div className="grid gap-3 xl:h-full xl:min-h-0 xl:grid-cols-[88px_minmax(0,1fr)]">
				<ObjectivePanel
					lesson={lesson}
					collapsed={objectiveCollapsed}
					onToggle={onToggleObjective}
					objectiveChecklistItems={objectiveChecklistItems}
					onObjectiveChecklistToggle={onObjectiveChecklistToggle}
				/>
				<section className="min-w-0 rounded-none border border-product-border bg-product-surface/78 shadow-panel backdrop-blur-lg xl:flex xl:min-h-0 xl:flex-col">
					<div className="sticky top-0 z-10 border-b border-product-border bg-product-surface/95 px-4 py-3 backdrop-blur-lg">
						<div className="flex items-center justify-between gap-3">
							<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
								Focus workspace - {lesson.id}
							</p>
							<div className="border border-product-border bg-product-surface px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-product-text">
								Focus mode
							</div>
						</div>
					</div>
					<div className="min-w-0 px-4 py-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-[300px]">
						{children}
					</div>
					<div className="shrink-0 border-t border-product-border bg-product-surface-strong/70 px-4 py-3">
						{footer}
					</div>
				</section>
			</div>

			{coachVisible ? (
				<div className="xl:pointer-events-none xl:absolute xl:right-4 xl:top-4 xl:max-h-[calc(100%-1rem)] xl:w-[284px]">
					<div className="xl:pointer-events-auto">
						<CoachPanel
							coachContent={coachContent}
							activePanel={activeCoachPanel}
							onPanelChange={onCoachPanelChange}
							pinnedArtifacts={pinnedArtifacts}
						/>
					</div>
				</div>
			) : null}
		</div>
	);
}
