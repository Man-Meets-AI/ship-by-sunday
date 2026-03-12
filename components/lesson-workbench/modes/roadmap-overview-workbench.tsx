import type { BlockId } from "@/lib/course/manifest";
import {
	getOrderedBlocks,
	getStudentFacingLessons,
} from "@/lib/course/registry";

import type { WorkbenchModeProps } from "../types";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";

const roadmapBlockDescriptionsById: Record<BlockId, string> = {
	CEO: "Choose the problem, user, outcome, flow, and scope before you build.",
	DESIGN:
		"Turn the brief into screens and decisions so the build is translation, not guessing.",
	BUILD: "Use AI and your tools to implement the core flow without spiraling.",
	SHIP: "Deploy, demo, share, and capture the first feedback loop.",
};

function normalizeRoadmapBlockDescription(
	blockLabel: string,
	description: string,
) {
	return description.replace(
		new RegExp(`^${blockLabel}\\s+Block\\s*=\\s*`, "i"),
		"",
	);
}

function SprintRoadmapOverview({
	lessonContent,
}: {
	lessonContent: WorkbenchModeProps["lessonContent"];
}) {
	const orderedBlocks = getOrderedBlocks().map((block, index) => ({
		...block,
		description: normalizeRoadmapBlockDescription(
			block.label,
			lessonContent.workbench.teachingPoints?.[index] ??
				roadmapBlockDescriptionsById[block.id],
		),
		lessons: getStudentFacingLessons().filter(
			(lesson) => lesson.block === block.id,
		),
	}));

	return (
		<div className="space-y-2">
			<div className="border border-product-border bg-product-surface-strong/70 px-3 py-2">
				<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
					Sprint roadmap
				</p>
				<p className="mt-1 text-[11px] leading-relaxed text-product-muted">
					Each block solves a different problem. Move through them in order so
					each rep makes the next one easier.
				</p>
			</div>
			<div className="grid gap-2 xl:grid-cols-4">
				{orderedBlocks.map((block) => (
					<section
						key={block.id}
						className="rounded-none border border-product-border bg-product-surface-strong/80"
					>
						<div className="border-b border-product-border px-3 py-2">
							<div className="flex items-center justify-between gap-2">
								<p className="font-display text-sm uppercase tracking-[0.06em] text-product-text">
									{block.label}
								</p>
								<span className="font-mono text-[8px] uppercase tracking-[0.15em] text-product-muted">
									{block.lessons.length} lessons
								</span>
							</div>
							<p className="mt-1 text-[11px] leading-snug text-product-muted">
								{block.description}
							</p>
						</div>
						<div className="space-y-0.5 px-3 py-2">
							{block.lessons.map((lesson) => (
								<div
									key={lesson.id}
									className="flex items-baseline gap-2 border-b border-product-border/30 py-1 last:border-b-0"
								>
									<span className="font-mono text-[8px] uppercase tracking-[0.15em] text-product-muted">
										{lesson.id}
									</span>
									<span className="text-[11px] leading-tight text-product-text">
										{lesson.shortTitle}
									</span>
								</div>
							))}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}

export function RoadmapOverviewWorkbench({
	lesson,
	lessonContent,
	objectiveTasks,
	completedTaskCount,
}: WorkbenchModeProps) {
	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			<SprintRoadmapOverview lessonContent={lessonContent} />
		</WorkbenchContainer>
	);
}
