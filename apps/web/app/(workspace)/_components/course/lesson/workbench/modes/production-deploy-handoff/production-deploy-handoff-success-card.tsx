"use client";

import { ProductionDeployHandoffChecklistCard } from "./production-deploy-handoff-checklist-card";
import type { WorkbenchField } from "@/lib/course/lesson/model/manifest";

export function ProductionDeployHandoffSuccessCard({
	field,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
	invalidFieldMessages,
}: {
	field: WorkbenchField | undefined;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
	invalidFieldMessages: Map<string, string>;
}) {
	if (!field) {
		return null;
	}

	return (
		<ProductionDeployHandoffChecklistCard
			field={field}
			fieldValue={fieldValues[field.id]}
			onFieldChange={onFieldChange}
			invalid={invalidFieldIds.has(field.id)}
			invalidMessage={invalidFieldMessages.get(field.id)}
			headerTitle="Success checks"
			headerDescription="Optional tracking—tick these when you have verified each item."
		/>
	);
}
