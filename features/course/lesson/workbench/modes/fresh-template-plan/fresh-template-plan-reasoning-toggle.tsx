"use client";

import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
	FRESH_TEMPLATE_PLAN_REASONING_OPTIONS,
	type FreshTemplatePlanReasoning,
} from "./fresh-template-plan-constants";

type FreshTemplatePlanReasoningToggleProps = {
	reasoning: FreshTemplatePlanReasoning;
	onReasoningChange: (value: FreshTemplatePlanReasoning) => void;
	invalid: boolean;
};

export function FreshTemplatePlanReasoningToggle({
	reasoning,
	onReasoningChange,
	invalid,
}: FreshTemplatePlanReasoningToggleProps) {
	return (
		<div className="space-y-2">
			<Label className="text-xs font-medium">Reasoning depth</Label>
			<ToggleGroup
				type="single"
				variant="outline"
				spacing={0}
				value={reasoning}
				onValueChange={(next) => {
					if (next === "medium" || next === "high" || next === "extra_high") {
						onReasoningChange(next);
					}
				}}
				className={invalid ? "rounded-lg ring-2 ring-destructive" : ""}
				aria-invalid={invalid}
			>
				{FRESH_TEMPLATE_PLAN_REASONING_OPTIONS.map((opt) => (
					<ToggleGroupItem
						key={opt.value}
						value={opt.value}
						className="px-2.5 text-xs sm:text-sm"
						aria-label={opt.label}
					>
						{opt.label}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
			<p className="text-xs text-muted-foreground">
				{FRESH_TEMPLATE_PLAN_REASONING_OPTIONS.find((o) => o.value === reasoning)
					?.hint ?? ""}
			</p>
		</div>
	);
}
