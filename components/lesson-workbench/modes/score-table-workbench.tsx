import { FieldControl } from "../fields/field-control";
import { FieldList } from "../fields/field-list";
import { PromptImportCard } from "../shared/prompt-import-card";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import type { WorkbenchModeProps } from "../types";

function getPinnedTextValue(
	pinnedArtifacts: WorkbenchModeProps["pinnedArtifacts"],
	artifactKey: string,
	fieldId: string,
) {
	const artifact = pinnedArtifacts.find(
		(candidate) => candidate.artifactKey === artifactKey,
	);
	const value = artifact?.fieldValues?.[fieldId];
	if (typeof value !== "string") {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export function ScoreTableWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
	fields,
	objectiveTasks,
	completedTaskCount,
}: WorkbenchModeProps) {
	const promptImport =
		lesson.promptImport?.promptTemplateId === "competitor_research"
			? lesson.promptImport
			: undefined;
	const tableField = promptImport
		? (fields.find((field) => field.id === promptImport.tableFieldId) ??
			fields[0])
		: fields[0];
	const restFields = promptImport
		? fields.filter((field) => field.id !== promptImport.tableFieldId)
		: fields.slice(1);
	const researchUser = getPinnedTextValue(
		pinnedArtifacts,
		"user_statement",
		"selected_problem_owner",
	);
	const researchProblem = getPinnedTextValue(
		pinnedArtifacts,
		"user_statement",
		"selected_problem_statement",
	);
	const promisedOutcome = getPinnedTextValue(
		pinnedArtifacts,
		"outcome_statement",
		"outcome",
	);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			{researchUser || promisedOutcome ? (
				<WorkbenchCard label="Research target">
					<div className="space-y-2">
						<p className="text-[11px] font-medium leading-snug text-product-muted">
							Look for evidence that this outcome matters and how current
							options handle it. Keep the research anchored to this exact bet.
						</p>
						<div className="grid gap-2 md:grid-cols-2">
							<div className="rounded-none border border-product-border/80 bg-product-surface-strong/70 px-3 py-2">
								<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
									User
								</p>
								<p className="mt-1 text-sm leading-snug text-product-text">
									{researchUser ?? "Use your saved user from 1.2."}
								</p>
								{researchProblem ? (
									<p className="mt-1 text-[11px] leading-relaxed text-product-muted">
										Problem: {researchProblem}
									</p>
								) : null}
							</div>
							<div className="rounded-none border border-product-border/80 bg-product-surface-strong/70 px-3 py-2">
								<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
									Promise to pressure-test
								</p>
								<p className="mt-1 text-sm leading-snug text-product-text">
									{promisedOutcome ?? "Use your saved outcome from 1.3."}
								</p>
							</div>
						</div>
					</div>
				</WorkbenchCard>
			) : null}
			{promptImport ? (
				<PromptImportCard
					lesson={lesson}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					fieldValues={fieldValues}
				/>
			) : null}
			{tableField ? (
				<WorkbenchCard label="Research table">
					<div className="mb-3 space-y-1.5">
						<p className="text-sm leading-relaxed text-product-text">
							Start with 2-3 quick scans of real alternatives or current
							workarounds.
						</p>
						<p className="text-[11px] font-medium leading-snug text-product-muted">
							For each row, note one concrete surface you checked in{" "}
							<span className="text-product-text">Evidence Seen</span>. If you
							are inferring, say it briefly.
						</p>
					</div>
					<FieldControl
						field={tableField}
						value={fieldValues[tableField.id]}
						onChange={(value) => onFieldChange(tableField.id, value)}
						pinnedArtifacts={pinnedArtifacts}
						showLabel={false}
					/>
				</WorkbenchCard>
			) : null}
			<FieldList
				fields={restFields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				invalidFieldMessages={invalidFieldMessages}
				className={
					restFields.length > 1 ? "grid gap-2 md:grid-cols-2" : "space-y-2"
				}
			/>
		</WorkbenchContainer>
	);
}
