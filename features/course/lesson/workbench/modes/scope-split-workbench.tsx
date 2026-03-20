import { Separator } from "@/components/ui/separator";
import { FocusInlineLessonVideo } from "../shared/focus-inline-lesson-video";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import { WorkbenchMediaLayout } from "../shared/workbench-media-layout";
import type { WorkbenchModeProps } from "../types";
import { ScopeSplitScopeColumn } from "./scope-split/scope-split-scope-column";
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
	layoutMode,
}: WorkbenchModeProps) {
	const showInlineVideo = lesson.coachVideoPlacement === "workbench";
	const showSplitWorkbenchMedia =
		showInlineVideo &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";
	const inlineVideoCard = (
		<FocusInlineLessonVideo coachContent={lessonContent.coach} />
	);
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

	const scopeColumn = (
		<ScopeSplitScopeColumn
			draftStatus={draftStatus}
			boundaryStatus={boundaryStatus}
			keepCount={keepCount}
			cutCount={cutCount}
			rationaleReady={rationaleReady}
			chosenUser={chosenUser}
			chosenProblem={chosenProblem}
			promisedOutcome={promisedOutcome}
			coreFlowImageUrl={coreFlowImageUrl}
			keepField={keepField}
			cutField={cutField}
			rationaleField={rationaleField}
			restFields={restFields}
			fieldValues={fieldValues}
			pinnedArtifacts={pinnedArtifacts}
			invalidFieldIds={invalidFieldIds}
			invalidFieldMessages={invalidFieldMessages}
			rationaleValue={rationaleValue}
			onManualFieldChange={handleManualFieldChange}
			lesson={lesson}
			onFieldChange={onFieldChange}
		/>
	);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator className="bg-border" />
			{showSplitWorkbenchMedia ? (
				<WorkbenchMediaLayout media={inlineVideoCard}>
					<div className="space-y-5">{scopeColumn}</div>
				</WorkbenchMediaLayout>
			) : showInlineVideo ? (
				<>
					{inlineVideoCard}
					<div className="mt-5 space-y-5">{scopeColumn}</div>
				</>
			) : (
				<>
					<StatusRail
						lessonContent={lessonContent}
						completedTaskCount={completedTaskCount}
						totalTaskCount={Math.max(objectiveTasks.length, 1)}
					/>
					<div className="space-y-5">{scopeColumn}</div>
				</>
			)}
		</WorkbenchContainer>
	);
}
