import {
	isBlueprintArrayField,
	isBlueprintNumericField,
	normalizeProblemSeverityValue,
	type CanonicalProjectFactKey,
	type CanonicalProjectFactsDraft,
} from "@shipbysunday/blueprint-compiler";
import { blueprintFieldLabel } from "@/lib/blueprint-flow/blueprint-field-helpers";

export const blueprintDraftableSectionIds = [
	"foundation",
	"problem",
	"outcome",
	"pricing",
	"setup",
] as const;

export type BlueprintDraftableSectionId =
	(typeof blueprintDraftableSectionIds)[number];

export const blueprintSectionDraftTemplateIdValues = [
	"blueprint_intake_foundation",
	"blueprint_intake_problem",
	"blueprint_intake_outcome",
	"blueprint_intake_pricing",
	"blueprint_intake_setup",
] as const;

type BlueprintSectionDraftSource = Partial<
	Record<CanonicalProjectFactKey, string | number | readonly string[]>
>;

export type BlueprintSectionDraftValues = Partial<
	Record<CanonicalProjectFactKey, string>
>;

type BlueprintSectionDraftConfig = {
	label: string;
	templateId: (typeof blueprintSectionDraftTemplateIdValues)[number];
	fieldKeys: readonly CanonicalProjectFactKey[];
	goal: string;
	fieldGuidance: readonly string[];
};

const blueprintSectionDraftConfigs = {
	foundation: {
		label: "Foundation",
		templateId: "blueprint_intake_foundation",
		fieldKeys: ["product_name", "product_summary", "primary_user"],
		goal: "Turn rough idea notes into a named product, one clear sentence, and a specific user segment.",
		fieldGuidance: [
			'product_name: a short working product name, not "Untitled" or a generic category.',
			"product_summary: one concrete sentence that says what the product helps the user do.",
			"primary_user: the clearest buyer or user segment, specific enough to build for.",
		],
	},
	problem: {
		label: "Problem",
		templateId: "blueprint_intake_problem",
		fieldKeys: ["problem_statement", "problem_trigger", "problem_severity"],
		goal: "Clarify the user's pain, when it hits, and how serious it is.",
		fieldGuidance: [
			"problem_statement: one plain-language paragraph naming the user, pain, and consequence.",
			"problem_trigger: the moment or situation when the pain becomes obvious.",
			'problem_severity: a string from "1" to "10" based on urgency and business impact.',
		],
	},
	outcome: {
		label: "Outcome",
		templateId: "blueprint_intake_outcome",
		fieldKeys: ["success_looks_like", "core_flow"],
		goal: "Create a concrete success state and a simple first user flow.",
		fieldGuidance: [
			"success_looks_like: one concrete paragraph describing the finished outcome the user gets.",
			"core_flow: an array of 4 to 6 short action steps, ordered from first touch to success.",
		],
	},
	pricing: {
		label: "Pricing",
		templateId: "blueprint_intake_pricing",
		fieldKeys: ["pricing_model", "pricing"],
		goal: "Choose a simple starter pricing model and a reasonable first price.",
		fieldGuidance: [
			'pricing_model: exactly one of "one_time", "monthly", or "yearly".',
			"pricing: a numeric dollar amount as a string, with no currency symbol.",
		],
	},
	setup: {
		label: "Setup",
		templateId: "blueprint_intake_setup",
		fieldKeys: ["scope_in", "scope_out", "domain", "contact_email"],
		goal: "Draft the build boundaries and optional launch handoff details.",
		fieldGuidance: [
			"scope_in: an array of must-build features for the first shippable version.",
			"scope_out: an array of useful cuts that keep the first build small.",
			"domain: a plausible product domain only when the product name makes one clear.",
			"contact_email: preserve an existing email, or use a support-style email only if the domain is clear.",
		],
	},
} as const satisfies Record<
	BlueprintDraftableSectionId,
	BlueprintSectionDraftConfig
>;

const blueprintIntakeContextFieldKeys = blueprintDraftableSectionIds.flatMap(
	(sectionId) => blueprintSectionDraftConfigs[sectionId].fieldKeys,
);

export function isBlueprintSectionDraftable(
	sectionId: string,
): sectionId is BlueprintDraftableSectionId {
	return blueprintDraftableSectionIds.includes(
		sectionId as BlueprintDraftableSectionId,
	);
}

function formatDraftSourceValue(
	draftValues: BlueprintSectionDraftSource,
	fieldKey: CanonicalProjectFactKey,
) {
	const value = draftValues[fieldKey];
	if (Array.isArray(value)) {
		return value.join("; ");
	}
	if (typeof value === "number") {
		return String(value);
	}
	if (typeof value === "string") {
		return value.trim() || "(blank)";
	}
	return "(blank)";
}

function formatFieldListForPrompt(
	fieldKeys: readonly CanonicalProjectFactKey[],
	draftValues: BlueprintSectionDraftSource,
	facts: CanonicalProjectFactsDraft,
) {
	return fieldKeys.map((fieldKey) => {
		const label = blueprintFieldLabel(fieldKey, facts);
		return `- ${fieldKey} (${label}): ${formatDraftSourceValue(draftValues, fieldKey)}`;
	});
}

export function buildBlueprintSectionDraftRequest(
	sectionId: BlueprintDraftableSectionId,
	draftValues: BlueprintSectionDraftSource,
) {
	const config = blueprintSectionDraftConfigs[sectionId];
	const facts = draftValues as CanonicalProjectFactsDraft;
	const promptLines = [
		"You are helping a Ship by Sunday founder turn rough intake notes into an editable blueprint first draft.",
		"Use the founder's existing words as source material, but make the draft clearer, more specific, and easier to edit.",
		"Do not ask follow-up questions.",
		"Return JSON only. Do not include markdown, code fences, comments, labels outside JSON, or explanation.",
		`Return exactly one JSON object with these keys: ${config.fieldKeys.join(", ")}.`,
		"If a value is unknown, make the safest honest inference from context. Do not use placeholders like TBD, example.com, or your@email.com.",
		"Keep every value concise enough to fit in a form field.",
		"",
		`Section: ${config.label}`,
		`Goal: ${config.goal}`,
		"",
		"Field guidance:",
		...config.fieldGuidance.map((line) => `- ${line}`),
		"",
		"Current section values:",
		...formatFieldListForPrompt(config.fieldKeys, draftValues, facts),
		"",
		"Relevant full-intake context:",
		...formatFieldListForPrompt(
			blueprintIntakeContextFieldKeys,
			draftValues,
			facts,
		),
	];

	return {
		templateId: config.templateId,
		prompt: promptLines.join("\n"),
	};
}

function stripJsonCodeFence(output: string) {
	const trimmedOutput = output.trim();
	return trimmedOutput
		.replace(/^```(?:json)?\s*/i, "")
		.replace(/\s*```$/i, "")
		.trim();
}

function parseJsonObject(output: string): Record<string, unknown> {
	const strippedOutput = stripJsonCodeFence(output);
	const objectMatch = strippedOutput.match(/\{[\s\S]*\}/);
	const jsonText = objectMatch?.[0] ?? strippedOutput;

	try {
		const parsed = JSON.parse(jsonText) as unknown;
		if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
			return parsed as Record<string, unknown>;
		}
	} catch {
		// Fall through to the domain error below.
	}

	throw new Error("Codex returned a response that was not a JSON object.");
}

function normalizeArrayFieldValue(value: unknown) {
	const items = Array.isArray(value)
		? value
		: typeof value === "string"
			? value.split(/\n|,|;/)
			: [];
	const normalizedItems = items
		.map((item) => String(item).trim())
		.filter(Boolean);

	return normalizedItems.length > 0 ? normalizedItems.join("\n") : null;
}

function normalizePricingModelValue(value: string) {
	const normalizedValue = value.trim().toLowerCase().replaceAll("-", "_");
	if (normalizedValue === "one_time" || normalizedValue.includes("one time")) {
		return "one_time";
	}
	if (normalizedValue === "monthly" || normalizedValue.includes("month")) {
		return "monthly";
	}
	if (
		normalizedValue === "yearly" ||
		normalizedValue.includes("year") ||
		normalizedValue.includes("annual")
	) {
		return "yearly";
	}

	return null;
}

function normalizeNumericFieldValue(value: unknown) {
	const rawValue = String(value);
	const match = rawValue.match(/\d+(?:\.\d+)?/);
	if (!match) {
		return null;
	}

	const numericValue = Number(match[0]);
	if (!Number.isFinite(numericValue)) {
		return null;
	}

	return String(Math.round(numericValue));
}

function normalizeSectionDraftValue(
	fieldKey: CanonicalProjectFactKey,
	value: unknown,
) {
	if (value === null || value === undefined) {
		return null;
	}
	if (isBlueprintArrayField(fieldKey)) {
		return normalizeArrayFieldValue(value);
	}
	if (isBlueprintNumericField(fieldKey)) {
		return normalizeNumericFieldValue(value);
	}

	const textValue = String(value).trim();
	if (!textValue) {
		return null;
	}
	if (fieldKey === "problem_severity") {
		return normalizeProblemSeverityValue(textValue) || null;
	}
	if (fieldKey === "pricing_model") {
		return normalizePricingModelValue(textValue);
	}

	return textValue;
}

export function parseBlueprintSectionDraftOutput(
	sectionId: BlueprintDraftableSectionId,
	output: string,
): BlueprintSectionDraftValues {
	const config = blueprintSectionDraftConfigs[sectionId];
	const parsedOutput = parseJsonObject(output);
	const draftValues: BlueprintSectionDraftValues = {};

	for (const fieldKey of config.fieldKeys) {
		const nextValue = normalizeSectionDraftValue(
			fieldKey,
			parsedOutput[fieldKey],
		);
		if (nextValue) {
			draftValues[fieldKey] = nextValue;
		}
	}

	return draftValues;
}
