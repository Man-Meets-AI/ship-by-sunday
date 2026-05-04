"use client";

import {
	buildDesignPresetFactSeed,
	designPresetDefinitions,
	resolveDesignPresetDefinition,
	type CanonicalProjectFactKey,
} from "@shipbysunday/codebase-compiler";
import { FieldDescription } from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";
import { CodebaseDesignPresetSummary } from "@/app/(workspace)/_components/codebase-flow/codebase-design-preset-summary";
import {
	PresetDropdownRow,
	PresetOptionRow,
} from "@/app/(workspace)/_components/codebase-flow/codebase-design-preset-rows";

export type CodebaseDesignPresetFieldProps = {
	description?: string | null;
	errorId?: string;
	inputId: string;
	label: string;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	value: string;
	currentThemePreset: string;
};

export function CodebaseDesignPresetField({
	description,
	errorId,
	inputId,
	label,
	onChange,
	value,
	currentThemePreset,
}: CodebaseDesignPresetFieldProps) {
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
			<CodebaseDesignPresetSummary
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
