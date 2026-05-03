"use client";

import { CheckIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	type PresetConfig,
	THEME_COLOR_OPTIONS,
	STYLE_OPTIONS,
	FONT_OPTIONS,
	themeColorHex,
	formatFontLabel,
} from "@/lib/blueprint-flow/blueprint-theme-helpers";
import { useBlueprintPageReducedMotion } from "@/app/(workspace)/_components/blueprint-flow/blueprint-page-motion";
import { ThemeKnobLabel } from "@/app/(workspace)/_components/blueprint-flow/blueprint-theme-configurator-knob";

export { RadiusSelector } from "@/app/(workspace)/_components/blueprint-flow/blueprint-theme-radius-selector";

export function ThemeColorGrid({
	value,
	onSelect,
}: {
	value: string;
	onSelect: (theme: PresetConfig["theme"]) => void;
}) {
	const prefersReducedMotion = useBlueprintPageReducedMotion();
	return (
		<div className="flex flex-col gap-2.5">
			<ThemeKnobLabel>Theme color</ThemeKnobLabel>
			<div className="grid grid-cols-[repeat(auto-fill,minmax(32px,1fr))] gap-1.5">
				{THEME_COLOR_OPTIONS.map((theme) => {
					const hex = themeColorHex(theme);
					const isSelected = theme === value;
					return (
						<motion.button
							key={theme}
							type="button"
							title={theme}
							aria-label={`Theme color: ${theme}`}
							aria-pressed={isSelected}
							onClick={() => onSelect(theme)}
							whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
							transition={{ duration: 0.15, ease: "easeOut" }}
							className={cn(
								"relative aspect-square w-full rounded-lg transition-all duration-150 motion-reduce:transition-none",
								isSelected
									? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
									: "ring-1 ring-black/[0.06] hover:ring-black/20 dark:ring-white/10 dark:hover:ring-white/25",
							)}
							style={{ backgroundColor: hex }}
						>
							{isSelected && (
								<CheckIcon className="absolute inset-0 m-auto size-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
							)}
						</motion.button>
					);
				})}
			</div>
			<span className="text-[11px] capitalize text-muted-foreground">
				{value}
			</span>
		</div>
	);
}

export function StyleSelector({
	value,
	onSelect,
}: {
	value: string;
	onSelect: (style: PresetConfig["style"]) => void;
}) {
	const prefersReducedMotion = useBlueprintPageReducedMotion();
	return (
		<div className="flex flex-col gap-2.5">
			<ThemeKnobLabel>Style</ThemeKnobLabel>
			<div className="flex gap-1.5">
				{STYLE_OPTIONS.map((style) => {
					const isSelected = style === value;
					return (
						<motion.button
							key={style}
							type="button"
							aria-pressed={isSelected}
							onClick={() => onSelect(style)}
							whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
							transition={{ duration: 0.15, ease: "easeOut" }}
							className={cn(
								"flex h-8 flex-1 items-center justify-center rounded-lg text-xs font-medium capitalize transition-all duration-150 motion-reduce:transition-none",
								isSelected
									? "bg-foreground text-background shadow-sm"
									: "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
						>
							{style}
						</motion.button>
					);
				})}
			</div>
		</div>
	);
}

export function FontSelector({
	value,
	onSelect,
}: {
	value: string;
	onSelect: (font: PresetConfig["font"]) => void;
}) {
	return (
		<div className="flex flex-col gap-2">
			<ThemeKnobLabel>Font</ThemeKnobLabel>
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
