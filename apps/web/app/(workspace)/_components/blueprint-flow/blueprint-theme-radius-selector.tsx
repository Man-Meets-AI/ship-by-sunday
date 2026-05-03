"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
	type PresetConfig,
	RADIUS_OPTIONS,
} from "@/lib/blueprint-flow/blueprint-theme-helpers";
import { useBlueprintPageReducedMotion } from "@/app/(workspace)/_components/blueprint-flow/blueprint-page-motion";
import { ThemeKnobLabel } from "@/app/(workspace)/_components/blueprint-flow/blueprint-theme-configurator-knob";

const RADIUS_PREVIEW_CLASS: Record<string, string> = {
	none: "rounded-none",
	small: "rounded-sm",
	medium: "rounded-md",
	default: "rounded-lg",
	large: "rounded-xl",
};

export function RadiusSelector({
	value,
	onSelect,
}: {
	value: string;
	onSelect: (radius: PresetConfig["radius"]) => void;
}) {
	const prefersReducedMotion = useBlueprintPageReducedMotion();
	return (
		<div className="flex flex-col gap-2">
			<ThemeKnobLabel>Radius</ThemeKnobLabel>
			<div className="flex gap-1">
				{RADIUS_OPTIONS.map((radius) => {
					const isSelected = radius === value;
					return (
						<motion.button
							key={radius}
							type="button"
							title={radius}
							aria-label={`Border radius: ${radius}`}
							aria-pressed={isSelected}
							onClick={() => onSelect(radius)}
							whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
							transition={{ duration: 0.15, ease: "easeOut" }}
							className={cn(
								"flex flex-1 items-center justify-center rounded-md p-1.5 transition-all duration-150 motion-reduce:transition-none",
								isSelected ? "bg-foreground/10" : "hover:bg-muted",
							)}
						>
							<div
								className={cn(
									"size-5 border-2 transition-all duration-150 motion-reduce:transition-none",
									RADIUS_PREVIEW_CLASS[radius],
									isSelected
										? "border-foreground"
										: "border-muted-foreground/30",
								)}
							/>
						</motion.button>
					);
				})}
			</div>
		</div>
	);
}
