"use client";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import { ChecklistFieldRows } from "../../fields/checklist-field-rows";

type Props = {
	field: WorkbenchField | undefined;
	value: unknown;
	onChange: (value: unknown) => void;
	invalid: boolean;
};

export function RouteAccessInspectionChecklist({
	field,
	value,
	onChange,
	invalid,
}: Props) {
	if (!field || field.kind !== "checklist") {
		return null;
	}

	return (
		<Card>
			<CardHeader className="space-y-2 pb-3">
				<CardTitle className="text-base font-semibold">
					Inspection workflow
				</CardTitle>
				<CardDescription>
					Check each step when you’ve done it in the repo and in Codex.
				</CardDescription>
			</CardHeader>
			<div className="px-6 pb-6">
				<Field className="block w-full" data-invalid={invalid || undefined}>
					<FieldLabel>{field.label}</FieldLabel>
					<FieldContent>
						<ChecklistFieldRows
							field={field}
							value={value}
							className="overflow-hidden rounded-lg border border-border"
							onChange={onChange}
						/>
					</FieldContent>
				</Field>
			</div>
		</Card>
	);
}
