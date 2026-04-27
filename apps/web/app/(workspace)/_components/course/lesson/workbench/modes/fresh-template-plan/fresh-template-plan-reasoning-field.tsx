"use client";

import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
	FRESH_TEMPLATE_PLAN_FIELD_IDS,
	FRESH_TEMPLATE_PLAN_REASONING_OPTIONS,
	type FreshTemplatePlanReasoning,
} from "@/lib/course/lesson/workbench/modes/fresh-template-plan/fresh-template-plan-constants";

type FreshTemplatePlanReasoningFieldProps = {
	reasoning: FreshTemplatePlanReasoning;
	invalid: boolean;
	onReasoningChange: (value: FreshTemplatePlanReasoning) => void;
};

export function FreshTemplatePlanReasoningField({
	reasoning,
	invalid,
	onReasoningChange,
}: FreshTemplatePlanReasoningFieldProps) {
	const ids = FRESH_TEMPLATE_PLAN_FIELD_IDS;
	const hint =
		FRESH_TEMPLATE_PLAN_REASONING_OPTIONS.find((o) => o.value === reasoning)
			?.hint ?? "";

	return (
		<Field data-invalid={invalid ? true : undefined}>
			<FieldLabel>Reasoning depth</FieldLabel>
			<FieldContent>
				<RadioGroup
					value={reasoning}
					onValueChange={(next) => {
						if (next === "medium" || next === "high" || next === "extra_high") {
							onReasoningChange(next);
						}
					}}
					className="gap-3"
					aria-invalid={invalid}
				>
					{FRESH_TEMPLATE_PLAN_REASONING_OPTIONS.map((opt) => {
						const itemId = `${ids.reasoning}-${opt.value}`;
						return (
							<div key={opt.value} className="flex items-center gap-2">
								<RadioGroupItem value={opt.value} id={itemId} />
								<Label htmlFor={itemId} className="font-normal">
									{opt.label}
								</Label>
							</div>
						);
					})}
				</RadioGroup>
				<FieldDescription>{hint}</FieldDescription>
			</FieldContent>
		</Field>
	);
}
