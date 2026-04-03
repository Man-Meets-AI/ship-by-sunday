import { createCliError } from "./cli-errors";

export type CliBlueprintStageId =
	| "start"
	| "product"
	| "design"
	| "marketing"
	| "build-plan"
	| "review";

export type EditableCliBlueprintStageId = Exclude<
	CliBlueprintStageId,
	"start" | "review" | "marketing"
>;

export type ReviewableCliBlueprintStageId = Exclude<
	CliBlueprintStageId,
	"start"
>;

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
	| "theme_hex"
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

export const DEFAULT_THEME_HEX = "#26496f";

const cliBlueprintStageDefinitions = [
	{
		id: "start",
		label: "Start",
		description: "Orientation and reduced-blueprint framing.",
		route: "/start",
		steps: [],
	},
	{
		id: "product",
		label: "Product",
		description: "Lock the product, problem, and flow.",
		route: "/product",
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
				id: "pricing",
				label: "Pricing",
				fieldKeys: ["pricing"],
				requiredFieldKeys: ["pricing"],
			},
		],
	},
	{
		id: "design",
		label: "Design",
		description: "Set the visual anchor and any references.",
		route: "/design",
		steps: [
			{
				id: "direction",
				label: "Direction",
				fieldKeys: ["theme_hex"],
				requiredFieldKeys: [],
			},
			{
				id: "references",
				label: "References",
				fieldKeys: ["design_references"],
				requiredFieldKeys: [],
			},
		],
	},
	{
		id: "marketing",
		label: "Marketing",
		description: "Generated preview only. No manual intake.",
		route: "/marketing",
		steps: [],
	},
	{
		id: "build-plan",
		label: "Build Plan",
		description: "Capture optional rollout details and launch metadata.",
		route: "/build-plan",
		steps: [
			{
				id: "setup",
				label: "Setup",
				fieldKeys: ["scope_in", "scope_out", "domain", "contact_email"],
				requiredFieldKeys: [],
			},
		],
	},
	{
		id: "review",
		label: "Review",
		description: "Review readiness and download the starter snapshot.",
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

function isEditableStageId(
	value: string,
): value is EditableCliBlueprintStageId {
	return value === "product" || value === "design" || value === "build-plan";
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
		case "theme_hex":
			return "Theme hex";
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
		case "theme_hex":
			return `Optional. The default ${DEFAULT_THEME_HEX} is already prefilled, but you can change it.`;
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

	if (facts.theme_hex === undefined) {
		facts.theme_hex = DEFAULT_THEME_HEX;
	}

	return facts;
}

export function createThemeHexDefault() {
	return DEFAULT_THEME_HEX;
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
		fieldKey === "theme_hex"
			? (facts.theme_hex ?? DEFAULT_THEME_HEX)
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

	if (fieldKey === "theme_hex") {
		return value ?? DEFAULT_THEME_HEX;
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
	return cliBlueprintStageDefinitions
		.filter(
			(
				stage,
			): stage is Extract<
				(typeof cliBlueprintStageDefinitions)[number],
				{ id: ReviewableCliBlueprintStageId }
			> => stage.id !== "start",
		)
		.map((stage) => ({
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

	if (maybeFieldKey && isEditableStageId(maybeStageId)) {
		const fieldKey = maybeFieldKey as CliBlueprintFactKey;
		const descriptor = getFieldDescriptor(fieldKey);
		if (descriptor.stageId !== maybeStageId) {
			throw createCliError(
				"invalid_stage",
				`Field "${fieldKey}" belongs to ${descriptor.stageLabel}, not ${getBlueprintStageDefinition(maybeStageId).label}.`,
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
	const stageStatuses = listStageDescriptors().map((stage) => {
		const stageDefinition = getBlueprintStageDefinition(stage.stageId);
		const stepStatuses = stageDefinition.steps.map((step) =>
			createStageStatusForStep(stage.stageId, step, facts),
		);
		const firstIncompleteStepIndex = stepStatuses.findIndex(
			(stepStatus) => !stepStatus.isComplete,
		);
		const currentStepIndex =
			firstIncompleteStepIndex === -1
				? Math.max(stageDefinition.steps.length - 1, 0)
				: firstIncompleteStepIndex;
		const missingFactKeys =
			firstIncompleteStepIndex === -1
				? []
				: [...stepStatuses[firstIncompleteStepIndex]!.missingFactKeys];

		return {
			stageId: stage.stageId,
			stageLabel: stage.label,
			currentStepIndex,
			isComplete: missingFactKeys.length === 0,
			missingFactKeys,
			stepStatuses,
		};
	});

	const firstIncompleteStage = stageStatuses.find((stage) => !stage.isComplete);

	return {
		firstIncompleteStageId:
			firstIncompleteStage?.stageId ?? ("review" as const),
		stageStatuses,
		blueprintReadiness: {
			review: {
				isReady: firstIncompleteStage === undefined,
				missingFactKeys: firstIncompleteStage?.missingFactKeys ?? [],
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
	"theme_hex",
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
