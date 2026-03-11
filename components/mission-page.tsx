"use client";

import Image from "next/image";
import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { ProductShell } from "@/components/product-shell";
import { getLesson, getLessonHref, type BlockId } from "@/lib/course/manifest";
import { getBlockById } from "@/lib/course/registry";
import type { ProductTheme } from "@/lib/product-theme";

const blockImages: Record<BlockId, string> = {
	CEO: "/product/block-ceo.png",
	DESIGN: "/product/block-design.png",
	BUILD: "/product/block-build.png",
	SHIP: "/product/block-ship.png",
};

type LessonStatus = "available" | "completed" | "in_progress" | "locked";
type BlockStatus = "completed" | "active" | "ready" | "locked";

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

function blockStatusLabel(status: BlockStatus) {
	switch (status) {
		case "completed":
			return "Cleared";
		case "active":
			return "Current";
		case "ready":
			return "Ready";
		default:
			return "Locked";
	}
}

function lessonStatusLabel(status: LessonStatus) {
	switch (status) {
		case "completed":
			return "Cleared";
		case "in_progress":
			return "Current";
		case "available":
			return "Ready";
		default:
			return "Locked";
	}
}

function blockStatusClasses(status: BlockStatus) {
	switch (status) {
		case "completed":
			return "border-product-border bg-product-surface text-product-text";
		case "active":
			return "border-product-accent bg-product-chip text-product-accent";
		case "ready":
			return "border-product-border bg-product-surface-alt/80 text-product-text";
		default:
			return "border-product-border/50 bg-product-surface-strong/70 text-product-muted";
	}
}

function lessonCardClasses(status: LessonStatus, featured = false) {
	if (status === "completed") {
		return featured
			? "border-product-border bg-product-surface"
			: "border-product-border/60 bg-product-surface-strong/70";
	}

	if (status === "in_progress") {
		return featured
			? "border-product-accent bg-product-chip/55 shadow-[0_0_0_1px_rgba(var(--product-accent),0.15)]"
			: "border-product-accent/50 bg-product-chip/40";
	}

	if (status === "available") {
		return featured
			? "border-product-border bg-product-surface"
			: "border-product-border bg-product-surface";
	}

	return "border-product-border/50 bg-product-surface-strong/55";
}

function LevelHero({
	block,
	nextBlock,
	mission,
}: {
	block: EnrichedBlock;
	nextBlock: EnrichedBlock | null;
	mission: MissionState;
}) {
	const ctaLesson = block.currentLesson ?? block.allLessons[0] ?? null;
	const ctaLabel =
		ctaLesson?.status === "in_progress"
			? `Resume ${ctaLesson.id}`
			: `Start ${ctaLesson?.id ?? ""}`.trim();
	const unlockCopy = nextBlock
		? block.status === "completed"
			? `${nextBlock.label} is unlocked.`
			: `Clear ${block.label} to unlock ${nextBlock.label}.`
		: "Final level. Clear the remaining challenges to complete the sprint.";

	return (
		<section className="overflow-hidden rounded-none border border-product-border bg-product-surface shadow-panel backdrop-blur-xl">
			<div className="relative h-44 overflow-hidden bg-product-surface-strong sm:h-48">
				<Image
					src={blockImages[block.id]}
					alt={block.label}
					fill
					className="object-cover"
					sizes="(min-width: 1280px) 900px, 100vw"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
				<div className="absolute inset-0 flex flex-col justify-between px-4 py-4 sm:px-5">
					<div className="flex flex-wrap items-start justify-between gap-3">
						<div>
							<p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/70">
								Mission map
							</p>
							<p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/70">
								Level {block.level} of 4
							</p>
							<div className="mt-1 flex flex-wrap items-end gap-3">
								<h1 className="font-display text-4xl uppercase leading-none tracking-[0.06em] text-white sm:text-5xl">
									{block.label}
								</h1>
								<span
									className={`rounded-none border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] ${blockStatusClasses(block.status)}`}
								>
									{blockStatusLabel(block.status)}
								</span>
							</div>
						</div>
						<div className="rounded-none border border-white/20 bg-black/30 px-3 py-2 text-right backdrop-blur-sm">
							<p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/60">
								Overall progress
							</p>
							<p className="mt-1 font-display text-2xl uppercase leading-none tracking-[0.05em] text-white">
								{mission.progressCount}/{mission.totalLessons}
							</p>
						</div>
					</div>

					<p className="max-w-3xl text-sm leading-relaxed text-white/84 sm:text-[15px]">
						{block.summary}
					</p>
				</div>
			</div>

			<div className="grid gap-3 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(250px,0.9fr)]">
				<div className="space-y-3">
					<div className="grid gap-2 sm:grid-cols-3">
						<div className="border border-product-border bg-product-surface-strong/70 px-3 py-2">
							<p className="font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
								Level progress
							</p>
							<p className="mt-1 font-display text-2xl uppercase leading-none tracking-[0.05em] text-product-text">
								{block.completedCount}/{block.totalLessons}
							</p>
						</div>
						<div className="border border-product-border bg-product-surface-strong/70 px-3 py-2">
							<p className="font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
								Current challenge
							</p>
							<p className="mt-1 font-display text-2xl uppercase leading-none tracking-[0.05em] text-product-text">
								{ctaLesson?.id ?? "--"}
							</p>
						</div>
						<div className="border border-product-border bg-product-surface-strong/70 px-3 py-2">
							<p className="font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
								Next unlock
							</p>
							<p className="mt-1 font-display text-2xl uppercase leading-none tracking-[0.05em] text-product-text">
								{nextBlock?.label ?? "DONE"}
							</p>
						</div>
					</div>

					{ctaLesson ? (
						<div className="border border-product-border bg-product-surface px-3 py-3">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<div>
									<p className="font-mono text-[8px] uppercase tracking-[0.2em] text-product-muted">
										Current challenge
									</p>
									<h2 className="mt-1 font-display text-2xl uppercase leading-none tracking-[0.05em] text-product-text">
										{ctaLesson.id} {ctaLesson.shortTitle}
									</h2>
								</div>
								<span className="font-mono text-[8px] uppercase tracking-[0.15em] text-product-muted">
									{lessonStatusLabel(ctaLesson.status)}
								</span>
							</div>
							<p className="mt-3 text-sm leading-relaxed text-product-text">
								{ctaLesson.objectiveTitle}
							</p>
							<p className="mt-2 text-xs leading-relaxed text-product-muted">
								Completion looks like: {ctaLesson.winCondition}
							</p>
							<div className="mt-3 flex flex-wrap items-center gap-3">
								<Link
									href={ctaLesson.href}
									className="inline-flex rounded-none border border-product-accent bg-product-chip px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
								>
									{ctaLabel}
								</Link>
								<span className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
									Reward: {ctaLesson.artifactLabel}
								</span>
							</div>
						</div>
					) : (
						<div className="border border-product-border bg-product-surface px-3 py-3">
							<p className="font-display text-2xl uppercase leading-none tracking-[0.05em] text-product-text">
								Level cleared
							</p>
							<p className="mt-2 text-sm leading-relaxed text-product-muted">
								Everything in {block.label} is done.
							</p>
						</div>
					)}
				</div>

				<div className="border border-product-border bg-product-surface-strong/72 px-3 py-3">
					<p className="font-mono text-[8px] uppercase tracking-[0.2em] text-product-muted">
						Unlock path
					</p>
					<p className="mt-2 text-sm leading-relaxed text-product-text">
						{unlockCopy}
					</p>
					<div className="mt-4 space-y-2">
						{block.allLessons.map((lesson) => (
							<div
								key={lesson.id}
								className={`flex items-center justify-between gap-3 border px-2.5 py-2 ${lessonCardClasses(lesson.status)}`}
							>
								<div className="min-w-0">
									<p className="font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
										{lesson.id}
									</p>
									<p className="truncate text-xs font-medium text-product-text">
										{lesson.shortTitle}
									</p>
								</div>
								<span className="font-mono text-[8px] uppercase tracking-[0.15em] text-product-muted">
									{lessonStatusLabel(lesson.status)}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

function SideLevelCard({
	block,
	copy,
}: {
	block: EnrichedBlock;
	copy: string;
}) {
	return (
		<article
			className={`overflow-hidden rounded-none border shadow-panel backdrop-blur-xl ${lessonCardClasses(
				block.status === "active"
					? "in_progress"
					: block.status === "completed"
						? "completed"
						: block.status === "ready"
							? "available"
							: "locked",
			)}`}
		>
			<div className="relative h-20 overflow-hidden bg-product-surface-strong">
				<Image
					src={blockImages[block.id]}
					alt={block.label}
					fill
					className={`object-cover ${block.status === "locked" ? "grayscale" : ""}`}
					sizes="(min-width: 1280px) 360px, 100vw"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
				<div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-3 pb-2">
					<div>
						<p className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/70">
							Level {block.level}
						</p>
						<p className="font-display text-lg uppercase leading-none tracking-[0.06em] text-white">
							{block.label}
						</p>
					</div>
					<span
						className={`rounded-none border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.15em] ${blockStatusClasses(block.status)}`}
					>
						{blockStatusLabel(block.status)}
					</span>
				</div>
			</div>
			<div className="space-y-3 px-3 py-3">
				<p className="text-xs leading-relaxed text-product-muted">
					{block.summary}
				</p>
				<div className="space-y-1.5">
					<div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
						<span>
							{block.completedCount}/{block.totalLessons} cleared
						</span>
						<span>{block.pct}%</span>
					</div>
					<div className="h-1 overflow-hidden bg-product-border/20">
						<div
							className="h-full bg-[rgb(var(--product-accent))]"
							style={{ width: `${block.pct}%` }}
						/>
					</div>
				</div>
				<p className="text-[11px] leading-relaxed text-product-muted">{copy}</p>
			</div>
		</article>
	);
}

function ChallengeCard({
	label,
	lesson,
}: {
	label: string;
	lesson: EnrichedLesson;
}) {
	const isLocked = lesson.status === "locked";

	return (
		<article
			className={`overflow-hidden rounded-none border px-3 py-3 shadow-panel backdrop-blur-xl ${lessonCardClasses(
				lesson.status,
				label === "Current challenge",
			)}`}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="font-mono text-[8px] uppercase tracking-[0.2em] text-product-muted">
						{label}
					</p>
					<h3 className="mt-2 font-display text-xl uppercase leading-none tracking-[0.05em] text-product-text">
						{lesson.id} {lesson.shortTitle}
					</h3>
				</div>
				<span className="font-mono text-[8px] uppercase tracking-[0.15em] text-product-muted">
					{lessonStatusLabel(lesson.status)}
				</span>
			</div>
			<p className="mt-3 text-sm leading-relaxed text-product-text">
				{lesson.objectiveTitle}
			</p>
			<p className="mt-2 text-xs leading-relaxed text-product-muted">
				{isLocked
					? "Unlock by clearing the current challenge."
					: `Completion looks like: ${lesson.winCondition}`}
			</p>
			<div className="mt-3 flex flex-wrap items-center gap-3">
				<span className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
					Reward: {lesson.artifactLabel}
				</span>
				{!isLocked ? (
					<Link
						href={lesson.href}
						className="inline-flex rounded-none border border-product-border bg-product-surface px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-product-text transition-colors hover:bg-product-surface-alt"
					>
						Open lesson
					</Link>
				) : null}
			</div>
		</article>
	);
}

function CurrentBlockChallenges({
	block,
	nextBlock,
}: {
	block: EnrichedBlock;
	nextBlock: EnrichedBlock | null;
}) {
	const levelTarget = block.allLessons[block.allLessons.length - 1] ?? null;

	return (
		<section className="overflow-hidden rounded-none border border-product-border bg-product-surface shadow-panel backdrop-blur-xl">
			<div className="border-b border-product-border px-4 py-3 sm:px-5">
				<div className="flex flex-wrap items-end justify-between gap-2">
					<div>
						<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
							Current block challenges
						</p>
						<h2 className="mt-1 font-display text-2xl uppercase leading-none tracking-[0.05em] text-product-text">
							{block.label} level
						</h2>
					</div>
					<span className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
						{block.completedCount}/{block.totalLessons} cleared
					</span>
				</div>
			</div>

			<div className="space-y-4 px-4 py-4 sm:px-5">
				{block.completedLessons.length > 0 ? (
					<div>
						<p className="font-mono text-[8px] uppercase tracking-[0.2em] text-product-muted">
							Cleared
						</p>
						<div className="mt-2 flex flex-wrap gap-2">
							{block.completedLessons.map((lesson) => (
								<div
									key={lesson.id}
									className="inline-flex items-center gap-2 border border-product-border bg-product-surface-strong/70 px-2.5 py-1.5"
								>
									<span className="font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
										{lesson.id}
									</span>
									<span className="text-xs font-medium text-product-text">
										{lesson.shortTitle}
									</span>
								</div>
							))}
						</div>
					</div>
				) : null}

				{block.currentLesson ? (
					<ChallengeCard
						label="Current challenge"
						lesson={block.currentLesson}
					/>
				) : (
					<div className="border border-product-border bg-product-surface-strong/70 px-3 py-4">
						<p className="font-display text-2xl uppercase leading-none tracking-[0.05em] text-product-text">
							Block cleared
						</p>
						<p className="mt-2 text-sm leading-relaxed text-product-muted">
							{nextBlock
								? `${nextBlock.label} is unlocked. Move into the next level from the mission path below.`
								: "All levels are cleared. The sprint is complete."}
						</p>
					</div>
				)}

				{block.upcomingLessons.length > 0 ? (
					<div className="grid gap-3 lg:grid-cols-2">
						{block.upcomingLessons.map((lesson, index) => (
							<ChallengeCard
								key={lesson.id}
								label={index === 0 ? "Up next" : "Queued"}
								lesson={lesson}
							/>
						))}
					</div>
				) : null}

				{levelTarget ? (
					<div className="border border-product-border bg-product-surface-strong/70 px-3 py-3">
						<p className="font-mono text-[8px] uppercase tracking-[0.2em] text-product-muted">
							Level-up target
						</p>
						<p className="mt-2 text-sm leading-relaxed text-product-text">
							Clear {levelTarget.id} {levelTarget.shortTitle} to finish{" "}
							{block.label}
							{nextBlock ? ` and unlock ${nextBlock.label}.` : "."}
						</p>
					</div>
				) : null}
			</div>
		</section>
	);
}

function MissionPath({ blocks }: { blocks: EnrichedBlock[] }) {
	return (
		<section className="overflow-hidden rounded-none border border-product-border bg-product-surface shadow-panel backdrop-blur-xl">
			<div className="border-b border-product-border px-4 py-3 sm:px-5">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div>
						<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
							Mission path
						</p>
						<h2 className="mt-1 font-display text-2xl uppercase leading-none tracking-[0.05em] text-product-text">
							All levels
						</h2>
					</div>
					<p className="max-w-xl text-xs leading-relaxed text-product-muted">
						The active level stays primary above. This is the full sprint route.
					</p>
				</div>
			</div>

			<div className="divide-y divide-product-border">
				{blocks.map((block) => (
					<div key={block.id} className="px-4 py-4 sm:px-5">
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div>
								<div className="flex flex-wrap items-center gap-2">
									<span className="font-mono text-[8px] uppercase tracking-[0.2em] text-product-muted">
										Level {block.level}
									</span>
									<span
										className={`rounded-none border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.15em] ${blockStatusClasses(block.status)}`}
									>
										{blockStatusLabel(block.status)}
									</span>
								</div>
								<h3 className="mt-2 font-display text-2xl uppercase leading-none tracking-[0.05em] text-product-text">
									{block.label}
								</h3>
								<p className="mt-2 max-w-2xl text-sm leading-relaxed text-product-muted">
									{block.summary}
								</p>
							</div>
							<div className="min-w-[170px]">
								<div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
									<span>
										{block.completedCount}/{block.totalLessons} cleared
									</span>
									<span>{block.pct}%</span>
								</div>
								<div className="mt-1.5 h-1 overflow-hidden bg-product-border/20">
									<div
										className="h-full bg-[rgb(var(--product-accent))]"
										style={{ width: `${block.pct}%` }}
									/>
								</div>
							</div>
						</div>

						<div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
							{block.allLessons.map((lesson) => {
								const card = (
									<div
										className={`flex min-h-[88px] flex-col justify-between border px-3 py-2 ${lessonCardClasses(
											lesson.status,
										)}`}
									>
										<div className="flex items-start justify-between gap-3">
											<span className="font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
												{lesson.id}
											</span>
											<span className="font-mono text-[8px] uppercase tracking-[0.15em] text-product-muted">
												{lessonStatusLabel(lesson.status)}
											</span>
										</div>
										<div>
											<p className="text-sm font-medium leading-tight text-product-text">
												{lesson.shortTitle}
											</p>
											<p className="mt-2 text-[11px] leading-relaxed text-product-muted">
												{lesson.artifactLabel}
											</p>
										</div>
									</div>
								);

								if (lesson.status === "locked") {
									return <div key={lesson.id}>{card}</div>;
								}

								return (
									<Link key={lesson.id} href={lesson.href}>
										{card}
									</Link>
								);
							})}
						</div>
					</div>
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
	const sideBlocks = blocks.filter((block) => block.id !== currentBlock?.id);

	return (
		<ProductShell
			initialTheme={initialTheme}
			viewportMode="app"
			showSkillRail={false}
			currentBlockId={currentBlock?.id}
		>
			{mission === undefined || currentBlock === null ? (
				<LoadingState />
			) : (
				<div className="flex flex-1 flex-col gap-3 xl:min-h-0 xl:overflow-y-auto">
					<div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.95fr)]">
						<LevelHero
							block={currentBlock}
							nextBlock={nextBlock}
							mission={mission}
						/>

						<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
							{sideBlocks.map((block) => {
								const copy =
									block.status === "completed"
										? "This level is already cleared."
										: block.status === "ready"
											? "This level is unlocked and ready."
											: `Clear level ${Math.max(block.level - 1, 1)} to unlock this stage.`;

								return (
									<SideLevelCard key={block.id} block={block} copy={copy} />
								);
							})}
						</div>
					</div>

					<CurrentBlockChallenges block={currentBlock} nextBlock={nextBlock} />
					<MissionPath blocks={blocks} />
				</div>
			)}
		</ProductShell>
	);
}
