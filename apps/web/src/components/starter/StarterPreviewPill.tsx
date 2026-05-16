export function StarterPreviewPill({
	label,
	value,
}: {
	readonly label: string;
	readonly value: string;
}) {
	return (
		<div className="rounded-lg border border-border/70 bg-background/70 px-3 py-2">
			<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
				{label}
			</p>
			<p className="mt-1 text-sm font-medium leading-5 text-foreground">
				{value}
			</p>
		</div>
	);
}
