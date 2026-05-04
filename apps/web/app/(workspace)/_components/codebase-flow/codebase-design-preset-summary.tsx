"use client";

import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { DesignPresetPreviewBrowserChrome } from "@/app/(workspace)/_components/codebase-flow/codebase-design-preset-browser-chrome";
import { useCodebasePageReducedMotion } from "@/app/(workspace)/_components/codebase-flow/codebase-page-motion";

function formatPreviewHost(url: string): string {
	try {
		const parsed = new URL(url);
		return parsed.host + parsed.pathname.replace(/\/+$/, "");
	} catch {
		return url;
	}
}

export function CodebaseDesignPresetSummary({
	category,
	isCustomized,
	label,
	logoPath,
	previewImagePath,
	previewPageUrl,
	rawDesignMdUrl,
	summary,
}: {
	category: string;
	isCustomized: boolean;
	label: string;
	logoPath: string;
	previewImagePath: string;
	previewPageUrl: string;
	rawDesignMdUrl: string;
	summary: string;
}) {
	const previewHost = formatPreviewHost(previewPageUrl);
	const prefersReducedMotion = useCodebasePageReducedMotion();

	return (
		<div
			className="overflow-hidden rounded-xl border border-border/60 bg-muted/20"
			data-testid="codebase-page-design-preset-summary"
		>
			<div className="flex items-start justify-between gap-4 border-b border-border/50 px-4 py-3">
				<div className="flex min-w-0 items-center gap-3">
					{/* biome-ignore lint/performance/noImgElement: design preset logos are tiny static SVG/PNGs */}
					<img
						src={logoPath}
						alt=""
						aria-hidden="true"
						className="size-10 rounded-lg border border-border/60 bg-background p-2"
					/>
					<div className="min-w-0">
						<div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
							<p className="text-sm font-semibold text-foreground">{label}</p>
							<span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
								{category}
							</span>
						</div>
						<p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">
							{previewHost}
						</p>
					</div>
				</div>
				<AnimatePresence initial={false}>
					{isCustomized ? (
						<motion.span
							key="customized-pill"
							initial={
								prefersReducedMotion
									? { opacity: 1, scale: 1 }
									: { opacity: 0, scale: 0.94 }
							}
							animate={{ opacity: 1, scale: 1 }}
							exit={
								prefersReducedMotion
									? { opacity: 0 }
									: { opacity: 0, scale: 0.94 }
							}
							transition={
								prefersReducedMotion
									? { duration: 0 }
									: { duration: 0.16, ease: "easeOut" }
							}
							className="rounded-full border border-border/70 bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground"
							data-testid="codebase-page-design-preset-customized"
						>
							Customized
						</motion.span>
					) : null}
				</AnimatePresence>
			</div>
			<div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_13rem]">
				<div className="space-y-3">
					<p className="text-[13.5px] leading-6 text-muted-foreground">
						{summary}
					</p>
					<div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5 text-xs font-medium">
						<a
							href={previewPageUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-baseline gap-1 text-foreground underline underline-offset-4 hover:text-foreground/80"
						>
							View full preview
							<ArrowUpRight className="size-3 self-center" aria-hidden />
						</a>
						<a
							href={rawDesignMdUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-baseline gap-1 text-muted-foreground underline underline-offset-4 hover:text-foreground"
						>
							Open source DESIGN.md
							<ArrowUpRight className="size-3 self-center" aria-hidden />
						</a>
					</div>
				</div>
				<DesignPresetPreviewBrowserChrome
					addressLabel={previewHost}
					label={label}
					previewImagePath={previewImagePath}
				/>
			</div>
		</div>
	);
}
