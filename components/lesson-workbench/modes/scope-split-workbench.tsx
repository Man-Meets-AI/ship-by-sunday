import { PromptImportCard } from "../shared/prompt-import-card";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import { ScopeContextCard } from "./scope-split/scope-context-card";
import { ScopeManualCards } from "./scope-split/scope-manual-cards";
import { ScopeOverviewCard } from "./scope-split/scope-overview-card";
import {
	countFilledScopeItems,
	getPinnedCoreFlowImageUrl,
	getPinnedTextValue,
	getScopeBoundaryStatus,
	getScopeDraftStatus,
	readScopeDraftSource,
	SCOPE_SOURCE_FIELD_ID,
	shouldPreserveImportedScopeSource,
} from "./scope-split/scope-split-state";

import type { WorkbenchModeProps } from "../types";

export function ScopeSplitWorkbench({
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
	const [keepField, cutField, rationaleField, ...restFields] = fields;
	const chosenUser = getPinnedTextValue(
		pinnedArtifacts,
		"user_statement",
		"selected_problem_owner",
	);
	const chosenProblem = getPinnedTextValue(
		pinnedArtifacts,
		"user_statement",
		"selected_problem_statement",
	);
	const promisedOutcome = getPinnedTextValue(
		pinnedArtifacts,
		"outcome_statement",
		"outcome",
	);
	const coreFlowImageUrl = getPinnedCoreFlowImageUrl(pinnedArtifacts);
	const keepCount = countFilledScopeItems(fieldValues[keepField?.id ?? ""]);
	const cutCount = countFilledScopeItems(fieldValues[cutField?.id ?? ""]);
	const rationaleValue =
		typeof fieldValues[rationaleField?.id ?? ""] === "string"
			? (fieldValues[rationaleField?.id ?? ""] as string)
			: "";
	const rationaleReady = rationaleValue.trim().length > 0;
	const currentSource = readScopeDraftSource(
		fieldValues[SCOPE_SOURCE_FIELD_ID],
	);
	const draftStatus =
		keepField && cutField && rationaleField
			? getScopeDraftStatus({
					fieldValues,
					keepFieldId: keepField.id,
					cutFieldId: cutField.id,
					rationaleFieldId: rationaleField.id,
				})
			: null;
	const boundaryStatus = getScopeBoundaryStatus({
		keepCount,
		cutCount,
		rationaleReady,
	});

	const handleManualFieldChange = (fieldId: string, value: unknown) => {
		onFieldChange(fieldId, value);
		if (!shouldPreserveImportedScopeSource(currentSource)) {
			onFieldChange(SCOPE_SOURCE_FIELD_ID, "manual");
		}
	};

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			{draftStatus ? (
				<ScopeOverviewCard
					keepCount={keepCount}
					cutCount={cutCount}
					rationaleReady={rationaleReady}
					draftStatus={draftStatus}
					boundaryStatus={boundaryStatus}
				/>
			) : null}
			<ScopeContextCard
				chosenUser={chosenUser}
				chosenProblem={chosenProblem}
				promisedOutcome={promisedOutcome}
				coreFlowImageUrl={coreFlowImageUrl}
			/>
			<ScopeManualCards
				keepField={keepField}
				cutField={cutField}
				rationaleField={rationaleField}
				restFields={restFields}
				fieldValues={fieldValues}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				invalidFieldMessages={invalidFieldMessages}
				keepCount={keepCount}
				cutCount={cutCount}
				chosenUser={chosenUser}
				promisedOutcome={promisedOutcome}
				rationaleValue={rationaleValue}
				onFieldChange={handleManualFieldChange}
			/>
			{lesson.promptImport ? (
				<PromptImportCard
					lesson={lesson}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					fieldValues={fieldValues}
					onImportApplied={({ promptTemplateId, source }) => {
						if (promptTemplateId !== "scope_boundary") {
							return;
						}

						onFieldChange(
							SCOPE_SOURCE_FIELD_ID,
							source === "generated" ? "generated_codex" : "imported_chatgpt",
						);
					}}
				/>
			) : null}
		</WorkbenchContainer>
	);
}
