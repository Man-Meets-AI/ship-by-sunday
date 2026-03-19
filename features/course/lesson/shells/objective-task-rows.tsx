"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function ManualObjectiveTaskRow({
	taskId,
	label,
	checked,
	onChange,
}: {
	taskId: string;
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	const id = `objective-task-${taskId}`;
	return (
		<Field orientation="horizontal" className="items-center px-1 py-1">
			<Checkbox
				id={id}
				checked={checked}
				onCheckedChange={(nextChecked) => onChange(Boolean(nextChecked))}
				className="size-3 shrink-0"
			/>
			<FieldLabel
				htmlFor={id}
				className={cn(
					"text-sm font-normal leading-normal text-foreground",
					checked && "text-muted-foreground line-through",
				)}
			>
				{label}
			</FieldLabel>
		</Field>
	);
}

export function GeneratedObjectiveTaskRow({
	taskId,
	label,
	complete,
}: {
	taskId: string;
	label: string;
	complete: boolean;
}) {
	const id = `objective-task-readonly-${taskId}`;
	return (
		<Field orientation="horizontal" className="items-start px-1 py-1">
			<Checkbox
				id={id}
				checked={complete}
				disabled
				className="mt-0.5 size-3 shrink-0"
			/>
			<FieldLabel
				htmlFor={id}
				className={cn(
					"text-sm font-normal leading-normal",
					complete ? "text-muted-foreground line-through" : "text-foreground",
				)}
			>
				{label}
			</FieldLabel>
		</Field>
	);
}
