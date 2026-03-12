import type { LessonHandoff } from "@/lib/course/manifest";
import { getCandidateProblemOptions, isFilled } from "@/lib/course/registry";

import type { WorkbenchModeProps } from "../types";
import { FieldList } from "../fields/field-list";
import { ArtifactContext } from "../shared/artifact-context";
import { SectionCard } from "../shared/section-card";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";

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
		<WorkbenchCard title="Choose one candidate problem" eyebrow="Carry forward">
			<div className="space-y-3">
				<p className="max-w-2xl text-[12px] leading-relaxed text-product-muted">
					Pick one of the three problems you just wrote. This becomes your
					working direction for the next CEO lessons.
				</p>
				{selectedProblem ? (
					<div className="space-y-3">
						<div className="border border-product-accent/60 bg-product-chip/50 px-3 py-3">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<div>
									<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
										Chosen direction
									</p>
									<p className="mt-1 font-display text-sm uppercase tracking-[0.04em] text-product-text">
										Candidate problem {selectedProblem.index}
									</p>
								</div>
								<button
									type="button"
									onClick={() => {
										onFieldChange(handoff.selectionFieldId, null);
										for (const field of persistedFields) {
											onFieldChange(field.targetFieldId, "");
										}
									}}
									className="inline-flex border border-product-border bg-product-surface px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-product-text transition-colors hover:bg-product-surface-alt"
								>
									Change selection
								</button>
							</div>
							<div className="mt-3 space-y-2 text-[12px] leading-relaxed text-product-text">
								<div>
									<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
										Problem owner
									</p>
									<p className="mt-1">{selectedProblem.owner}</p>
								</div>
								<div>
									<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
										Problem statement
									</p>
									<p className="mt-1">{selectedProblem.statement}</p>
								</div>
							</div>
						</div>
						<p className="text-[11px] leading-relaxed text-product-muted">
							Now define the specific user inside this chosen problem.
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
								className="border border-product-border bg-product-surface px-3 py-3 text-left transition-colors hover:bg-product-surface-strong"
							>
								<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
									Candidate {problem.index}
								</p>
								<p className="mt-2 font-display text-sm uppercase tracking-[0.04em] text-product-text">
									{problem.owner}
								</p>
								<p className="mt-2 text-[12px] leading-relaxed text-product-text">
									{problem.statement}
								</p>
								<p className="mt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
									Use this problem
								</p>
							</button>
						))}
					</div>
				) : (
					<div className="border border-dashed border-product-border bg-product-surface px-3 py-3 text-[12px] leading-relaxed text-product-muted">
						The candidate problems from the last lesson are not available yet.
						Go back to `1.1` and finish that page first.
					</div>
				)}
				{invalidFieldIds.has(handoff.selectionFieldId) ? (
					<p className="text-[11px] font-medium leading-relaxed text-[#a83232]">
						Choose one candidate problem before continuing.
					</p>
				) : null}
			</div>
		</WorkbenchCard>
	);
}

export function GuidedFormWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
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

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			{lesson.handoff?.mode === "select_candidate_problem" ? (
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
							blockedMessage={
								blocked
									? "First, choose one candidate problem above to unlock this section."
									: undefined
							}
						>
							<FieldList
								fields={sectionFields}
								fieldValues={fieldValues}
								onFieldChange={onFieldChange}
								pinnedArtifacts={pinnedArtifacts}
								invalidFieldIds={invalidFieldIds}
								className={layoutClass}
							/>
						</SectionCard>
					);
				})}
			</div>
		</WorkbenchContainer>
	);
}
