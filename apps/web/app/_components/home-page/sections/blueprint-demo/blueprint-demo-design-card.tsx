"use client";

import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

import type { HomePageContent } from "@/app/_content/home-page";
import { cn } from "@/lib/utils";

import { BlueprintDemoDesignBrowserChrome } from "./blueprint-demo-design-browser-chrome";
import { useBlueprintDemoReducedMotion } from "./blueprint-demo-motion";
import { BlueprintDemoSavedLocally } from "./blueprint-demo-saved-locally";
import { BlueprintDemoSectionCard } from "./blueprint-demo-section-card";
import type { HomePageBlueprintDraftFields } from "./home-page-blueprint-draft-storage";

function getReferenceHostFromUrl(url: string): string {
	try {
		const parsed = new URL(url);
		return parsed.host + parsed.pathname.replace(/\/+$/, "");
	} catch {
		return url;
	}
}

type DesignContent = HomePageContent["productPreviewSection"]["design"];
type DesignPresetContent = DesignContent["presets"][number];

export function BlueprintDemoDesignCard({
	sectionNumber,
	label,
	description,
	design,
	fields,
	lastSavedAt,
	onSelectPreset,
}: {
	readonly sectionNumber: number;
	readonly label: string;
	readonly description: string;
	readonly design: DesignContent;
	readonly fields: HomePageBlueprintDraftFields;
	readonly lastSavedAt: number | null;
	readonly onSelectPreset: (presetId: string) => void;
}) {
	const selectedPreset =
		design.presets.find((preset) => preset.id === fields.design_preset_id) ??
		design.presets.find((preset) => preset.id === design.defaultPresetId) ??
		design.presets[0];
	const prefersReducedMotion = useBlueprintDemoReducedMotion();

	return (
		<BlueprintDemoSectionCard
			sectionId="design"
			sectionNumber={sectionNumber}
			label={label}
			description={description}
		>
			<div className="space-y-4">
				<p className="text-sm leading-6 text-muted-foreground">
					{design.intro}
				</p>
				<p className="text-sm font-medium text-foreground">{design.label}</p>
				<p className="text-xs leading-5 text-muted-foreground">
					{design.helperText}
				</p>
				<div
					className="flex flex-wrap gap-2"
					role="radiogroup"
					aria-label={design.label}
				>
					{design.presets.map((preset) => {
						const isSelected = preset.id === fields.design_preset_id;
						return (
							<motion.button
								key={preset.id}
								type="button"
								role="radio"
								aria-checked={isSelected}
								data-testid={`blueprint-demo-design-preset-${preset.id}`}
								onClick={() => onSelectPreset(preset.id)}
								whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
								transition={{ duration: 0.15, ease: "easeOut" }}
								className={cn(
									"flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-[color,background-color,border-color] duration-150 ease-out",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
									isSelected
										? "border-foreground bg-foreground text-background"
										: "border-border/70 bg-background text-foreground hover:border-foreground/70 hover:bg-muted/40",
								)}
							>
								<span>{preset.label}</span>
								{isSelected ? (
									<motion.span
										initial={
											prefersReducedMotion ? false : { scale: 0.6, opacity: 0 }
										}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ duration: 0.16, ease: "easeOut" }}
										className="inline-flex"
										aria-hidden="true"
									>
										<CheckCircle2 className="size-3.5" />
									</motion.span>
								) : null}
							</motion.button>
						);
					})}
				</div>
				{selectedPreset ? (
					<DesignPresetPreviewCard
						preset={selectedPreset}
						previewLinkLabel={design.previewLinkLabel}
						previewNote={design.previewNote}
					/>
				) : null}
				<BlueprintDemoSavedLocally lastSavedAt={lastSavedAt} scope="design" />
			</div>
		</BlueprintDemoSectionCard>
	);
}

function DesignPresetPreviewCard({
	preset,
	previewLinkLabel,
	previewNote,
}: {
	readonly preset: DesignPresetContent;
	readonly previewLinkLabel: string;
	readonly previewNote: string;
}) {
	const referenceHost = getReferenceHostFromUrl(preset.referenceUrl);
	return (
		<BlueprintDemoDesignBrowserChrome
			addressLabel={referenceHost}
			accentColorLight={preset.accentColor}
			accentColorDark={preset.accentColorDark}
		>
			<div
				className="bg-background"
				data-testid="blueprint-demo-design-preview"
			>
				<div className="flex items-start gap-4 p-4">
					<div
						className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background p-2"
						data-testid={`blueprint-demo-design-logo-${preset.id}`}
					>
						{/* biome-ignore lint/performance/noImgElement: lightweight inline SVG */}
						<img
							src={preset.logoPath}
							alt=""
							aria-hidden="true"
							className={cn(
								"h-full w-full object-contain",
								preset.logoDarkMode === "invert" && "dark:invert",
							)}
						/>
					</div>
					<div className="min-w-0 flex-1 space-y-1.5">
						<div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
							<p className="text-sm font-semibold text-foreground">
								{preset.label}
							</p>
							<span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
								{preset.category}
							</span>
						</div>
						<p className="text-xs leading-5 text-muted-foreground">
							{preset.summary}
						</p>
						<a
							href={preset.referenceUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-baseline gap-1 text-xs font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
							data-testid={`blueprint-demo-design-reference-${preset.id}`}
						>
							{previewLinkLabel}
							<ArrowUpRight className="size-3 self-center" aria-hidden />
						</a>
					</div>
				</div>
				<div className="flex items-center gap-3 border-t border-border/50 bg-muted/15 px-4 py-2.5">
					<span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/80">
						Type
					</span>
					<span
						className="truncate text-sm leading-5 text-foreground"
						style={{ fontFamily: preset.fontSpecimen.fontStack }}
						data-testid={`blueprint-demo-design-font-${preset.id}`}
					>
						<span className="font-medium">{preset.fontSpecimen.family}</span>
						<span className="ml-2 text-muted-foreground">
							{preset.fontSpecimen.sample}
						</span>
					</span>
				</div>
				<p className="border-t border-border/50 bg-muted/20 px-4 py-2 text-[11px] leading-5 text-muted-foreground">
					{previewNote}
				</p>
			</div>
		</BlueprintDemoDesignBrowserChrome>
	);
}
