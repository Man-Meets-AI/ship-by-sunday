"use client";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldContent,
	FieldLabel,
} from "@/components/ui/field";
import { assert } from "@/features/course/lesson/lib/assert";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { renderChecklistLabel } from "../../fields/checklist-label";
import { normalizeChecklistValue } from "../../fields/value-codecs";

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

	assert(
		field.options,
		`Checklist field "${field.id}" is missing options.`,
	);

	const checklistOptions = field.options;
	const checklistItems = normalizeChecklistValue(value, checklistOptions);

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
						<div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
							{checklistItems.map((item, index) => {
								const optionId = `${field.id}-${index}`;
								return (
									<label
										key={`${field.id}-${index}`}
										htmlFor={optionId}
										className="flex cursor-pointer items-start gap-3 px-3 py-2.5"
									>
										<Checkbox
											id={optionId}
											checked={item.checked}
											className="mt-0.5"
											onCheckedChange={(nextChecked) => {
												const nextItems = checklistItems.map(
													(current, currentIndex) =>
														currentIndex === index
															? { ...current, checked: Boolean(nextChecked) }
															: current,
												);
												onChange(nextItems);
											}}
										/>
										<span className="min-w-0 flex-1 text-sm leading-relaxed font-normal text-foreground">
											{renderChecklistLabel(item.label)}
										</span>
									</label>
								);
							})}
						</div>
					</FieldContent>
				</Field>
			</div>
		</Card>
	);
}
