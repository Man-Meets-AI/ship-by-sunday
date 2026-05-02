"use client";

import { ArrowUpRight, CheckCircle2 } from "lucide-react";

import type { HomePageContent } from "@/app/_content/home-page";
import { cn } from "@/lib/utils";

import { BlueprintDemoSectionCard } from "./blueprint-demo-section-card";
import type { HomePageBlueprintDraftFields } from "./home-page-blueprint-draft-storage";

type DesignContent = HomePageContent["productPreviewSection"]["design"];
type DesignPresetContent = DesignContent["presets"][number];

export function BlueprintDemoDesignCard({
	sectionNumber,
	label,
	description,
	design,
	fields,
	onSelectPreset,
}: {
	readonly sectionNumber: number;
	readonly label: string;
	readonly description: string;
	readonly design: DesignContent;
	readonly fields: HomePageBlueprintDraftFields;
	readonly onSelectPreset: (presetId: string) => void;
}) {
	const selectedPreset =
		design.presets.find((preset) => preset.id === fields.design_preset_id) ??
		design.presets.find((preset) => preset.id === design.defaultPresetId) ??
		design.presets[0];

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
							<button
								key={preset.id}
								type="button"
								role="radio"
								aria-checked={isSelected}
								data-testid={`blueprint-demo-design-preset-${preset.id}`}
								onClick={() => onSelectPreset(preset.id)}
								className={cn(
									"flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
									isSelected
										? "border-foreground bg-foreground text-background"
										: "border-border/70 bg-background text-foreground hover:border-foreground/70",
								)}
							>
								<span>{preset.label}</span>
								{isSelected ? (
									<CheckCircle2 className="size-3.5" aria-hidden />
								) : null}
							</button>
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
	return (
		<div
			className="overflow-hidden rounded-xl border border-border/60 bg-background"
			data-testid="blueprint-demo-design-preview"
		>
			<div
				aria-hidden="true"
				className="h-1.5 w-full"
				style={{ backgroundColor: preset.accentColor }}
			/>
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
						className="h-full w-full object-contain"
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
						className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-4"
						data-testid={`blueprint-demo-design-reference-${preset.id}`}
					>
						{previewLinkLabel}
						<ArrowUpRight className="size-3" aria-hidden />
					</a>
				</div>
			</div>
			<p className="border-t border-border/50 bg-muted/20 px-4 py-2 text-[11px] leading-5 text-muted-foreground">
				{previewNote}
			</p>
		</div>
	);
}
