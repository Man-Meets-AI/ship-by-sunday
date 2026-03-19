"use client";

import { useId } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Item } from "@/components/ui/item";
import { Label } from "@/components/ui/label";

export function CheckboxRow({
	id: idProp,
	label,
	checked,
	onChange,
}: {
	id?: string;
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	const generatedId = useId();
	const inputId = idProp ?? generatedId;

	return (
		<Item asChild variant="outline" size="xs">
			<label className="flex cursor-pointer items-center gap-2">
				<Checkbox
					id={inputId}
					checked={checked}
					onCheckedChange={(nextChecked) => onChange(Boolean(nextChecked))}
				/>
				<Label htmlFor={inputId} className="text-sm font-medium">
					{label}
				</Label>
			</label>
		</Item>
	);
}
