export const HOME_PAGE_BLUEPRINT_DRAFT_STORAGE_KEY =
	"sbs:home-blueprint-draft:v1";

const HOME_PAGE_BLUEPRINT_DRAFT_VERSION = 1 as const;

export const HOME_PAGE_BLUEPRINT_PRICING_MODELS = [
	"one_time",
	"monthly",
	"yearly",
] as const;

export type HomePageBlueprintPricingModel =
	(typeof HOME_PAGE_BLUEPRINT_PRICING_MODELS)[number];

export type HomePageBlueprintDraftFields = {
	product_name: string;
	product_summary: string;
	primary_user: string;
	design_preset_id: string;
	theme_preset: string;
	pricing_model: HomePageBlueprintPricingModel;
	pricing: string;
};

export type HomePageBlueprintDraftEnvelope = {
	version: typeof HOME_PAGE_BLUEPRINT_DRAFT_VERSION;
	savedAt: number;
	fields: HomePageBlueprintDraftFields;
};

const HOME_PAGE_BLUEPRINT_DRAFT_FIELD_KEYS: readonly (keyof HomePageBlueprintDraftFields)[] =
	[
		"product_name",
		"product_summary",
		"primary_user",
		"design_preset_id",
		"theme_preset",
		"pricing_model",
		"pricing",
	];

function isHomePageBlueprintPricingModel(
	value: unknown,
): value is HomePageBlueprintPricingModel {
	return (
		typeof value === "string" &&
		(HOME_PAGE_BLUEPRINT_PRICING_MODELS as readonly string[]).includes(value)
	);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidPricingString(value: string): boolean {
	if (value === "") {
		return true;
	}
	const numericValue = Number(value);
	return Number.isFinite(numericValue) && numericValue >= 0;
}

export function parseHomePageBlueprintDraftEnvelope(
	raw: string,
): HomePageBlueprintDraftEnvelope | null {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return null;
	}

	if (!isPlainObject(parsed)) {
		return null;
	}

	if (parsed.version !== HOME_PAGE_BLUEPRINT_DRAFT_VERSION) {
		return null;
	}

	const savedAt = parsed.savedAt;
	if (typeof savedAt !== "number" || !Number.isFinite(savedAt)) {
		return null;
	}

	const rawFields = parsed.fields;
	if (!isPlainObject(rawFields)) {
		return null;
	}

	const supportedKeys = new Set<string>(HOME_PAGE_BLUEPRINT_DRAFT_FIELD_KEYS);
	for (const incomingKey of Object.keys(rawFields)) {
		if (!supportedKeys.has(incomingKey)) {
			return null;
		}
	}

	const productName = rawFields.product_name;
	const productSummary = rawFields.product_summary;
	const primaryUser = rawFields.primary_user;
	const designPresetId = rawFields.design_preset_id;
	const themePreset = rawFields.theme_preset;
	const pricingModel = rawFields.pricing_model;
	const pricing = rawFields.pricing;

	if (
		typeof productName !== "string" ||
		typeof productSummary !== "string" ||
		typeof primaryUser !== "string" ||
		typeof designPresetId !== "string" ||
		typeof themePreset !== "string" ||
		typeof pricing !== "string"
	) {
		return null;
	}

	if (!isHomePageBlueprintPricingModel(pricingModel)) {
		return null;
	}

	if (!isValidPricingString(pricing)) {
		return null;
	}

	return {
		version: HOME_PAGE_BLUEPRINT_DRAFT_VERSION,
		savedAt,
		fields: {
			product_name: productName,
			product_summary: productSummary,
			primary_user: primaryUser,
			design_preset_id: designPresetId,
			theme_preset: themePreset,
			pricing_model: pricingModel,
			pricing,
		},
	};
}

function getBrowserStorage(): Storage | null {
	if (typeof window === "undefined") {
		return null;
	}
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}

export function loadHomePageBlueprintDraft(): HomePageBlueprintDraftFields | null {
	const storage = getBrowserStorage();
	if (!storage) {
		return null;
	}

	let raw: string | null = null;
	try {
		raw = storage.getItem(HOME_PAGE_BLUEPRINT_DRAFT_STORAGE_KEY);
	} catch {
		return null;
	}

	if (!raw) {
		return null;
	}

	const envelope = parseHomePageBlueprintDraftEnvelope(raw);
	return envelope?.fields ?? null;
}

export function saveHomePageBlueprintDraft(
	fields: HomePageBlueprintDraftFields,
): void {
	const storage = getBrowserStorage();
	if (!storage) {
		return;
	}

	const envelope: HomePageBlueprintDraftEnvelope = {
		version: HOME_PAGE_BLUEPRINT_DRAFT_VERSION,
		savedAt: Date.now(),
		fields,
	};

	try {
		storage.setItem(
			HOME_PAGE_BLUEPRINT_DRAFT_STORAGE_KEY,
			JSON.stringify(envelope),
		);
	} catch {
		return;
	}
}

export function clearHomePageBlueprintDraft(): void {
	const storage = getBrowserStorage();
	if (!storage) {
		return;
	}
	try {
		storage.removeItem(HOME_PAGE_BLUEPRINT_DRAFT_STORAGE_KEY);
	} catch {
		return;
	}
}
