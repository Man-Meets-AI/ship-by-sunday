import { LessonVideoSurface } from "@/components/lesson-video-surface";
import type { LessonHandoff } from "@/lib/course/manifest";
import { getCandidateProblemOptions, isFilled } from "@/lib/course/registry";

import type { WorkbenchModeProps } from "../types";
import { FieldList } from "../fields/field-list";
import { ArtifactContext } from "../shared/artifact-context";
import { SectionCard } from "../shared/section-card";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeaderLabel } from "../shared/workbench-header-label";
import { WorkbenchHeader } from "../shared/workbench-header";
import { PickOneUserSupport } from "./pick-one-user-support";
import { StartWithProblemSupport } from "./start-with-problem-support";

const HANDOFF_TITLE = "Pick the problem to carry forward";
const HANDOFF_HELPER_COPY =
	"Pick one of the three problems you just wrote. This becomes your working direction for the next CEO lessons.";
const HANDOFF_SELECTED_COPY =
	"The selected problem owner is your user. Now ground this direction in a real moment, a current workaround, and a path to reach them.";
const HANDOFF_BLOCKED_COPY =
	"First, pick the problem to carry forward above to unlock this section.";
const HANDOFF_INVALID_COPY =
	"Pick the problem to carry forward before continuing.";

function CandidateProblemHandoff({
	handoff,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
}: {
	handoff: LessonHandoff;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: WorkbenchModeProps["pinnedArtifacts"];
	invalidFieldIds: Set<string>;
}) {
	const sourceArtifact = pinnedArtifacts.find(
		(artifact) => artifact.artifactKey === handoff.sourceArtifactKey,
	);
	const candidateProblems = getCandidateProblemOptions(
		handoff,
		sourceArtifact?.fieldValues,
	);
	const persistedFields = handoff.persistedFields ?? [];
	const selectedProblemIndex =
		typeof fieldValues[handoff.selectionFieldId] === "number"
			? (fieldValues[handoff.selectionFieldId] as number)
			: typeof fieldValues[handoff.selectionFieldId] === "string"
				? Number(fieldValues[handoff.selectionFieldId])
				: null;
	const selectedProblem =
		selectedProblemIndex !== null
			? candidateProblems.find(
					(problem) => problem.index === selectedProblemIndex,
				)
			: null;

	return (
		<section className="rounded-none border border-product-border/70 bg-product-surface/55">
			<div className="border-b border-product-border/60 px-4 py-3">
				<WorkbenchHeaderLabel as="h2">{HANDOFF_TITLE}</WorkbenchHeaderLabel>
				<p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-product-muted">
					{HANDOFF_HELPER_COPY}
				</p>
			</div>
			<div className="space-y-4 px-4 py-4">
				{selectedProblem ? (
					<div className="space-y-4">
						<div className="border border-product-accent/60 bg-product-chip/50">
							<div className="border-b border-product-border/60 px-4 py-3">
								<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
									Problem {selectedProblem.index}
								</p>
							</div>
							<div className="space-y-3 px-4 py-4 text-[12px] leading-relaxed text-product-text">
								<div>
									<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
										Chosen user
									</p>
									<p className="mt-1 font-display text-sm uppercase tracking-[0.04em] text-product-text">
										{selectedProblem.owner}
									</p>
								</div>
								<div>
									<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
										Chosen problem
									</p>
									<p className="mt-1">{selectedProblem.statement}</p>
								</div>
							</div>
							<div className="border-t border-product-border/60 px-4 py-3">
								<button
									type="button"
									onClick={() => {
										onFieldChange(handoff.selectionFieldId, null);
										for (const field of persistedFields) {
											onFieldChange(field.targetFieldId, "");
										}
									}}
									className="inline-flex border border-product-border bg-product-surface px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-product-text transition-colors hover:bg-product-surface-alt focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[rgb(var(--product-accent))]"
								>
									Change selection
								</button>
							</div>
						</div>
						<p className="text-[11px] leading-relaxed text-product-muted">
							{HANDOFF_SELECTED_COPY}
						</p>
					</div>
				) : candidateProblems.length > 0 ? (
					<div className="grid gap-3 lg:grid-cols-3">
						{candidateProblems.map((problem) => (
							<button
								key={problem.index}
								type="button"
								onClick={() => {
									onFieldChange(handoff.selectionFieldId, problem.index);
									for (const field of persistedFields) {
										onFieldChange(
											field.targetFieldId,
											field.source === "owner"
												? problem.owner
												: problem.statement,
										);
									}
								}}
								className="flex h-full flex-col border border-product-border bg-product-surface px-4 py-4 text-left transition-colors hover:bg-product-surface-strong focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[rgb(var(--product-accent))]"
							>
								<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
									Problem {problem.index}
								</p>
								<p className="mt-3 font-display text-sm uppercase tracking-[0.04em] text-product-text">
									{problem.owner}
								</p>
								<p className="mt-3 flex-1 text-[12px] leading-relaxed text-product-text">
									{problem.statement}
								</p>
								<div className="mt-4 border-t border-product-border/60 pt-3">
									<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
										Use this problem
									</p>
								</div>
							</button>
						))}
					</div>
				) : (
					<div className="border border-dashed border-product-border bg-product-surface px-4 py-4 text-[12px] leading-relaxed text-product-muted">
						The problems from the last lesson are not available yet. Go back to
						`1.1` and finish that page first.
					</div>
				)}
				{invalidFieldIds.has(handoff.selectionFieldId) ? (
					<p className="text-[11px] font-medium leading-relaxed text-[#a83232]">
						{HANDOFF_INVALID_COPY}
					</p>
				) : null}
			</div>
		</section>
	);
}

export function GuidedFormWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
	fields,
	objectiveTasks,
	workbenchSections,
	sectionStates,
	completedTaskCount,
}: WorkbenchModeProps) {
	const visiblePinnedArtifacts = lesson.handoff
		? pinnedArtifacts.filter(
				(artifact) =>
					artifact.artifactKey !== lesson.handoff?.sourceArtifactKey,
			)
		: pinnedArtifacts;
	const showInlineVideo = lesson.coachVideoPlacement === "workbench";
	const showStartWithProblemSupport = lesson.id === "1.1";
	const showPickOneUserSupport = lesson.id === "1.2";

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			{showInlineVideo ? (
				<WorkbenchCard label="Watch first">
					<LessonVideoSurface
						coachContent={lessonContent.coach}
						variant="watch-shell"
					/>
				</WorkbenchCard>
			) : (
				<StatusRail
					lessonContent={lessonContent}
					completedTaskCount={completedTaskCount}
					totalTaskCount={Math.max(objectiveTasks.length, 1)}
				/>
			)}
			{showStartWithProblemSupport ? (
				<StartWithProblemSupport
					lessonContent={lessonContent}
					fieldValues={fieldValues}
				/>
			) : null}
			{showPickOneUserSupport && lesson.handoff?.mode === "select_candidate_problem" ? (
				<PickOneUserSupport
					handoff={lesson.handoff}
					fieldValues={fieldValues}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					invalidFieldIds={invalidFieldIds}
				/>
			) : null}
			{!showPickOneUserSupport &&
			lesson.handoff?.mode === "select_candidate_problem" ? (
				<CandidateProblemHandoff
					handoff={lesson.handoff}
					fieldValues={fieldValues}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					invalidFieldIds={invalidFieldIds}
				/>
			) : null}
			<ArtifactContext pinnedArtifacts={visiblePinnedArtifacts} />
			<div className="space-y-3">
				{workbenchSections.map((section) => {
					const sectionFields = fields.filter((field) =>
						section.fieldIds.includes(field.id),
					);
					const sectionState = sectionStates.find(
						(state) => state.id === section.id,
					);
					const blocked = (section.blockedByFieldIds ?? []).some(
						(fieldId) => !isFilled(fieldValues[fieldId] as any),
					);
					const layoutClass =
						section.layout === "split"
							? "grid gap-3 lg:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)]"
							: section.layout === "compact"
								? "grid gap-3 md:grid-cols-2"
								: "space-y-3";

					return (
						<SectionCard
							key={section.id}
							section={section}
							isComplete={sectionState?.isComplete ?? false}
							blocked={blocked}
							blockedMessage={blocked ? HANDOFF_BLOCKED_COPY : undefined}
						>
							<FieldList
								fields={sectionFields}
								fieldValues={fieldValues}
								onFieldChange={onFieldChange}
								pinnedArtifacts={pinnedArtifacts}
								invalidFieldIds={invalidFieldIds}
								invalidFieldMessages={invalidFieldMessages}
								className={layoutClass}
							/>
						</SectionCard>
					);
				})}
			</div>
		</WorkbenchContainer>
	);
}
