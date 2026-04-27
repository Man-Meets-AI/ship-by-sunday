"use client";

import { useId } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import { renderChecklistLabel } from "./checklist-label";

export function ChecklistOptionRow({
	id: idProp,
	label,
	checked,
	onChange,
	className,
}: {
	id?: string;
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	className?: string;
}) {
	const generatedId = useId();
	const inputId = idProp ?? generatedId;

	return (
		<label
			className={cn(
				"flex cursor-pointer items-start gap-3 px-3 py-2.5",
				className,
			)}
		>
			<Checkbox
				id={inputId}
				checked={checked}
				className="mt-0.5"
				onCheckedChange={(nextChecked) => onChange(Boolean(nextChecked))}
			/>
			<span className="min-w-0 flex-1 text-sm leading-relaxed font-normal text-foreground">
				{renderChecklistLabel(label)}
			</span>
		</label>
	);
}
