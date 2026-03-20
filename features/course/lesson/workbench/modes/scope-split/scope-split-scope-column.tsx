import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";
import { PromptImportCard } from "../../shared/prompt-import-card";
import type { WorkbenchModeProps } from "../../types";
import { ScopeContextCard } from "./scope-context-card";
import { ScopeManualCards } from "./scope-manual-cards";
import { ScopeOverviewCard } from "./scope-overview-card";
import { SCOPE_SOURCE_FIELD_ID } from "./scope-split-state";

type DraftStatus = {
	label: string;
	detail: string;
	tone: "neutral" | "accent";
};

type BoundaryStatus = {
	label: string;
	detail: string;
	isReady: boolean;
};

type ScopeSplitScopeColumnProps = {
	draftStatus: DraftStatus | null;
	boundaryStatus: BoundaryStatus;
	keepCount: number;
	cutCount: number;
	rationaleReady: boolean;
	chosenUser: string | null;
	chosenProblem: string | null;
	promisedOutcome: string | null;
	coreFlowImageUrl: string | null;
	keepField: WorkbenchField | undefined;
	cutField: WorkbenchField | undefined;
	rationaleField: WorkbenchField | undefined;
	restFields: WorkbenchField[];
	fieldValues: WorkbenchModeProps["fieldValues"];
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: WorkbenchModeProps["invalidFieldIds"];
	invalidFieldMessages: WorkbenchModeProps["invalidFieldMessages"];
	rationaleValue: string;
	onManualFieldChange: (fieldId: string, value: unknown) => void;
	lesson: WorkbenchModeProps["lesson"];
	onFieldChange: WorkbenchModeProps["onFieldChange"];
};

export function ScopeSplitScopeColumn({
	draftStatus,
	boundaryStatus,
	keepCount,
	cutCount,
	rationaleReady,
	chosenUser,
	chosenProblem,
	promisedOutcome,
	coreFlowImageUrl,
	keepField,
	cutField,
	rationaleField,
	restFields,
	fieldValues,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
	rationaleValue,
	onManualFieldChange,
	lesson,
	onFieldChange,
}: ScopeSplitScopeColumnProps) {
	return (
		<>
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
				onFieldChange={onManualFieldChange}
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
		</>
	);
}
