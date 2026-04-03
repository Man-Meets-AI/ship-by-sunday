import {
	blueprintFieldPromptKind,
	type CanonicalProjectFactsDraft,
	type CanonicalProjectFactKey,
	type BlueprintStageId,
} from "@manmeetsai/blueprint-compiler";

export type BlueprintFieldScaleOption = {
	value: string;
	label: string;
	ariaLabel: string;
};

export type BlueprintFieldScaleDefinition = {
	leftLabel: string;
	centerLabel?: string;
	rightLabel: string;
	options: readonly BlueprintFieldScaleOption[];
};

export type BlueprintFieldInputKind = "input" | "number" | "textarea";

type BlueprintFieldPresentation = {
	label: string | ((facts: CanonicalProjectFactsDraft) => string);
	helperText?: string | ((facts: CanonicalProjectFactsDraft) => string);
};

const problemSeverityScaleValues = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
] as const;

const problemUrgencyValues = [
	"Can schedule",
	"Needs attention soon",
	"Needs action now",
] as const;

const blueprintFieldScaleDefinitions: Partial<
	Record<CanonicalProjectFactKey, BlueprintFieldScaleDefinition>
> = {
	problem_severity: {
		leftLabel: "Minor annoyance",
		centerLabel: "Real friction",
		rightLabel: "Critical blocker",
		options: problemSeverityScaleValues.map((value) => ({
			value,
			label: value,
			ariaLabel: `Pain ${value} out of 10`,
		})),
	},
	problem_urgency: {
		leftLabel: "Can wait",
		centerLabel: "Needs planning",
		rightLabel: "Immediate",
		options: [
			{
				value: problemUrgencyValues[0],
				label: "Can schedule",
				ariaLabel: "Urgency can schedule",
			},
			{
				value: problemUrgencyValues[1],
				label: "Needs attention soon",
				ariaLabel: "Urgency needs attention soon",
			},
			{
				value: problemUrgencyValues[2],
				label: "Needs action now",
				ariaLabel: "Urgency needs action now",
			},
		],
	},
};

const blueprintFieldPresentations: Partial<
	Record<CanonicalProjectFactKey, BlueprintFieldPresentation>
> = {
	product_name: {
		label: "What's the name?",
		helperText: "Enter the public-facing product name.",
	},
	product_summary: {
		label: "What's the one-liner?",
		helperText: "Describe the offer in one clear sentence.",
	},
	primary_user: {
		label: "Who wants this? Who benefits from this?",
		helperText: "Identify the person who most wants the outcome.",
	},
	problem_statement: {
		label: (facts) =>
			facts.product_name?.trim()
				? `What does ${facts.product_name.trim()} solve?`
				: "What does this solve?",
		helperText: "Describe the problem in plain, specific language.",
	},
	problem_trigger: {
		label: "When does this problem hit?",
		helperText:
			"Describe the moment the pain shows up. Include what they are trying to do, where they are, and what causes the friction.",
	},
	problem_severity: {
		label: "How painful is this problem?",
	},
	success_looks_like: {
		label: "What does success look like?",
	},
	core_flow: {
		label: "What happens, step by step?",
		helperText:
			"Use a numbered list. Write one step per line in the order the user moves through the flow.",
	},
	scope_in: {
		label: "What absolutely has to get built?",
		helperText:
			"Optional. Leave blank to use the generated default from your core flow.",
	},
	scope_out: {
		label: "What can we cut if we had to?",
		helperText:
			"Optional. Leave blank to use the generated default from your core flow.",
	},
	design_references: {
		label: "What should this feel like?",
		helperText: "Add links only, one per line.",
	},
	theme_hex: {
		label: "What theme color should anchor the UI?",
		helperText:
			"Use the default if it already feels right, or paste a hex from a shadcn preset.",
	},
	pricing: {
		label: "What's the one-time price in USD?",
		helperText: "Enter just the numeric dollar amount, like 29 or 99.",
	},
	domain: {
		label: "What domain should this live on?",
	},
	contact_email: {
		label: "What email should people use if they need help?",
		helperText:
			"Optional. On web this starts with your signed-in email, and you can change it.",
	},
};

const blueprintStepLabelOverrides: Partial<
	Record<`${BlueprintStageId}/${string}`, string>
> = {
	"product/outcome": "What success looks like",
	"build-plan/setup": "Optional setup details",
};

function resolveBlueprintPresentationCopy(
	value:
		| BlueprintFieldPresentation["label"]
		| BlueprintFieldPresentation["helperText"],
	facts: CanonicalProjectFactsDraft,
) {
	if (!value) {
		return null;
	}
	return typeof value === "function" ? value(facts) : value;
}

export function getBlueprintFieldScaleDefinition(
	fieldKey: CanonicalProjectFactKey,
) {
	return blueprintFieldScaleDefinitions[fieldKey] ?? null;
}

export function getBlueprintStepLabel(
	stageId: BlueprintStageId,
	stepId: string,
) {
	return blueprintStepLabelOverrides[`${stageId}/${stepId}`] ?? null;
}

export function blueprintFieldLabel(
	fieldKey: CanonicalProjectFactKey | string,
	facts: CanonicalProjectFactsDraft = {},
) {
	if (fieldKey in blueprintFieldPresentations) {
		const presentation =
			blueprintFieldPresentations[fieldKey as CanonicalProjectFactKey];
		const label = resolveBlueprintPresentationCopy(presentation?.label, facts);
		if (label) {
			return label;
		}
	}

	return fieldKey
		.split("_")
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(" ");
}

export function blueprintFieldHelperText(
	fieldKey: CanonicalProjectFactKey,
	facts: CanonicalProjectFactsDraft = {},
) {
	const presentation = blueprintFieldPresentations[fieldKey];
	return resolveBlueprintPresentationCopy(presentation?.helperText, facts);
}

export function blueprintFieldInputKind(
	fieldKey: CanonicalProjectFactKey,
): BlueprintFieldInputKind {
	const promptKind = blueprintFieldPromptKind(fieldKey);

	if (promptKind === "number") {
		return "number";
	}
	if (promptKind === "list" || promptKind === "long_text") {
		return "textarea";
	}
	return "input";
}
