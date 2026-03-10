"use client";

import Link from "next/link";

import { getLesson, type LessonConfig } from "@/app/lessonRegistry";
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

function ObjectivePanel({
	lesson,
	collapsed,
	onToggle,
}: {
	lesson: LessonConfig;
	collapsed: boolean;
	onToggle: () => void;
}) {
	const nextLesson = lesson.nextLessonId ? getLesson(lesson.nextLessonId) : undefined;

	if (collapsed) {
		return (
			<aside className="flex min-h-[320px] flex-col items-center justify-between rounded-none border border-product-border bg-product-surface/78 p-3 shadow-panel backdrop-blur-xl">
				<div className="text-center">
					<p className="font-mono text-[10px] uppercase tracking-[0.24em] text-product-muted">
						Objective
					</p>
					<p className="mt-3 font-display text-3xl uppercase leading-none tracking-[0.06em] text-product-text">
						{lesson.id}
					</p>
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
		<aside className="rounded-none border border-product-border bg-product-surface/78 p-5 shadow-panel backdrop-blur-xl">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="font-mono text-[11px] uppercase tracking-[0.22em] text-product-muted">
						Current objective
					</p>
					<h2 className="mt-3 font-display text-4xl uppercase leading-none tracking-[0.06em] text-product-text">
						{lesson.id}
					</h2>
				</div>
				<button
					type="button"
					onClick={onToggle}
					className="rounded-none border border-product-border bg-product-surface-alt/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-product-text"
				>
					Collapse
				</button>
			</div>
			<p className="mt-4 font-mono text-sm uppercase tracking-[0.08em] text-product-text">
				{lesson.objectiveTitle}
			</p>
			<p className="mt-4 text-sm font-medium leading-relaxed text-product-muted">
				{lesson.helperText ?? lesson.winCondition}
			</p>

			<div className="mt-6 rounded-none border border-product-border bg-product-surface-strong/80 p-4">
				<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
					Checklist
				</p>
				<ul className="mt-3 space-y-2 text-sm font-medium text-product-text">
					{lesson.checklist.map((item) => (
						<li key={item}>[ ] {item}</li>
					))}
				</ul>
			</div>

			<div className="mt-4 rounded-none border border-product-border bg-product-surface-strong/80 p-4">
				<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
					Output
				</p>
				<p className="mt-3 font-display text-2xl uppercase leading-none tracking-[0.05em] text-product-text">
					{lesson.artifact.label}
				</p>
			</div>

			<div className="mt-4 rounded-none border border-product-border bg-product-surface-strong/80 p-4">
				<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
					Next unlock
				</p>
				<p className="mt-3 font-mono text-sm uppercase tracking-[0.08em] text-product-text">
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
		<aside className="rounded-none border border-product-border bg-product-surface/78 shadow-panel backdrop-blur-xl">
			<div className="border-b border-product-border px-5 py-4">
				<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
					Coach
				</p>
			</div>
			<div>
				{sections.map((section) => {
					const isOpen = section.key === activePanel;
					return (
						<div key={section.key} className="border-b border-product-border last:border-b-0">
							<button
								type="button"
								onClick={() => onPanelChange(section.key)}
								className="flex w-full items-center justify-between px-5 py-4 text-left"
							>
								<span className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-text">
									{section.label}
								</span>
								<span className="font-mono text-[10px] uppercase tracking-[0.24em] text-product-muted">
									{isOpen ? "open" : "closed"}
								</span>
							</button>
							{isOpen ? <div className="px-5 pb-5">{section.content}</div> : null}
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
	coachVisible,
	activeCoachPanel,
	onCoachPanelChange,
	pinnedArtifacts,
	coachContent,
	children,
	footer,
}: BaseLessonShellProps) {
	return (
		<div className="grid gap-4 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)_minmax(340px,380px)]">
			<ObjectivePanel
				lesson={lesson}
				collapsed={objectiveCollapsed}
				onToggle={onToggleObjective}
			/>
			<section className="rounded-none border border-product-border bg-product-surface/78 shadow-panel backdrop-blur-xl">
				<div className="border-b border-product-border px-5 py-4">
					<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
						Workbench - {lesson.id}
					</p>
				</div>
				<div className="px-5 py-5">{children}</div>
				<div className="border-t border-product-border bg-product-surface-strong/70 px-5 py-4">
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
				<div className="rounded-none border border-dashed border-product-border bg-product-surface/60 p-5 text-sm font-medium leading-relaxed text-product-muted shadow-panel backdrop-blur-xl">
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
	coachVisible,
	activeCoachPanel,
	onCoachPanelChange,
	pinnedArtifacts,
	coachContent,
	children,
	footer,
}: BaseLessonShellProps) {
	return (
		<div className="relative space-y-4">
			<div className="grid gap-4 xl:grid-cols-[minmax(0,128px)_minmax(0,1fr)]">
				<ObjectivePanel
					lesson={lesson}
					collapsed={objectiveCollapsed}
					onToggle={onToggleObjective}
				/>
				<section className="rounded-none border border-product-border bg-product-surface/78 shadow-panel backdrop-blur-xl">
					<div className="border-b border-product-border px-5 py-4">
						<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
							Focus workspace - {lesson.id}
						</p>
					</div>
					<div className="px-5 py-5 xl:pr-[360px]">{children}</div>
					<div className="border-t border-product-border bg-product-surface-strong/70 px-5 py-4">
						{footer}
					</div>
				</section>
			</div>

			{coachVisible ? (
				<div className="xl:pointer-events-none xl:absolute xl:right-6 xl:top-6 xl:w-[320px]">
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
