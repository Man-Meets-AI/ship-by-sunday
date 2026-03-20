"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

type Props = {
	field: WorkbenchField;
	value: string;
	onChange: (value: string) => void;
	invalid: boolean;
	message: string | null;
};

export function BuildProductIterationTextareaField({
	field,
	value,
	onChange,
	invalid,
	message,
}: Props) {
	return (
		<div className="space-y-2">
			<Label htmlFor={field.id}>{field.label}</Label>
			<Textarea
				id={field.id}
				rows={field.rows ?? 6}
				placeholder={field.placeholder}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className={invalid ? "border-destructive" : undefined}
			/>
			{message ? <p className="text-sm text-destructive">{message}</p> : null}
		</div>
	);
}
