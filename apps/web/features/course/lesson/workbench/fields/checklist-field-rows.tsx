"use client";

import { Fragment, useId } from "react";
import { Separator } from "@/components/ui/separator";
import { assert } from "@/features/course/lesson/lib/assert";
import type {
	ChecklistItemValue,
	WorkbenchField,
} from "@/features/course/lesson/model/manifest";
import { cn } from "@/lib/utils";
import { ChecklistOptionRow } from "./checklist-option-row";
import { normalizeChecklistValue } from "./value-codecs";

export function getChecklistFieldItems({
	field,
	value,
}: {
	field: WorkbenchField;
	value: unknown;
}): ChecklistItemValue[] {
	assert(
		field.kind === "checklist",
		`Expected checklist field, got "${field.kind}".`,
	);
	assert(field.options, `Checklist field "${field.id}" is missing options.`);

	return normalizeChecklistValue(value, field.options);
}

export function ChecklistFieldRows({
	field,
	value,
	onChange,
	className,
	rowClassName,
	separator = "divide",
}: {
	field: WorkbenchField;
	value: unknown;
	onChange: (nextItems: ChecklistItemValue[]) => void;
	className?: string;
	rowClassName?: string;
	separator?: "divide" | "separator" | "none";
}) {
	const baseId = useId();
	const items = getChecklistFieldItems({ field, value });

	return (
		<div
			className={cn(
				separator === "divide" ? "divide-y divide-border" : null,
				className,
			)}
		>
			{items.map((item, index) => {
				const rowId = `${baseId}-${field.id}-${index}`;
				const row = (
					<ChecklistOptionRow
						id={rowId}
						label={item.label}
						checked={item.checked}
						className={rowClassName}
						onChange={(nextChecked) => {
							const nextItems = items.map((current, currentIndex) =>
								currentIndex === index
									? { ...current, checked: nextChecked }
									: current,
							);
							onChange(nextItems);
						}}
					/>
				);

				if (separator !== "separator") {
					return <Fragment key={rowId}>{row}</Fragment>;
				}

				return (
					<Fragment key={rowId}>
						{index > 0 ? <Separator /> : null}
						{row}
					</Fragment>
				);
			})}
		</div>
	);
}
