"use client";

import {
	buildDesignPresetFactSeed,
	designPresetDefinitions,
	resolveDesignPresetDefinition,
	type CanonicalProjectFactKey,
} from "@shipbysunday/blueprint-compiler";
import { FieldDescription } from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";

export type BlueprintDesignPresetFieldProps = {
	description?: string | null;
	errorId?: string;
	inputId: string;
	label: string;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	value: string;
	currentThemePreset: string;
};

export function BlueprintDesignPresetField({
	description,
	errorId,
	inputId,
	label,
	onChange,
	value,
	currentThemePreset,
}: BlueprintDesignPresetFieldProps) {
	const selectedPreset = resolveDesignPresetDefinition(value);
	const isCustomized =
		currentThemePreset.trim().length > 0 &&
		currentThemePreset.trim() !== selectedPreset.presetCode;

	const handlePresetChange = (nextPresetId: string) => {
		const nextSeed = buildDesignPresetFactSeed(nextPresetId);
		onChange("design_preset_id", nextSeed.design_preset_id);
		onChange("theme_preset", nextSeed.theme_preset);
		onChange("design_references", nextSeed.design_references.join("\n"));
	};

	return (
		<div className="space-y-4">
			<Select value={selectedPreset.id} onValueChange={handlePresetChange}>
				<SelectTrigger
					id={inputId}
					className="h-auto w-full items-start rounded-xl px-3 py-3 text-left"
					aria-label={label}
					aria-describedby={errorId}
				>
					<PresetOptionRow
						category={selectedPreset.category}
						label={selectedPreset.label}
						logoPath={selectedPreset.logoPath}
						summary={selectedPreset.summary}
					/>
				</SelectTrigger>
				<SelectContent className="w-[min(36rem,var(--radix-select-trigger-width))]">
					<SelectGroup>
						{designPresetDefinitions.map((preset) => (
							<SelectItem
								key={preset.id}
								value={preset.id}
								className="py-2.5 pl-2.5"
							>
								<PresetDropdownRow
									category={preset.category}
									label={preset.label}
									logoPath={preset.logoPath}
									summary={preset.summary}
								/>
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			<PresetSummaryCard
				category={selectedPreset.category}
				isCustomized={isCustomized}
				label={selectedPreset.label}
				logoPath={selectedPreset.logoPath}
				previewImagePath={selectedPreset.previewImagePath}
				previewPageUrl={selectedPreset.previewPageUrl}
				rawDesignMdUrl={selectedPreset.rawDesignMdUrl}
				summary={selectedPreset.summary}
			/>
			{description ? <FieldDescription>{description}</FieldDescription> : null}
		</div>
	);
}

function PresetOptionRow({
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

function PresetDropdownRow({
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

function PresetSummaryCard({
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
	return (
		<div className="overflow-hidden rounded-xl border border-border/60 bg-muted/20">
			<div className="flex items-start justify-between gap-4 border-b border-border/50 px-4 py-3">
				<div className="flex min-w-0 items-center gap-3">
					<img
						src={logoPath}
						alt=""
						aria-hidden="true"
						className="size-10 rounded-lg border border-border/60 bg-background p-2"
					/>
					<div className="min-w-0">
						<p className="text-sm font-semibold text-foreground">{label}</p>
						<p className="text-xs text-muted-foreground">{category}</p>
					</div>
				</div>
				{isCustomized ? (
					<span className="rounded-full border border-border/70 bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground">
						Customized
					</span>
				) : null}
			</div>
			<div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
				<div className="space-y-3">
					<p className="text-sm leading-6 text-muted-foreground">{summary}</p>
					<div className="flex flex-wrap gap-3 text-xs font-medium">
						<a
							href={previewPageUrl}
							target="_blank"
							rel="noreferrer"
							className="text-foreground underline underline-offset-4"
						>
							View full preview
						</a>
						<a
							href={rawDesignMdUrl}
							target="_blank"
							rel="noreferrer"
							className="text-muted-foreground underline underline-offset-4"
						>
							Open source DESIGN.md
						</a>
					</div>
				</div>
				<div className="overflow-hidden rounded-lg border border-border/60 bg-background">
					<img
						src={previewImagePath}
						alt={`${label} design inspiration preview`}
						className="aspect-[4/3] h-full w-full object-cover object-top"
						loading="lazy"
					/>
				</div>
			</div>
		</div>
	);
}
