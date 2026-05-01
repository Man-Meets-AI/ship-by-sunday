"use client";

import { useCallback, useMemo, useState } from "react";
import { CheckIcon, ChevronDownIcon, DicesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	type PresetConfig,
	THEME_COLOR_OPTIONS,
	STYLE_OPTIONS,
	FONT_OPTIONS,
	RADIUS_OPTIONS,
	BASE_COLOR_OPTIONS,
	ICON_LIBRARY_OPTIONS,
	MENU_ACCENT_OPTIONS,
	MENU_COLOR_OPTIONS,
	themeColorHex,
	decodePresetSafe,
	encodePreset,
	generateRandomConfig,
	formatFontLabel,
	formatMenuColorLabel,
	DEFAULT_THEME_PRESET_CODE,
} from "@/lib/blueprint-flow/blueprint-theme-helpers";
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

				<Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
					<CollapsibleTrigger asChild>
						<button
							type="button"
							className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							<ChevronDownIcon
								className={cn(
									"size-3.5 transition-transform duration-200",
									advancedOpen && "rotate-180",
								)}
							/>
							Advanced options
						</button>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<div className="mt-4 grid grid-cols-2 gap-4">
							<DropdownKnob
								label="Base color"
								value={config.baseColor}
								options={BASE_COLOR_OPTIONS as unknown as string[]}
								onSelect={(v) =>
									updateKnob("baseColor", v as PresetConfig["baseColor"])
								}
							/>
							<DropdownKnob
								label="Icon library"
								value={config.iconLibrary}
								options={ICON_LIBRARY_OPTIONS as unknown as string[]}
								onSelect={(v) =>
									updateKnob("iconLibrary", v as PresetConfig["iconLibrary"])
								}
							/>
							<DropdownKnob
								label="Menu accent"
								value={config.menuAccent}
								options={MENU_ACCENT_OPTIONS as unknown as string[]}
								onSelect={(v) =>
									updateKnob("menuAccent", v as PresetConfig["menuAccent"])
								}
							/>
							<DropdownKnob
								label="Menu color"
								value={config.menuColor}
								options={MENU_COLOR_OPTIONS as unknown as string[]}
								onSelect={(v) =>
									updateKnob("menuColor", v as PresetConfig["menuColor"])
								}
								formatLabel={formatMenuColorLabel}
							/>
						</div>
					</CollapsibleContent>
				</Collapsible>

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

function KnobLabel({ children }: { children: React.ReactNode }) {
	return (
		<span className="text-[13px] font-medium text-foreground">{children}</span>
	);
}

function ThemeColorGrid({
	value,
	onSelect,
}: {
	value: string;
	onSelect: (theme: PresetConfig["theme"]) => void;
}) {
	return (
		<div className="flex flex-col gap-2.5">
			<KnobLabel>Theme color</KnobLabel>
			<div className="grid grid-cols-[repeat(auto-fill,minmax(32px,1fr))] gap-1.5">
				{THEME_COLOR_OPTIONS.map((theme) => {
					const hex = themeColorHex(theme);
					const isSelected = theme === value;
					return (
						<button
							key={theme}
							type="button"
							title={theme}
							aria-label={`Theme color: ${theme}`}
							aria-pressed={isSelected}
							onClick={() => onSelect(theme)}
							className={cn(
								"group relative aspect-square w-full rounded-lg transition-all duration-150",
								isSelected
									? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
									: "ring-1 ring-black/[0.06] hover:ring-black/20 dark:ring-white/10 dark:hover:ring-white/25",
							)}
							style={{ backgroundColor: hex }}
						>
							{isSelected && (
								<CheckIcon className="absolute inset-0 m-auto size-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
							)}
						</button>
					);
				})}
			</div>
			<span className="text-[11px] capitalize text-muted-foreground">
				{value}
			</span>
		</div>
	);
}

function StyleSelector({
	value,
	onSelect,
}: {
	value: string;
	onSelect: (style: PresetConfig["style"]) => void;
}) {
	return (
		<div className="flex flex-col gap-2.5">
			<KnobLabel>Style</KnobLabel>
			<div className="flex gap-1.5">
				{STYLE_OPTIONS.map((style) => {
					const isSelected = style === value;
					return (
						<button
							key={style}
							type="button"
							aria-pressed={isSelected}
							onClick={() => onSelect(style)}
							className={cn(
								"flex h-8 flex-1 items-center justify-center rounded-lg text-xs font-medium capitalize transition-all duration-150",
								isSelected
									? "bg-foreground text-background shadow-sm"
									: "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
						>
							{style}
						</button>
					);
				})}
			</div>
		</div>
	);
}

function FontSelector({
	value,
	onSelect,
}: {
	value: string;
	onSelect: (font: PresetConfig["font"]) => void;
}) {
	return (
		<div className="flex flex-col gap-2">
			<KnobLabel>Font</KnobLabel>
			<Select
				value={value}
				onValueChange={(v) => onSelect(v as PresetConfig["font"])}
			>
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{FONT_OPTIONS.map((font) => (
						<SelectItem key={font} value={font}>
							{formatFontLabel(font)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

function RadiusSelector({
	value,
	onSelect,
}: {
	value: string;
	onSelect: (radius: PresetConfig["radius"]) => void;
}) {
	const radiusPreview: Record<string, string> = {
		none: "rounded-none",
		small: "rounded-sm",
		medium: "rounded-md",
		default: "rounded-lg",
		large: "rounded-xl",
	};

	return (
		<div className="flex flex-col gap-2">
			<KnobLabel>Radius</KnobLabel>
			<div className="flex gap-1">
				{RADIUS_OPTIONS.map((radius) => {
					const isSelected = radius === value;
					return (
						<button
							key={radius}
							type="button"
							title={radius}
							aria-label={`Border radius: ${radius}`}
							aria-pressed={isSelected}
							onClick={() => onSelect(radius)}
							className={cn(
								"flex flex-1 items-center justify-center p-1.5 rounded-md transition-all duration-150",
								isSelected ? "bg-foreground/10" : "hover:bg-muted",
							)}
						>
							<div
								className={cn(
									"size-5 border-2 transition-all duration-150",
									radiusPreview[radius],
									isSelected
										? "border-foreground"
										: "border-muted-foreground/30",
								)}
							/>
						</button>
					);
				})}
			</div>
		</div>
	);
}

function DropdownKnob({
	label,
	value,
	options,
	onSelect,
	formatLabel,
}: {
	label: string;
	value: string;
	options: string[];
	onSelect: (v: string) => void;
	formatLabel?: (v: string) => string;
}) {
	const fmt =
		formatLabel ?? ((v: string) => v.charAt(0).toUpperCase() + v.slice(1));
	return (
		<div className="flex flex-col gap-2">
			<KnobLabel>{label}</KnobLabel>
			<Select value={value} onValueChange={onSelect}>
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map((opt) => (
						<SelectItem key={opt} value={opt}>
							{fmt(opt)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
