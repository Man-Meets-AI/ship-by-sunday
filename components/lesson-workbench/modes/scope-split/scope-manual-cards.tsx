import { FieldList } from "../../fields/field-list";
import { ScopeListEditorCard } from "./scope-list-editor-card";
import { ScopeRationaleCard } from "./scope-rationale-card";
import { getScopeItems } from "./scope-split-state";

import type { PinnedArtifact } from "@/components/lesson-shells";
import type { WorkbenchField } from "@/lib/course/manifest";

type ScopeManualCardsProps = {
	keepField?: WorkbenchField;
	cutField?: WorkbenchField;
	rationaleField?: WorkbenchField;
	restFields: WorkbenchField[];
	fieldValues: Record<string, unknown>;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
	invalidFieldMessages: Map<string, string>;
	keepCount: number;
	cutCount: number;
	chosenUser: string | null;
	promisedOutcome: string | null;
	rationaleValue: string;
	onFieldChange: (fieldId: string, value: unknown) => void;
};

export function ScopeManualCards({
	keepField,
	cutField,
	rationaleField,
	restFields,
	fieldValues,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
	keepCount,
	cutCount,
	chosenUser,
	promisedOutcome,
	rationaleValue,
	onFieldChange,
}: ScopeManualCardsProps) {
	return (
		<>
			{keepField ? (
				<ScopeListEditorCard
					field={keepField}
					items={getScopeItems(fieldValues[keepField.id])}
					stepNumber={1}
					description="Keep only the capabilities the saved user needs to reach the promised win."
					orderHint="Put the one non-negotiable capability first. 3-5 keep items max."
					addButtonLabel="Add keep item"
					rowPlaceholder="One essential capability"
					countLabel={`${keepCount}/5 named`}
					supportText={
						keepCount > 5
							? "Cut harder. More than five keep items usually means the v1 is still too big."
							: keepCount >= 3
								? "Good. Order the essentials from most critical to least."
								: "Aim for 3-5 essentials that directly move the user through the core flow."
					}
					healthy={keepCount >= 3 && keepCount <= 5}
					invalidMessage={
						invalidFieldIds.has(keepField.id)
							? invalidFieldMessages.get(keepField.id)
							: undefined
					}
					onChange={(value) => onFieldChange(keepField.id, value)}
				/>
			) : null}
			{cutField ? (
				<ScopeListEditorCard
					field={cutField}
					items={getScopeItems(fieldValues[cutField.id])}
					stepNumber={2}
					description="Name the extras you want later so they stop pretending to belong in the first weekend build."
					orderHint="Cut the features that sound impressive but are not required for the saved core flow."
					addButtonLabel="Add cut item"
					rowPlaceholder="One deliberate cut"
					countLabel={`${cutCount} cuts`}
					supportText={
						cutCount >= 3
							? "Good. You have named the tempting extras that do not belong in v1."
							: "Name at least three tempting extras you are deliberately cutting."
					}
					healthy={cutCount >= 3}
					invalidMessage={
						invalidFieldIds.has(cutField.id)
							? invalidFieldMessages.get(cutField.id)
							: undefined
					}
					onChange={(value) => onFieldChange(cutField.id, value)}
				/>
			) : null}
			{rationaleField ? (
				<ScopeRationaleCard
					field={rationaleField}
					value={rationaleValue}
					chosenUser={chosenUser}
					promisedOutcome={promisedOutcome}
					invalidMessage={
						invalidFieldIds.has(rationaleField.id)
							? invalidFieldMessages.get(rationaleField.id)
							: undefined
					}
					onChange={(value) => onFieldChange(rationaleField.id, value)}
				/>
			) : null}
			{restFields.length > 0 ? (
				<FieldList
					fields={restFields}
					fieldValues={fieldValues}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					invalidFieldIds={invalidFieldIds}
					invalidFieldMessages={invalidFieldMessages}
					className="space-y-2"
				/>
			) : null}
		</>
	);
}
