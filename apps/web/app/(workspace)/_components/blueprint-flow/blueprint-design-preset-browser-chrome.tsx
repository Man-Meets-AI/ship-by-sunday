"use client";

export function DesignPresetPreviewBrowserChrome({
	addressLabel,
	label,
	previewImagePath,
}: {
	addressLabel: string;
	label: string;
	previewImagePath: string;
}) {
	return (
		<div className="overflow-hidden rounded-lg border border-border/60 bg-background">
			<div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-2 py-1.5">
				<div className="flex items-center gap-1" aria-hidden="true">
					<span className="size-1.5 rounded-full bg-foreground/20" />
					<span className="size-1.5 rounded-full bg-foreground/20" />
					<span className="size-1.5 rounded-full bg-foreground/20" />
				</div>
				<span className="inline-flex max-w-full flex-1 items-center justify-center truncate rounded-sm bg-background/80 px-1.5 py-0.5 text-[9px] text-muted-foreground">
					{addressLabel}
				</span>
				<span className="size-1.5" aria-hidden="true" />
			</div>
			{/* biome-ignore lint/performance/noImgElement: preview asset is local */}
			<img
				src={previewImagePath}
				alt={`${label} design inspiration preview`}
				className="aspect-[4/3] h-full w-full object-cover object-top"
				loading="lazy"
			/>
		</div>
	);
}
