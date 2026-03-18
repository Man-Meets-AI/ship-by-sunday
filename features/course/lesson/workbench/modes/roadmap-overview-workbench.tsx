import type { BlockId } from "@/features/course/lesson/model/manifest";
import {
	getOrderedBlocks,
	getStudentFacingLessons,
} from "@/features/course/lesson/model/registry";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import { WorkbenchHeaderLabel } from "../shared/workbench-header-label";
import { workbenchChromeLabelClass } from "../shared/workbench-readability";
import type { WorkbenchModeProps } from "../types";

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
			<div className="border border-product-border/55 bg-product-surface-strong/70 px-4 py-4">
				<p className={workbenchChromeLabelClass}>Sprint roadmap</p>
				<p className="mt-2 max-w-[60ch] text-[13px] leading-[1.7] text-product-muted">
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
								<WorkbenchHeaderLabel as="p">
									{block.label}
								</WorkbenchHeaderLabel>
								<span className="font-mono text-[10px] uppercase tracking-[0.15em] text-product-muted">
									{block.lessons.length} lessons
								</span>
							</div>
							<p className="mt-2 text-[13px] leading-[1.6] text-product-muted">
								{block.description}
							</p>
						</div>
						<div className="space-y-0.5 px-3 py-2">
							{block.lessons.map((lesson) => (
								<div
									key={lesson.id}
									className="flex items-baseline gap-2 border-b border-product-border/30 py-1 last:border-b-0"
								>
									<span className="font-mono text-[10px] uppercase tracking-[0.15em] text-product-muted">
										{lesson.id}
									</span>
									<span className="text-[13px] leading-[1.45] text-product-text">
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
