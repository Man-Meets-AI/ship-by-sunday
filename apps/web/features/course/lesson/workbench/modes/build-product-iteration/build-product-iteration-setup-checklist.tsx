"use client";

import { Fragment, type ReactNode, useId } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { assert } from "@/features/course/lesson/lib/assert";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import { normalizeChecklistValue } from "@/features/course/lesson/workbench/fields/value-codecs";

const codeClass =
	"rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground";

function renderChecklistLabel(label: string): ReactNode {
	const parts = label.split("`");
	if (parts.length === 1) {
		return label;
	}

	return parts.map((part, index) =>
		index % 2 === 0 ? (
			<Fragment key={index}>{part}</Fragment>
		) : (
			<code key={index} className={codeClass}>
				{part}
			</code>
		),
	);
}

type Props = {
	checklistField: WorkbenchField;
	value: unknown;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalid: boolean;
	message: string;
};

export function BuildProductIterationSetupChecklist({
	checklistField,
	value,
	onFieldChange,
	invalid,
	message,
}: Props) {
	const baseId = useId();

	assert(
		checklistField.kind === "checklist",
		`Expected checklist field, got "${checklistField.kind}".`,
	);
	assert(
		checklistField.options,
		`Checklist field "${checklistField.id}" is missing options.`,
	);
	const checklistOptions = checklistField.options;
	const checklistItems = normalizeChecklistValue(value, checklistOptions);

	return (
		<>
			<div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
				{checklistItems.map((item, index) => {
					const rowId = `${baseId}-${checklistField.id}-${index}`;
					return (
						<label
							key={rowId}
							className="flex cursor-pointer items-start gap-3 px-3 py-2.5"
						>
							<Checkbox
								id={rowId}
								checked={item.checked}
								className="mt-0.5"
								onCheckedChange={(nextChecked) => {
									const nextItems = checklistItems.map((current, i) =>
										i === index
											? { ...current, checked: Boolean(nextChecked) }
											: current,
									);
									onFieldChange(checklistField.id, nextItems);
								}}
							/>
							<span className="min-w-0 flex-1 text-sm leading-relaxed font-normal text-foreground">
								{renderChecklistLabel(item.label)}
							</span>
						</label>
					);
				})}
			</div>
			{invalid ? <p className="text-sm text-destructive">{message}</p> : null}
		</>
	);
}
