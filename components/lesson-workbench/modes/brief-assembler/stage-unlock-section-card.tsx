import type { CSSProperties } from "react";

import type { StageUnlockSection } from "@/lib/course/stage-unlock";

function splitSectionLines(value: string) {
	const lines = value
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);

	return {
		bodyLines: lines.filter(
			(line) => !/^\[\d+\]:/.test(line) && !/^https?:\/\//.test(line),
		),
		sourceLines: lines.filter(
			(line) => /^\[\d+\]:/.test(line) || /^https?:\/\//.test(line),
		),
	};
}

function splitLineLabel(line: string) {
	const match = /^([^:]{2,42}):\s*(.+)$/.exec(line);

	if (!match) {
		return null;
	}

	return {
		label: match[1],
		value: match[2],
	};
}

export function StageUnlockSectionCard({
	section,
	index,
	className,
}: {
	section: StageUnlockSection;
	index: number;
	className?: string;
}) {
	const { bodyLines, sourceLines } = splitSectionLines(section.value);

	return (
		<div
			className={`sbs-stage-unlock-card rounded-none border border-product-border/70 bg-product-surface/72 shadow-panel backdrop-blur-xl ${className ?? ""}`.trim()}
			style={
				{
					"--sbs-stage-unlock-delay": `${Math.min(index + 1, 4) * 24}ms`,
				} as CSSProperties
			}
		>
			<div className="border-b border-product-border/35 px-4 py-3">
				<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
					{section.label}
				</p>
			</div>
			<div className="space-y-4 px-4 py-4">
				<div className="space-y-3">
					{bodyLines.map((line, lineIndex) => {
						const keyValue = splitLineLabel(line);

						if (keyValue) {
							return (
								<div
									key={`${section.label}-${lineIndex}`}
									className="space-y-1"
								>
									<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-product-muted">
										{keyValue.label}
									</p>
									<p
										className="text-[13px] leading-7 text-product-text"
										style={{ overflowWrap: "anywhere" }}
									>
										{keyValue.value}
									</p>
								</div>
							);
						}

						return (
							<p
								key={`${section.label}-${lineIndex}`}
								className={
									lineIndex === 0
										? "text-sm font-medium leading-6 text-product-text"
										: "text-[13px] leading-7 text-product-text"
								}
								style={{ overflowWrap: "anywhere" }}
							>
								{line}
							</p>
						);
					})}
				</div>
				{section.galleryImageUrls?.length ? (
					<div className="grid grid-cols-2 gap-2 md:grid-cols-4">
						{section.galleryImageUrls.map((imageUrl, imageIndex) => (
							<div
								key={`${section.label}-${imageUrl}`}
								className="aspect-[4/3] overflow-hidden border border-product-border/50 bg-product-surface-strong shadow-[inset_0_0_0_1px_rgba(var(--product-text),0.08)]"
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
					<div className="overflow-hidden border border-product-border/50 bg-product-surface-strong shadow-[inset_0_0_0_1px_rgba(var(--product-text),0.08)]">
						<img
							src={section.imageUrl}
							alt={`${section.label} preview`}
							className="h-40 w-full object-cover sm:h-48"
						/>
					</div>
				) : null}
				{sourceLines.length ? (
					<div className="border-t border-product-border/30 pt-3">
						<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-product-muted">
							Sources
						</p>
						<ul className="mt-2 space-y-1.5">
							{sourceLines.map((line, lineIndex) => (
								<li
									key={`${section.label}-source-${lineIndex}`}
									className="text-[11px] leading-5 text-product-muted"
									style={{ overflowWrap: "anywhere" }}
								>
									{line}
								</li>
							))}
						</ul>
					</div>
				) : null}
			</div>
		</div>
	);
}
