"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import type { WorkbenchField } from "@/lib/course/lesson/model/manifest";

import { ChecklistFieldRows } from "../../fields/checklist-field-rows";

const DEFAULT_INVALID_MESSAGE = "Finish this before continuing.";

export function ProductionDeployHandoffChecklistCard({
	field,
	fieldValue,
	onFieldChange,
	invalid = false,
	invalidMessage = DEFAULT_INVALID_MESSAGE,
	headerTitle,
	headerDescription,
}: {
	field: WorkbenchField | undefined;
	fieldValue: unknown;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalid?: boolean;
	invalidMessage?: string;
	/** When set, overrides `field.label` in the card header. */
	headerTitle?: string;
	/** When set, overrides `field.helpText` in the card header. */
	headerDescription?: string;
}) {
	if (!field || field.kind !== "checklist" || !field.options?.length) {
		return null;
	}

	const title = headerTitle ?? field.label;
	const description = headerDescription ?? field.helpText;

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">{title}</CardTitle>
				{description ? <CardDescription>{description}</CardDescription> : null}
			</CardHeader>
			<CardContent className="space-y-3">
				<ChecklistFieldRows
					field={field}
					value={fieldValue}
					className="overflow-hidden rounded-lg border border-border"
					onChange={(nextItems) => onFieldChange(field.id, nextItems)}
				/>
				{invalid ? <FieldError>{invalidMessage}</FieldError> : null}
			</CardContent>
		</Card>
	);
}
