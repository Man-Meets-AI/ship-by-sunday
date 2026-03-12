import type { CSSProperties } from "react";

import type { StageUnlockSection } from "@/lib/course/stage-unlock";

export function StageUnlockSectionCard({
	section,
	index,
}: {
	section: StageUnlockSection;
	index: number;
}) {
	return (
		<div
			className="sbs-stage-unlock-card rounded-none border border-product-border/70 bg-product-surface px-3 py-3"
			style={
				{
					"--sbs-stage-unlock-delay": `${Math.min(index + 1, 4) * 24}ms`,
				} as CSSProperties
			}
		>
			<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
				{section.label}
			</p>
			<p className="mt-2 whitespace-pre-line text-[12px] leading-relaxed text-product-text">
				{section.value}
			</p>
			{section.galleryImageUrls?.length ? (
				<div className="mt-3 grid grid-cols-2 gap-2">
					{section.galleryImageUrls.map((imageUrl, imageIndex) => (
						<div
							key={`${section.label}-${imageUrl}`}
							className="aspect-[4/3] overflow-hidden border border-product-border/70 bg-product-surface-strong"
						>
							<img
								src={imageUrl}
								alt={`${section.label} reference ${imageIndex + 1}`}
								className="h-full w-full object-cover"
							/>
						</div>
					))}
				</div>
			) : null}
			{section.imageUrl ? (
				<div className="mt-3 overflow-hidden border border-product-border/70 bg-product-surface-strong">
					<img
						src={section.imageUrl}
						alt={`${section.label} preview`}
						className="h-32 w-full object-cover"
					/>
				</div>
			) : null}
		</div>
	);
}
