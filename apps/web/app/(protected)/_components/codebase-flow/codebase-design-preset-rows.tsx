"use client";

export function PresetOptionRow({
	category,
	label,
	logoPath,
	summary,
}: {
	category: string;
	label: string;
	logoPath: string;
	summary: string;
}) {
	return (
		<span className="flex items-center gap-3">
			{/* biome-ignore lint/performance/noImgElement: design preset logos are tiny static SVG/PNGs */}
			<img
				src={logoPath}
				alt=""
				aria-hidden="true"
				className="size-7 rounded-md border border-border/50 bg-background p-1"
			/>
			<span className="flex min-w-0 flex-col gap-0.5">
				<span className="text-sm font-medium text-foreground">{label}</span>
				<span className="truncate text-xs text-muted-foreground">
					{category} · {summary}
				</span>
			</span>
		</span>
	);
}

export function PresetDropdownRow({
	category,
	label,
	logoPath,
	summary,
}: {
	category: string;
	label: string;
	logoPath: string;
	summary: string;
}) {
	return (
		<span className="flex items-center gap-3">
			{/* biome-ignore lint/performance/noImgElement: design preset logos are tiny static SVG/PNGs */}
			<img
				src={logoPath}
				alt=""
				aria-hidden="true"
				className="size-8 shrink-0 rounded-lg border border-border/50 bg-background p-1.5"
			/>
			<span className="flex min-w-0 flex-col gap-0.5">
				<span className="flex items-baseline gap-2">
					<span className="text-sm font-semibold text-foreground">{label}</span>
					<span className="text-[11px] text-muted-foreground">{category}</span>
				</span>
				<span className="text-xs leading-snug text-muted-foreground">
					{summary}
				</span>
			</span>
		</span>
	);
}
