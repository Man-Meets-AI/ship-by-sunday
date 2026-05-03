"use client";

import { useCallback, useMemo, useState } from "react";
import { DicesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	type PresetConfig,
	decodePresetSafe,
	encodePreset,
	generateRandomConfig,
	DEFAULT_THEME_PRESET_CODE,
} from "@/lib/blueprint-flow/blueprint-theme-helpers";
import { BlueprintThemeAdvancedOptions } from "./blueprint-theme-advanced-options";
import {
	FontSelector,
	RadiusSelector,
	StyleSelector,
	ThemeColorGrid,
} from "./blueprint-theme-configurator-controls";
import { BlueprintThemePreview } from "./blueprint-theme-preview";

export type BlueprintThemeConfiguratorProps = {
	value: string;
	onChange: (nextValue: string) => void;
};

export function BlueprintThemeConfigurator({
	value,
	onChange,
}: BlueprintThemeConfiguratorProps) {
	const [advancedOpen, setAdvancedOpen] = useState(false);
	const config = useMemo(() => decodePresetSafe(value), [value]);
	const displayCode = value || DEFAULT_THEME_PRESET_CODE;

	const updateKnob = useCallback(
		<K extends keyof PresetConfig>(key: K, knobValue: PresetConfig[K]) => {
			const next = { ...config, [key]: knobValue };
			onChange(encodePreset(next));
		},
		[config, onChange],
	);

	const handleShuffle = useCallback(() => {
		onChange(encodePreset(generateRandomConfig()));
	}, [onChange]);

	return (
		<div className="grid items-start gap-6 lg:grid-cols-[1fr_minmax(300px,360px)]">
			<div className="flex flex-col gap-6">
				<ThemeColorGrid
					value={config.theme}
					onSelect={(theme) => updateKnob("theme", theme)}
				/>
				<StyleSelector
					value={config.style}
					onSelect={(style) => updateKnob("style", style)}
				/>
				<div className="grid grid-cols-2 gap-4">
					<FontSelector
						value={config.font}
						onSelect={(font) => updateKnob("font", font)}
					/>
					<RadiusSelector
						value={config.radius}
						onSelect={(radius) => updateKnob("radius", radius)}
					/>
				</div>
				<BlueprintThemeAdvancedOptions
					config={config}
					onUpdate={updateKnob}
					open={advancedOpen}
					onOpenChange={setAdvancedOpen}
				/>
				<div className="flex items-center gap-3 border-t border-border/40 pt-4">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleShuffle}
						className="gap-1.5"
					>
						<DicesIcon className="size-3.5" />
						Randomize
					</Button>
					<code className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
						{displayCode}
					</code>
				</div>
			</div>
			<BlueprintThemePreview config={config} />
		</div>
	);
}
