export const FRESH_TEMPLATE_PLAN_FIELD_IDS = {
	manualPrompt: "fresh_template_plan_manual_prompt",
	reasoning: "fresh_template_plan_reasoning",
	referencePath: "fresh_template_plan_reference_path",
	includeConvex: "fresh_template_plan_include_convex",
	includeNextjs: "fresh_template_plan_include_nextjs",
	includeClerk: "fresh_template_plan_include_clerk",
	includeStripe: "fresh_template_plan_include_stripe",
	stackOther: "fresh_template_plan_stack_other",
	codexOutput: "fresh_template_plan_codex_output",
} as const;

export const FRESH_TEMPLATE_PLAN_DEFAULT_MANUAL_PROMPT =
	"Don't start coding yet. Come up with a plan. Once we discuss and I approve it, we can move forward.";

export type FreshTemplatePlanReasoning = "medium" | "high" | "extra_high";

export const FRESH_TEMPLATE_PLAN_REASONING_OPTIONS: Array<{
	value: FreshTemplatePlanReasoning;
	label: string;
	hint: string;
}> = [
	{
		value: "medium",
		label: "Medium",
		hint: "Default depth for straightforward planning.",
	},
	{
		value: "high",
		label: "High",
		hint: "Use when tradeoffs, dependencies, or architecture matter.",
	},
	{
		value: "extra_high",
		label: "Extra high",
		hint: "Use for ambiguous greenfield or high-stakes template choices.",
	},
];

export function parseFreshTemplatePlanReasoning(
	value: string | null | undefined,
): FreshTemplatePlanReasoning {
	if (value === "high" || value === "extra_high" || value === "medium") {
		return value;
	}
	return "medium";
}
