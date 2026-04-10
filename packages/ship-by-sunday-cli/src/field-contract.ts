import { createCliError } from "./cli-errors";
import {
	DEFAULT_DESIGN_PRESET_ID,
	buildDesignPresetFactSeed,
} from "@shipbysunday/blueprint-compiler";

export type CliBlueprintStageId = "blueprint" | "review";

export type EditableCliBlueprintStageId = Extract<
	CliBlueprintStageId,
	"blueprint"
>;

export type ReviewableCliBlueprintStageId = CliBlueprintStageId;

export type CliBlueprintFactKey =
	| "product_name"
	| "product_summary"
	| "primary_user"
	| "problem_statement"
	| "problem_trigger"
	| "problem_severity"
	| "success_looks_like"
	| "core_flow"
	| "pricing"
	| "design_preset_id"
	| "theme_preset"
	| "design_references"
	| "scope_in"
	| "scope_out"
	| "domain"
	| "contact_email";

export type CliBlueprintFactValue = string | number | string[];
export type CliBlueprintFactsDraft = Partial<
	Record<CliBlueprintFactKey, CliBlueprintFactValue>
>;

type CliBlueprintFieldPromptKind = "text" | "number" | "list" | "long_text";

type CliBlueprintStepDefinition = {
	id: string;
	label: string;
	fieldKeys: readonly CliBlueprintFactKey[];
	requiredFieldKeys?: readonly CliBlueprintFactKey[];
};

export type CliBlueprintStageDefinition = {
	id: CliBlueprintStageId;
	label: string;
	description: string;
	route: `/${string}`;
	steps: readonly CliBlueprintStepDefinition[];
};

export type CliFieldDescriptor = {
	fieldKey: CliBlueprintFactKey;
	label: string;
	promptKind: CliBlueprintFieldPromptKind;
	stageId: EditableCliBlueprintStageId;
	stageLabel: string;
	stepId: string;
	stepLabel: string;
	required: boolean;
	placeholderFriendly: boolean;
};

export const DEFAULT_THEME_PRESET = buildDesignPresetFactSeed(
	DEFAULT_DESIGN_PRESET_ID,
).theme_preset;

type CliDesignPresetFieldKey = Extract<
	CliBlueprintFactKey,
	"design_preset_id" | "theme_preset" | "design_references"
>;

function normalizeDesignPresetId(value: string | undefined) {
	const trimmedValue = value?.trim();
	return trimmedValue && trimmedValue.length > 0
		? trimmedValue
		: DEFAULT_DESIGN_PRESET_ID;
}

export function buildCliDesignPresetSeed(
	presetId: string | undefined,
): Record<CliDesignPresetFieldKey, string | string[]> {
	const presetSeed = buildDesignPresetFactSeed(
		normalizeDesignPresetId(presetId),
	);

	return {
		design_preset_id: presetSeed.design_preset_id,
		theme_preset: presetSeed.theme_preset,
		design_references: [...presetSeed.design_references],
	};
}

export function applyCliDesignPresetSelection(
	facts: CliBlueprintFactsDraft,
	presetId: string | undefined,
): CliBlueprintFactsDraft {
	return {
		...facts,
		...buildCliDesignPresetSeed(presetId),
	};
}

const cliBlueprintStageDefinitions = [
	{
		id: "blueprint",
		label: "Blueprint",
		description: "Lock the full reduced blueprint on one page.",
		route: "/blueprint",
		steps: [
			{
				id: "foundation",
				label: "Foundation",
				fieldKeys: ["product_name", "product_summary", "primary_user"],
			},
			{
				id: "problem",
				label: "Problem",
				fieldKeys: ["problem_statement", "problem_trigger", "problem_severity"],
			},
			{
				id: "outcome",
				label: "Outcome",
				fieldKeys: ["success_looks_like", "core_flow"],
			},
			{
				id: "design",
				label: "Design",
				fieldKeys: ["design_preset_id", "theme_preset", "design_references"],
				requiredFieldKeys: [],
			},
			{
				id: "pricing",
				label: "Pricing",
				fieldKeys: ["pricing"],
				requiredFieldKeys: ["pricing"],
			},
			{
				id: "setup",
				label: "Setup",
				fieldKeys: ["scope_in", "scope_out", "domain", "contact_email"],
				requiredFieldKeys: [],
			},
			{
				id: "generated-preview",
				label: "Generated preview",
				fieldKeys: [],
				requiredFieldKeys: [],
			},
		],
	},
	{
		id: "review",
		label: "Review",
		description: "Review readiness and download the blueprint.",
		route: "/review",
		steps: [],
	},
] as const satisfies readonly CliBlueprintStageDefinition[];

export const cliBlueprintStageIds = cliBlueprintStageDefinitions.map(
	(stage) => stage.id,
);

const cliBlueprintStageDefinitionById = new Map(
	cliBlueprintStageDefinitions.map((stage) => [stage.id, stage]),
);

const placeholderFriendlyFieldKeys = new Set<CliBlueprintFactKey>([
	"domain",
	"contact_email",
]);

const longTextFieldKeys = new Set<CliBlueprintFactKey>([
	"product_summary",
	"problem_statement",
	"problem_trigger",
	"success_looks_like",
]);

const listFieldKeys = new Set<CliBlueprintFactKey>([
	"core_flow",
	"design_references",
	"scope_in",
	"scope_out",
]);
const cliStageAliasMap = {
	product: "blueprint",
	design: "blueprint",
	marketing: "blueprint",
	"build-plan": "blueprint",
} as const;

function isEditableStageId(
	value: string,
): value is EditableCliBlueprintStageId {
	return value === "blueprint";
}

function normalizeEditableStageId(value: string) {
	return cliStageAliasMap[value as keyof typeof cliStageAliasMap] ?? value;
}

function isCliBlueprintArrayField(fieldKey: CliBlueprintFactKey) {
	return listFieldKeys.has(fieldKey);
}

function getRequiredFieldKeys(
	step: CliBlueprintStageDefinition["steps"][number],
): readonly CliBlueprintFactKey[] {
	return "requiredFieldKeys" in step && step.requiredFieldKeys
		? [...step.requiredFieldKeys]
		: [...step.fieldKeys];
}

function isFactMissing(
	fieldKey: CliBlueprintFactKey,
	value: CliBlueprintFactValue | undefined,
) {
	if (value === undefined || value === null) {
		return true;
	}

	if (typeof value === "string") {
		return value.trim().length === 0;
	}

	if (Array.isArray(value)) {
		return value.length === 0;
	}

	if (fieldKey === "pricing") {
		return Number.isNaN(value);
	}

	return false;
}

export function getBlueprintStageDefinition(
	stageId: CliBlueprintStageId,
): CliBlueprintStageDefinition {
	const stage = cliBlueprintStageDefinitionById.get(stageId);
	if (!stage) {
		throw new Error(`Unknown blueprint stage: ${stageId}`);
	}

	return stage;
}

export function isBlueprintArrayField(fieldKey: CliBlueprintFactKey) {
	return isCliBlueprintArrayField(fieldKey);
}

export function isBlueprintLongTextField(fieldKey: CliBlueprintFactKey) {
	return longTextFieldKeys.has(fieldKey);
}

export function isBlueprintNumericField(fieldKey: CliBlueprintFactKey) {
	return fieldKey === "pricing";
}

export function blueprintFieldPromptKind(
	fieldKey: CliBlueprintFactKey,
): CliBlueprintFieldPromptKind {
	if (isBlueprintNumericField(fieldKey)) {
		return "number";
	}
	if (isBlueprintArrayField(fieldKey)) {
		return "list";
	}
	if (isBlueprintLongTextField(fieldKey)) {
		return "long_text";
	}
	return "text";
}

export function blueprintFieldLabel(fieldKey: CliBlueprintFactKey) {
	switch (fieldKey) {
		case "product_name":
			return "Product name";
		case "product_summary":
			return "Product summary";
		case "primary_user":
			return "Primary user";
		case "problem_statement":
			return "Problem statement";
		case "problem_trigger":
			return "Problem trigger";
		case "problem_severity":
			return "Problem severity";
		case "success_looks_like":
			return "Success looks like";
		case "core_flow":
			return "Core flow";
		case "pricing":
			return "Pricing";
		case "design_preset_id":
			return "Design preset";
		case "theme_preset":
			return "Theme preset";
		case "design_references":
			return "Design references";
		case "scope_in":
			return "Scope in";
		case "scope_out":
			return "Scope out";
		case "domain":
			return "Domain";
		case "contact_email":
			return "Contact email";
	}
}

export function blueprintFieldHelperText(fieldKey: CliBlueprintFactKey) {
	switch (fieldKey) {
		case "product_summary":
			return "Describe the offer in plain language.";
		case "primary_user":
			return "Name the specific buyer or user.";
		case "problem_statement":
			return "State the pain in one sharp sentence.";
		case "problem_trigger":
			return "Describe the moment, place, and attempted action that makes the pain real.";
		case "problem_severity":
			return "Use 1 for mild pain and 10 for a blocker.";
		case "success_looks_like":
			return "Describe what changes when the problem is solved.";
		case "core_flow":
			return "Enter one numbered step per line.";
		case "pricing":
			return "Enter the one-time USD amount.";
		case "design_preset_id":
			return "Optional. Pick the curated starting point for the generated design system.";
		case "theme_preset":
			return `Optional. The default preset is already prefilled. Use shadcn init --preset <code> to apply it.`;
		case "design_references":
			return "Paste one link per line.";
		case "scope_in":
			return "Leave blank to use the generated default from core_flow.";
		case "scope_out":
			return "Leave blank to use the generated default from core_flow.";
		case "domain":
			return "Optional. Add the intended domain when you have one.";
		case "contact_email":
			return "Optional in the CLI. Add the support or contact email if you have one.";
		default:
			return "";
	}
}

function stripListMarker(entry: string) {
	return entry.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim();
}

function normalizeListValue(value: string | string[]) {
	const entries = Array.isArray(value)
		? value
		: value.split("\n").map((line) => line.trim());

	return entries.map(stripListMarker).filter((entry) => entry.length > 0);
}

function normalizeTextValue(value: string | number | string[]) {
	if (typeof value === "number") {
		return String(value);
	}
	if (Array.isArray(value)) {
		return value.join("\n");
	}
	return value.trim();
}

export function normalizeCliFactValue(
	fieldKey: CliBlueprintFactKey,
	value: unknown,
): CliBlueprintFactValue | undefined {
	if (value === null || value === undefined) {
		return undefined;
	}

	if (fieldKey === "problem_severity") {
		const trimmedValue = String(value).trim();
		if (!trimmedValue) {
			return undefined;
		}
		if (/^(?:10|[1-9])$/.test(trimmedValue)) {
			return trimmedValue;
		}
		const normalized = trimmedValue.toLowerCase();
		if (normalized === "low") {
			return "3";
		}
		if (normalized === "medium") {
			return "5";
		}
		if (normalized === "high") {
			return "8";
		}
		return undefined;
	}

	if (fieldKey === "pricing") {
		const numericValue =
			typeof value === "number" ? value : Number(String(value).trim());
		if (!Number.isFinite(numericValue)) {
			return undefined;
		}
		return numericValue;
	}

	if (isBlueprintArrayField(fieldKey)) {
		return normalizeListValue(value as string | string[]);
	}

	const normalizedText = normalizeTextValue(
		value as string | number | string[],
	);
	if (!normalizedText) {
		return undefined;
	}
	return normalizedText;
}

export function normalizeCliFactsDraft(
	input: Record<string, unknown>,
): CliBlueprintFactsDraft {
	const facts: CliBlueprintFactsDraft = {};

	for (const fieldKey of cliBlueprintFactKeys) {
		const nextValue = normalizeCliFactValue(fieldKey, input[fieldKey]);
		if (nextValue !== undefined) {
			facts[fieldKey] = nextValue;
		}
	}

	const normalizedPresetId =
		typeof facts.design_preset_id === "string"
			? facts.design_preset_id
			: undefined;
	const presetSeed = buildCliDesignPresetSeed(normalizedPresetId);

	facts.design_preset_id = presetSeed.design_preset_id;
	if (
		facts.theme_preset === undefined ||
		typeof facts.theme_preset !== "string" ||
		facts.theme_preset.trim().length === 0
	) {
		facts.theme_preset = presetSeed.theme_preset;
	}
	if (
		facts.design_references === undefined ||
		(Array.isArray(facts.design_references) &&
			facts.design_references.length === 0)
	) {
		facts.design_references = [...presetSeed.design_references];
	}

	return facts;
}

export function createThemePresetDefault() {
	return DEFAULT_THEME_PRESET;
}

export function createScopeFromCoreFlow(coreFlow: readonly string[]) {
	if (coreFlow.length === 0) {
		return {
			scopeIn: [] as string[],
			scopeOut: [] as string[],
		};
	}

	return {
		scopeIn: coreFlow.slice(0, 2).map((entry) => `Build ${entry}`),
		scopeOut: [
			"Anything outside the first release slice described in core flow.",
		],
	};
}

export function formatCliFactValue(
	facts: CliBlueprintFactsDraft,
	fieldKey: CliBlueprintFactKey,
) {
	const value =
		fieldKey === "theme_preset"
			? (facts.theme_preset ?? DEFAULT_THEME_PRESET)
			: fieldKey === "design_preset_id"
				? (facts.design_preset_id ?? DEFAULT_DESIGN_PRESET_ID)
				: facts[fieldKey];

	if (Array.isArray(value)) {
		if (fieldKey === "core_flow") {
			return value.map((entry, index) => `${index + 1}. ${entry}`).join("\n");
		}
		return value.join("\n");
	}

	if (typeof value === "number") {
		if (fieldKey === "pricing") {
			return value.toFixed(2).replace(/\.00$/, "");
		}
		return String(value);
	}

	if (fieldKey === "scope_in" || fieldKey === "scope_out") {
		if (Array.isArray(value) && value.length > 0) {
			return value.join("\n");
		}

		if (Array.isArray(value) && value.length === 0) {
			return "";
		}

		const coreFlow = Array.isArray(facts.core_flow) ? facts.core_flow : [];
		const generatedScopes = createScopeFromCoreFlow(coreFlow);
		const generatedScope =
			fieldKey === "scope_in"
				? generatedScopes.scopeIn
				: generatedScopes.scopeOut;
		return generatedScope.join("\n");
	}

	if (fieldKey === "theme_preset") {
		return value ?? DEFAULT_THEME_PRESET;
	}

	return value ?? "";
}

export function listFieldDescriptors(stageId?: EditableCliBlueprintStageId) {
	const descriptors = cliBlueprintStageDefinitions
		.filter(
			(
				stage,
			): stage is Extract<
				(typeof cliBlueprintStageDefinitions)[number],
				{ id: EditableCliBlueprintStageId }
			> => isEditableStageId(stage.id),
		)
		.flatMap((stage) =>
			stage.steps.flatMap((step) =>
				step.fieldKeys.map((fieldKey) => ({
					fieldKey,
					label: blueprintFieldLabel(fieldKey),
					promptKind: blueprintFieldPromptKind(fieldKey),
					stageId: stage.id,
					stageLabel: stage.label,
					stepId: step.id,
					stepLabel: step.label,
					required: getRequiredFieldKeys(step).includes(fieldKey),
					placeholderFriendly: placeholderFriendlyFieldKeys.has(fieldKey),
				})),
			),
		);

	if (!stageId) {
		return descriptors;
	}

	return descriptors.filter((descriptor) => descriptor.stageId === stageId);
}

export function listStageDescriptors() {
	return cliBlueprintStageDefinitions.map((stage) => ({
		stageId: stage.id,
		label: stage.label,
		description: stage.description,
		route: stage.route,
		stepCount: stage.steps.length,
		steps: stage.steps.map((step) => ({
			stepId: step.id,
			label: step.label,
			fieldKeys: [...step.fieldKeys],
			requiredFieldKeys: [...getRequiredFieldKeys(step)],
		})),
	}));
}

export function listSchemaDescriptor() {
	return {
		schemaVersion: 1,
		fieldCount: cliBlueprintFactKeys.length,
		placeholderFriendlyFields: [...placeholderFriendlyFieldKeys],
		fields: listFieldDescriptors(),
	};
}

export function parseFieldSelector(selector: string) {
	const [maybeStageId, maybeFieldKey, extraSegment] = selector.split(".");
	if (extraSegment) {
		throw createCliError(
			"invalid_args",
			`Invalid field selector "${selector}". Use "<fieldKey>" or "<stageId>.<fieldKey>".`,
			2,
		);
	}

	const normalizedStageId = normalizeEditableStageId(maybeStageId);
	if (maybeFieldKey && isEditableStageId(normalizedStageId)) {
		const fieldKey = maybeFieldKey as CliBlueprintFactKey;
		const descriptor = getFieldDescriptor(fieldKey);
		if (descriptor.stageId !== normalizedStageId) {
			throw createCliError(
				"invalid_stage",
				`Field "${fieldKey}" belongs to ${descriptor.stageLabel}, not ${getBlueprintStageDefinition(normalizedStageId).label}.`,
				2,
			);
		}
		return descriptor;
	}

	return getFieldDescriptor(maybeStageId as CliBlueprintFactKey);
}

const fieldDescriptorByKey = new Map(
	listFieldDescriptors().map((descriptor) => [descriptor.fieldKey, descriptor]),
);

export function getFieldDescriptor(fieldKey: CliBlueprintFactKey) {
	const descriptor = fieldDescriptorByKey.get(fieldKey);
	if (!descriptor) {
		throw createCliError("invalid_args", `Unknown field key "${fieldKey}".`, 2);
	}
	return descriptor;
}

function createStageStatusForStep(
	stageId: ReviewableCliBlueprintStageId,
	step: CliBlueprintStageDefinition["steps"][number],
	facts: CliBlueprintFactsDraft,
) {
	const missingFactKeys = step.requiredFieldKeys
		? step.requiredFieldKeys.filter((fieldKey) =>
				isFactMissing(fieldKey, facts[fieldKey]),
			)
		: step.fieldKeys.filter((fieldKey) =>
				isFactMissing(fieldKey, facts[fieldKey]),
			);

	return {
		stepId: step.id,
		stepLabel: step.label,
		isComplete: missingFactKeys.length === 0,
		missingFactKeys,
	};
}

export function deriveCliStageStatus(facts: CliBlueprintFactsDraft) {
	const blueprintStageDefinition = getBlueprintStageDefinition("blueprint");
	const blueprintStepStatuses = blueprintStageDefinition.steps.map((step) =>
		createStageStatusForStep("blueprint", step, facts),
	);
	const blueprintFirstIncompleteStepIndex = blueprintStepStatuses.findIndex(
		(stepStatus) => !stepStatus.isComplete,
	);
	const blueprintCurrentStepIndex =
		blueprintFirstIncompleteStepIndex === -1
			? Math.max(blueprintStageDefinition.steps.length - 1, 0)
			: blueprintFirstIncompleteStepIndex;
	const blueprintMissingFactKeys = Array.from(
		new Set(
			blueprintStepStatuses.flatMap((stepStatus) => stepStatus.missingFactKeys),
		),
	);
	const blueprintStageStatus = {
		stageId: "blueprint" as const,
		stageLabel: blueprintStageDefinition.label,
		currentStepIndex: blueprintCurrentStepIndex,
		isComplete: blueprintMissingFactKeys.length === 0,
		missingFactKeys: blueprintMissingFactKeys,
		stepStatuses: blueprintStepStatuses,
	};
	const reviewStageDefinition = getBlueprintStageDefinition("review");
	const reviewStageStatus = {
		stageId: "review" as const,
		stageLabel: reviewStageDefinition.label,
		currentStepIndex: 0,
		isComplete: blueprintStageStatus.isComplete,
		missingFactKeys: blueprintStageStatus.missingFactKeys,
		stepStatuses: [],
	};
	const stageStatuses = [blueprintStageStatus, reviewStageStatus];

	return {
		firstIncompleteStageId: blueprintStageStatus.isComplete
			? ("review" as const)
			: ("blueprint" as const),
		stageStatuses,
		blueprintReadiness: {
			blueprint: {
				isReady: blueprintStageStatus.isComplete,
				missingFactKeys: blueprintStageStatus.missingFactKeys,
			},
			review: {
				isReady: blueprintStageStatus.isComplete,
				missingFactKeys: blueprintStageStatus.missingFactKeys,
			},
		},
	};
}

export const deriveLocalDraftStatus = deriveCliStageStatus;

export const cliBlueprintFactKeys = [
	"product_name",
	"product_summary",
	"primary_user",
	"problem_statement",
	"problem_trigger",
	"problem_severity",
	"success_looks_like",
	"core_flow",
	"pricing",
	"design_preset_id",
	"theme_preset",
	"design_references",
	"scope_in",
	"scope_out",
	"domain",
	"contact_email",
] as const satisfies readonly CliBlueprintFactKey[];

export type BlueprintStageId = CliBlueprintStageId;
export type EditableBlueprintStageId = EditableCliBlueprintStageId;
export type ReviewableBlueprintStageId = ReviewableCliBlueprintStageId;
export type CanonicalProjectFactKey = CliBlueprintFactKey;
export type CanonicalProjectFactsDraft = CliBlueprintFactsDraft;
