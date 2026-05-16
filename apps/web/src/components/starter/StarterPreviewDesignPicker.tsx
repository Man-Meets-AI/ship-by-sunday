"use client";

import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

import type {
	StarterPreviewDraft,
	StarterPreviewSection,
} from "./StarterPreviewTypes";

export function StarterPreviewDesignPicker({
	section,
	draft,
}: {
	readonly section: StarterPreviewSection;
	readonly draft: StarterPreviewDraft;
}) {
	const selectedPreset =
		section.design.presets.find(
			(preset) => preset.id === draft.fields.design_preset_id,
		) ??
		section.design.presets.find(
			(preset) => preset.id === section.design.defaultPresetId,
		) ??
		section.design.presets[0];

	return (
		<div className="space-y-3">
			<div>
				<p className="text-sm font-medium text-foreground">
					{section.design.label}
				</p>
				<p className="mt-1 text-xs leading-5 text-muted-foreground">
					{section.design.helperText}
				</p>
			</div>
			<div
				className="flex flex-wrap gap-2"
				role="radiogroup"
				aria-label={section.design.label}
			>
				{section.design.presets.map((preset) => {
					const isSelected = preset.id === draft.fields.design_preset_id;
					return (
						<button
							key={preset.id}
							type="button"
							role="radio"
							aria-checked={isSelected}
							data-testid={`codebase-demo-design-preset-${preset.id}`}
							onClick={() => draft.selectDesignPreset(preset.id)}
							className={cn(
								"inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
								isSelected
									? "border-foreground bg-foreground text-background"
									: "border-border/70 bg-background text-foreground hover:border-foreground/70 hover:bg-muted/40",
							)}
						>
							<span>{preset.label}</span>
							{isSelected ? <CheckCircle2 className="size-3.5" /> : null}
						</button>
					);
				})}
			</div>
			{selectedPreset ? (
				<div
					className="rounded-lg border border-border/70 bg-muted/15 p-3"
					data-testid="starter-preview-selected-design"
				>
					<div className="flex items-start gap-3">
						<div
							className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background p-1.5"
							data-testid={`codebase-demo-design-logo-${selectedPreset.id}`}
						>
							{/* biome-ignore lint/performance/noImgElement: small preset logo */}
							<img
								src={selectedPreset.logoPath}
								alt=""
								aria-hidden="true"
								className={cn(
									"h-full w-full object-contain",
									selectedPreset.logoDarkMode === "invert" && "dark:invert",
								)}
							/>
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-sm font-semibold text-foreground">
								{selectedPreset.label}
								<span className="ml-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
									{selectedPreset.category}
								</span>
							</p>
							<p className="mt-1 text-xs leading-5 text-muted-foreground">
								{selectedPreset.summary}
							</p>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
