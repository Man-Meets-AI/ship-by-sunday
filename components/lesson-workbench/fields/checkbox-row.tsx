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
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
				className="size-3.5 rounded-none border-product-border accent-[rgb(var(--product-accent))]"
			/>
			<span className="text-xs font-medium text-product-text">{label}</span>
		</label>
	);
}
