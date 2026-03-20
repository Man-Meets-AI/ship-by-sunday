import type { FreshTemplatePlanReasoning } from "./fresh-template-plan-constants";

export type BuildFreshTemplatePlanPromptInput = {
	manualBody: string;
	reasoning: FreshTemplatePlanReasoning;
	referencePath: string;
	includeConvex: boolean;
	includeNextjs: boolean;
	includeClerk: boolean;
	includeStripe: boolean;
	stackOther: string;
};

const REASONING_LABEL: Record<FreshTemplatePlanReasoning, string> = {
	medium: "Medium",
	high: "High",
	extra_high: "Extra high",
};

export function buildFreshTemplatePlanPrompt(
	input: BuildFreshTemplatePlanPromptInput,
): string {
	const body = input.manualBody.trim();
	const meta: string[] = [
		`Reasoning depth: ${REASONING_LABEL[input.reasoning]} (${input.reasoning}).`,
	];
	const path = input.referencePath.trim();
	if (path) {
		meta.push(`Reference codebase (local path): ${path}`);
	}
	const stackLabels: string[] = [];
	if (input.includeConvex) {
		stackLabels.push("Convex");
	}
	if (input.includeNextjs) {
		stackLabels.push("Next.js");
	}
	if (input.includeClerk) {
		stackLabels.push("Clerk");
	}
	if (input.includeStripe) {
		stackLabels.push("Stripe");
	}
	const other = input.stackOther.trim();
	if (stackLabels.length > 0 || other) {
		meta.push("Stack / context to account for:");
		for (const label of stackLabels) {
			meta.push(`- ${label}`);
		}
		if (other) {
			meta.push(`- Other: ${other}`);
		}
	}
	const tail = meta.join("\n");
	if (!body) {
		return tail;
	}
	return `${body}\n\n${tail}`;
}
