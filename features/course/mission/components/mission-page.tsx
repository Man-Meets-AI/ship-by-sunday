"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { ProductShell } from "@/features/course/shared/components/product-shell";
import {
	getLesson,
	getLessonHref,
	type BlockId,
} from "@/features/course/lesson/model/manifest";
import { getBlockById } from "@/features/course/lesson/model/registry";
import type { ProductTheme } from "@/features/course/shared/utils/product-theme";

type LessonStatus = "available" | "completed" | "in_progress" | "locked";
type BlockStatus = "completed" | "active" | "ready" | "locked";
type StatusTone = "now" | "next" | "done" | "locked";

type MissionLesson = {
	id: string;
	title: string;
	shortTitle: string;
	status: LessonStatus;
	artifactLabel: string;
	isImplemented: boolean;
};

type MissionBlock = {
	id: BlockId;
	label: string;
	order: number;
	availableCount?: number;
	completedCount: number;
	totalLessons: number;
	lessons: MissionLesson[];
};

type MissionState = {
	progressCount: number;
	totalLessons: number;
	blocks: MissionBlock[];
};

type EnrichedLesson = MissionLesson & {
	href: string;
	objectiveTitle: string;
	helperText?: string;
	winCondition: string;
};

type EnrichedBlock = MissionBlock & {
	level: number;
	summary: string;
	status: BlockStatus;
	pct: number;
	allLessons: EnrichedLesson[];
	currentLesson: EnrichedLesson | null;
	completedLessons: EnrichedLesson[];
	upcomingLessons: EnrichedLesson[];
};

function getBlockStatus(block: MissionBlock): BlockStatus {
	if (block.completedCount === block.totalLessons) return "completed";
	if (block.lessons.some((lesson) => lesson.status === "in_progress")) {
		return "active";
	}
	if (block.lessons.some((lesson) => lesson.status === "available")) {
		return "ready";
	}
	return "locked";
}

function enrichLesson(lesson: MissionLesson): EnrichedLesson {
	const config = getLesson(lesson.id);

	return {
		...lesson,
		href: getLessonHref(lesson.id),
		objectiveTitle: config?.objectiveTitle ?? `${lesson.id} ${lesson.title}`,
		helperText: config?.helperText,
		winCondition:
			config?.winCondition ?? `${lesson.shortTitle} is complete and saved.`,
	};
}

function enrichBlock(block: MissionBlock): EnrichedBlock {
	const meta = getBlockById(block.id);
	const status = getBlockStatus(block);
	const allLessons = block.lessons.map(enrichLesson);
	const currentLesson =
		allLessons.find(
			(lesson) =>
				lesson.status === "in_progress" || lesson.status === "available",
		) ?? null;
	const currentIndex = currentLesson
		? allLessons.findIndex((lesson) => lesson.id === currentLesson.id)
		: -1;

	return {
		...block,
		level: meta?.level ?? block.order,
		summary: meta?.summary ?? `${block.label} block`,
		status,
		pct:
			block.totalLessons > 0
				? Math.round((block.completedCount / block.totalLessons) * 100)
				: 0,
		allLessons,
		currentLesson,
		completedLessons: allLessons.filter(
			(lesson) => lesson.status === "completed",
		),
		upcomingLessons:
			currentIndex >= 0
				? allLessons
						.slice(currentIndex + 1)
						.filter((lesson) => lesson.status === "locked")
						.slice(0, 2)
				: allLessons.filter((lesson) => lesson.status === "locked").slice(0, 2),
	};
}

function getToneClasses(tone: StatusTone) {
	switch (tone) {
		case "now":
			return "border-product-accent bg-product-chip text-product-accent";
		case "next":
			return "border-product-border bg-product-surface-alt/90 text-product-text";
		case "done":
			return "border-product-border bg-product-surface text-product-text";
		default:
			return "border-product-border/60 bg-product-surface-strong/70 text-product-muted";
	}
}

function getBlockTone(status: BlockStatus, isCurrent = false): StatusTone {
	if (isCurrent || status === "active") return "now";
	if (status === "completed") return "done";
	if (status === "ready") return "next";
	return "locked";
}

function getBlockStatusLabel(status: BlockStatus, isCurrent = false) {
	if (isCurrent || status === "active") return "Now";
	if (status === "completed") return "Done";
	if (status === "ready") return "Ready";
	return "Locked";
}

function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
	return (
		<span
			className={`inline-flex rounded-none border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.18em] ${getToneClasses(
				tone,
			)}`}
		>
			{label}
		</span>
	);
}

function ProgressBar({ value }: { value: number }) {
	const pct = Math.max(0, Math.min(100, value));

	return (
		<div className="mt-1.5 h-1.5 overflow-hidden bg-product-border/20">
			<div
				className="h-full bg-[rgb(var(--product-accent))]"
				style={{ width: `${pct}%` }}
			/>
		</div>
	);
}

function LessonChip({ lesson }: { lesson: EnrichedLesson }) {
	const content = (
		<>
			<span className="font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
				{lesson.id}
			</span>
			<span className="text-xs font-medium text-product-text">
				{lesson.shortTitle}
			</span>
		</>
	);

	if (lesson.status === "locked") {
		return (
			<span className="inline-flex items-center gap-2 border border-product-border/60 bg-product-surface-strong/70 px-2.5 py-1.5">
				{content}
			</span>
		);
	}

	return (
		<Link
			href={lesson.href}
			className="inline-flex items-center gap-2 border border-product-border bg-product-surface px-2.5 py-1.5 transition-colors hover:bg-product-surface-alt"
		>
			{content}
		</Link>
	);
}

function CurrentStepCard({ lesson }: { lesson: EnrichedLesson }) {
	const ctaLabel =
		lesson.status === "in_progress"
			? `Resume ${lesson.id}`
			: `Start ${lesson.id}`;

	return (
		<article className="border border-product-border bg-product-surface px-4 py-4 shadow-panel backdrop-blur-xl sm:px-5">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
						Current step
					</p>
					<h2 className="mt-2 font-display text-3xl uppercase leading-none tracking-[0.05em] text-product-text sm:text-4xl">
						{lesson.id} {lesson.shortTitle}
					</h2>
				</div>
				<StatusBadge label="Now" tone="now" />
			</div>

			<div className="mt-4 grid gap-4 border-t border-product-border pt-4 sm:grid-cols-2">
				<div>
					<p className="font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
						Goal
					</p>
					<p className="mt-2 text-sm leading-relaxed text-product-text">
						{lesson.objectiveTitle}
					</p>
				</div>
				<div>
					<p className="font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
						Done looks like
					</p>
					<p className="mt-2 text-sm leading-relaxed text-product-text">
						{lesson.winCondition}
					</p>
				</div>
			</div>

			<div className="mt-4 flex flex-wrap items-center gap-3">
				<Link
					href={lesson.href}
					className="inline-flex rounded-none border border-product-accent bg-product-chip px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
				>
					{ctaLabel}
				</Link>
				<p className="text-xs leading-relaxed text-product-muted">
					Artifact you&apos;ll finish:{" "}
					<span className="text-product-text">{lesson.artifactLabel}</span>
				</p>
			</div>
		</article>
	);
}

function UpcomingSteps({ lessons }: { lessons: EnrichedLesson[] }) {
	if (lessons.length === 0) {
		return null;
	}

	return (
		<section className="border border-product-border bg-product-surface-strong/70 px-4 py-4 shadow-panel backdrop-blur-xl sm:px-5">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
						Coming up
					</p>
					<h3 className="mt-1 font-display text-2xl uppercase leading-none tracking-[0.05em] text-product-text">
						After this step
					</h3>
				</div>
				<StatusBadge label="Locked" tone="locked" />
			</div>

			<div className="mt-4 space-y-2">
				{lessons.map((lesson, index) => (
					<div
						key={lesson.id}
						className="flex flex-wrap items-center justify-between gap-3 border border-product-border/60 bg-product-surface px-3 py-2"
					>
						<div>
							<p className="font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
								{index === 0 ? "Next" : "Then"}
							</p>
							<p className="mt-1 text-sm font-medium text-product-text">
								{lesson.id} {lesson.shortTitle}
							</p>
						</div>
						<p className="text-right text-xs leading-relaxed text-product-muted">
							{lesson.artifactLabel}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}

function SprintOverview({
	block,
	nextBlock,
	mission,
}: {
	block: EnrichedBlock;
	nextBlock: EnrichedBlock | null;
	mission: MissionState;
}) {
	const ctaLesson = block.currentLesson ?? block.allLessons[0] ?? null;
	const unlockCopy = nextBlock
		? block.status === "completed"
			? `${nextBlock.label} is unlocked and ready when you are.`
			: `Finish ${block.label} to unlock ${nextBlock.label}.`
		: "This is the final block. Finish the remaining steps to complete the sprint.";
	const blockBadgeTone = block.status === "completed" ? "done" : "now";
	const blockBadgeLabel = block.status === "completed" ? "Done" : "Now";

	return (
		<section className="overflow-hidden rounded-none border border-product-border bg-product-surface shadow-panel backdrop-blur-xl">
			<div className="border-b border-product-border px-4 py-4 sm:px-5">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="max-w-3xl">
						<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
							Your sprint
						</p>
						<div className="mt-2 flex flex-wrap items-center gap-2">
							<span className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
								Step {block.level} of 4
							</span>
							<StatusBadge label={blockBadgeLabel} tone={blockBadgeTone} />
						</div>
						<h1 className="mt-3 font-display text-4xl uppercase leading-none tracking-[0.05em] text-product-text sm:text-5xl">
							{block.label}
						</h1>
						<p className="mt-3 max-w-2xl text-sm leading-relaxed text-product-text sm:text-[15px]">
							{block.summary}
						</p>
					</div>

					<div className="min-w-[210px] border border-product-border bg-product-surface-strong/70 px-3 py-3">
						<p className="font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
							Weekend progress
						</p>
						<p className="mt-2 font-display text-3xl uppercase leading-none tracking-[0.05em] text-product-text tabular-nums">
							{mission.progressCount}/{mission.totalLessons}
						</p>
						<p className="mt-1 text-xs leading-relaxed text-product-muted">
							{block.completedCount} of {block.totalLessons} done in{" "}
							{block.label}
						</p>
					</div>
				</div>
			</div>

			<div className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
				<div className="space-y-4">
					{ctaLesson ? (
						<CurrentStepCard lesson={ctaLesson} />
					) : (
						<div className="border border-product-border bg-product-surface px-4 py-4 shadow-panel backdrop-blur-xl sm:px-5">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
										Current step
									</p>
									<h2 className="mt-2 font-display text-3xl uppercase leading-none tracking-[0.05em] text-product-text">
										{block.label} complete
									</h2>
								</div>
								<StatusBadge label="Done" tone="done" />
							</div>
							<p className="mt-4 text-sm leading-relaxed text-product-text">
								Everything in {block.label} is done.
							</p>
						</div>
					)}

					<UpcomingSteps lessons={block.upcomingLessons} />
				</div>

				<div className="space-y-4">
					<aside className="border border-product-border bg-product-surface-strong/70 px-4 py-4 shadow-panel backdrop-blur-xl">
						<p className="font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
							{block.label} progress
						</p>
						<div className="mt-3 flex items-end justify-between gap-3">
							<div>
								<p className="font-display text-3xl uppercase leading-none tracking-[0.05em] text-product-text tabular-nums">
									{block.completedCount}/{block.totalLessons}
								</p>
								<p className="mt-1 text-xs leading-relaxed text-product-muted">
									lessons done
								</p>
							</div>
							<StatusBadge label={`${block.pct}%`} tone={blockBadgeTone} />
						</div>
						<ProgressBar value={block.pct} />
						<p className="mt-4 font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
							What happens next
						</p>
						<p className="mt-2 text-sm leading-relaxed text-product-text">
							{unlockCopy}
						</p>
					</aside>

					{block.completedLessons.length > 0 ? (
						<section className="border border-product-border bg-product-surface px-4 py-4 shadow-panel backdrop-blur-xl">
							<p className="font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
								Done in {block.label}
							</p>
							<div className="mt-3 flex flex-wrap gap-2">
								{block.completedLessons.map((lesson) => (
									<LessonChip key={lesson.id} lesson={lesson} />
								))}
							</div>
						</section>
					) : null}
				</div>
			</div>
		</section>
	);
}

function SprintRouteRow({
	block,
	isCurrent,
}: {
	block: EnrichedBlock;
	isCurrent: boolean;
}) {
	const tone = getBlockTone(block.status, isCurrent);
	const entryLesson = block.currentLesson ?? block.allLessons[0] ?? null;
	const lastLesson = block.allLessons[block.allLessons.length - 1] ?? null;
	const routeCopy = isCurrent
		? entryLesson
			? `Now: ${entryLesson.id} ${entryLesson.shortTitle}`
			: `Done: ${block.label} is wrapped.`
		: block.status === "completed"
			? lastLesson
				? `Done through ${lastLesson.id} ${lastLesson.shortTitle}`
				: "Done"
			: block.status === "ready"
				? entryLesson
					? `Starts with ${entryLesson.id} ${entryLesson.shortTitle}`
					: "Ready to start"
				: `Unlocks after step ${Math.max(block.level - 1, 1)}`;

	return (
		<div
			className={`px-4 py-4 sm:px-5 ${
				isCurrent ? "bg-product-surface-strong/35" : ""
			}`}
		>
			<div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.8fr)]">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<span className="font-mono text-[8px] uppercase tracking-[0.2em] text-product-muted">
							Step {block.level}
						</span>
						<StatusBadge
							label={getBlockStatusLabel(block.status, isCurrent)}
							tone={tone}
						/>
					</div>
					<h3 className="mt-2 font-display text-2xl uppercase leading-none tracking-[0.05em] text-product-text">
						{block.label}
					</h3>
					<p className="mt-2 max-w-2xl text-sm leading-relaxed text-product-muted">
						{block.summary}
					</p>
					<p className="mt-3 text-xs leading-relaxed text-product-text">
						{routeCopy}
					</p>
				</div>

				<div className="min-w-0">
					<div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
						<span className="tabular-nums">
							{block.completedCount}/{block.totalLessons} done
						</span>
						<span className="tabular-nums">{block.pct}%</span>
					</div>
					<ProgressBar value={block.pct} />
				</div>
			</div>
		</div>
	);
}

function SprintRoute({
	blocks,
	currentBlockId,
}: {
	blocks: EnrichedBlock[];
	currentBlockId: BlockId;
}) {
	return (
		<section className="overflow-hidden rounded-none border border-product-border bg-product-surface shadow-panel backdrop-blur-xl">
			<div className="border-b border-product-border px-4 py-3 sm:px-5">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div>
						<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
							Full weekend
						</p>
						<h2 className="mt-1 font-display text-2xl uppercase leading-none tracking-[0.05em] text-product-text">
							Sprint route
						</h2>
					</div>
					<p className="max-w-xl text-xs leading-relaxed text-product-muted">
						The current step stays on top. This is the whole route at a glance.
					</p>
				</div>
			</div>

			<div className="divide-y divide-product-border">
				{blocks.map((block) => (
					<SprintRouteRow
						key={block.id}
						block={block}
						isCurrent={block.id === currentBlockId}
					/>
				))}
			</div>
		</section>
	);
}

function LoadingState() {
	return (
		<section className="rounded-none border border-product-border bg-product-surface/78 px-4 py-6 text-center shadow-panel backdrop-blur-xl">
			<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
				Loading
			</p>
		</section>
	);
}

export function MissionPage({ initialTheme }: { initialTheme: ProductTheme }) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const mission = useQuery(
		api.course.getMissionState,
		isAuthenticated && !isLoading ? {} : "skip",
	) as MissionState | undefined;

	const blocks = mission?.blocks.map(enrichBlock) ?? [];
	const currentBlock =
		blocks.find(
			(block) => block.status === "active" || block.status === "ready",
		) ??
		blocks[blocks.length - 1] ??
		null;
	const currentIndex = currentBlock
		? blocks.findIndex((block) => block.id === currentBlock.id)
		: -1;
	const nextBlock =
		currentIndex >= 0 ? (blocks[currentIndex + 1] ?? null) : null;

	return (
		<ProductShell
			initialTheme={initialTheme}
			viewportMode="app"
			appScrollMode="page"
			showSkillRail={false}
			currentBlockId={currentBlock?.id}
		>
			{mission === undefined || currentBlock === null ? (
				<LoadingState />
			) : (
				<div className="flex flex-1 flex-col gap-4">
					<SprintOverview
						block={currentBlock}
						nextBlock={nextBlock}
						mission={mission}
					/>
					<SprintRoute blocks={blocks} currentBlockId={currentBlock.id} />
				</div>
			)}
		</ProductShell>
	);
}
