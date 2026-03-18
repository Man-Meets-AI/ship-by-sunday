import Link from "next/link";
import type { CSSProperties } from "react";

import type { StageUnlockSection } from "@/features/course/lesson/model/stage-unlock";
import { workbenchChromeLabelClass } from "../../shared/workbench-readability";

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
	const bodyLineKeyCounts = new Map<string, number>();
	const sourceLineKeyCounts = new Map<string, number>();

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
				<div className="flex flex-wrap items-center justify-between gap-2">
					<p
						className={workbenchChromeLabelClass}
						style={{ textWrap: "balance" }}
					>
						{section.label}
					</p>
					{section.action ? (
						<Link
							href={section.action.href}
							className="inline-flex items-center border border-product-border/70 bg-product-surface/88 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted transition-colors hover:border-product-accent/35 hover:text-product-text"
						>
							{section.action.label}
						</Link>
					) : null}
				</div>
			</div>
			<div className="space-y-4 px-4 py-4">
				<div className="space-y-3">
					{bodyLines.map((line, lineIndex) => {
						const keyValue = splitLineLabel(line);
						const lineOccurrence = bodyLineKeyCounts.get(line) ?? 0;
						bodyLineKeyCounts.set(line, lineOccurrence + 1);
						const lineKey = `${section.label}-${line}-${lineOccurrence}`;

						if (keyValue) {
							return (
								<div key={lineKey} className="space-y-1">
									<p className={workbenchChromeLabelClass}>{keyValue.label}</p>
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
								key={lineKey}
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
								className="aspect-[4/3] overflow-hidden bg-product-surface-strong shadow-[0_0_0_1px_rgba(var(--product-text),0.08),0_10px_20px_rgba(var(--product-shadow),0.12)]"
							>
								<img
									src={imageUrl}
									alt={`${section.label} reference ${imageIndex + 1}`}
									className="h-full w-full object-cover outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
								/>
							</div>
						))}
					</div>
				) : null}
				{section.imageUrl ? (
					<div className="overflow-hidden bg-product-surface-strong shadow-[0_0_0_1px_rgba(var(--product-text),0.08),0_10px_20px_rgba(var(--product-shadow),0.12)]">
						<img
							src={section.imageUrl}
							alt={`${section.label} preview`}
							className="h-40 w-full object-cover outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10 sm:h-48"
						/>
					</div>
				) : null}
				{sourceLines.length ? (
					<div className="border-t border-product-border/30 pt-3">
						<p className={workbenchChromeLabelClass}>Sources</p>
						<ul className="mt-2 space-y-1.5">
							{sourceLines.map((line) => {
								const lineOccurrence = sourceLineKeyCounts.get(line) ?? 0;
								sourceLineKeyCounts.set(line, lineOccurrence + 1);

								return (
									<li
										key={`${section.label}-source-${line}-${lineOccurrence}`}
										className="text-[11px] leading-5 text-product-muted"
										style={{ overflowWrap: "anywhere" }}
									>
										{line}
									</li>
								);
							})}
						</ul>
					</div>
				) : null}
			</div>
		</div>
	);
}
