"use client";

import { ChevronDownIcon } from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
	type PresetConfig,
	BASE_COLOR_OPTIONS,
	ICON_LIBRARY_OPTIONS,
	MENU_ACCENT_OPTIONS,
	MENU_COLOR_OPTIONS,
	formatMenuColorLabel,
} from "@/lib/blueprint-flow/blueprint-theme-helpers";
import { ThemeDropdownKnob } from "@/app/(workspace)/_components/blueprint-flow/blueprint-theme-configurator-knob";

export function BlueprintThemeAdvancedOptions({
	config,
	onUpdate,
	open,
	onOpenChange,
}: {
	config: PresetConfig;
	onUpdate: <K extends keyof PresetConfig>(
		key: K,
		value: PresetConfig[K],
	) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Collapsible open={open} onOpenChange={onOpenChange}>
			<CollapsibleTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none"
				>
					<ChevronDownIcon
						className={cn(
							"size-3.5 transition-transform duration-200 motion-reduce:transition-none",
							open && "rotate-180",
						)}
					/>
					Advanced options
				</button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="mt-4 grid grid-cols-2 gap-4">
					<ThemeDropdownKnob
						label="Base color"
						value={config.baseColor}
						options={BASE_COLOR_OPTIONS as unknown as string[]}
						onSelect={(v) =>
							onUpdate("baseColor", v as PresetConfig["baseColor"])
						}
					/>
					<ThemeDropdownKnob
						label="Icon library"
						value={config.iconLibrary}
						options={ICON_LIBRARY_OPTIONS as unknown as string[]}
						onSelect={(v) =>
							onUpdate("iconLibrary", v as PresetConfig["iconLibrary"])
						}
					/>
					<ThemeDropdownKnob
						label="Menu accent"
						value={config.menuAccent}
						options={MENU_ACCENT_OPTIONS as unknown as string[]}
						onSelect={(v) =>
							onUpdate("menuAccent", v as PresetConfig["menuAccent"])
						}
					/>
					<ThemeDropdownKnob
						label="Menu color"
						value={config.menuColor}
						options={MENU_COLOR_OPTIONS as unknown as string[]}
						onSelect={(v) =>
							onUpdate("menuColor", v as PresetConfig["menuColor"])
						}
						formatLabel={formatMenuColorLabel}
					/>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
