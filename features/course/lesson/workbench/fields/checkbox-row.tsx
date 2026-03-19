import { Checkbox } from "@/components/ui/checkbox";

export function CheckboxRow({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<label className="flex items-center gap-2 rounded-none border border-product-border bg-product-surface px-2.5 py-1.5">
			<Checkbox
				checked={checked}
				onCheckedChange={(nextChecked) => onChange(Boolean(nextChecked))}
			/>
			<span className="text-xs font-medium text-product-text">{label}</span>
		</label>
	);
}
