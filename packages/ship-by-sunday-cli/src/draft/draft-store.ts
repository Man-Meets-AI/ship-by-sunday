import { mkdir, open, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
	createCompleteProjectDefinition,
	parseCanonicalProjectDefinition,
	parseCanonicalProjectDefinitionDraft,
} from "@manmeetsai/blueprint-compiler";
import {
	SHIP_BY_SUNDAY_LOCAL_CLERK_USER_ID,
	SHIP_BY_SUNDAY_PRODUCT_KEY,
	getDraftDirectoryPath,
	getDraftFilePath,
	getDraftTempFilePath,
} from "./draft-paths";
import { resolveProjectPath } from "../cli-paths";
import type { CliFixtureName } from "../parse-cli-command";
import { createCliError } from "../cli-errors";
import {
	deriveCliStageStatus,
	cliBlueprintFactKeys,
	isBlueprintArrayField,
	normalizeCliFactValue,
	normalizeCliFactsDraft,
	type CliBlueprintFactKey,
	type CliBlueprintFactsDraft,
	type CliBlueprintStageDefinition,
} from "../field-contract";
import { extractCliFactsFromLegacyFacts } from "../blueprint-derivation";

const LOCAL_DRAFT_MISSING_MESSAGE =
	"No local Ship by Sunday draft exists yet. Run init, import, or resume first.";

const DRAFT_PATH_ERROR_CODES = new Set([
	"EACCES",
	"EPERM",
	"EISDIR",
	"ENOTDIR",
]);

const recognizedDraftSourceKeys = new Set([
	...cliBlueprintFactKeys,
	"screen_sequence",
	"price_usd_cents",
	"support_email",
	"outcome_statement",
	"pricing_model",
	"surface_type",
	"marketing_goals",
]);

export type LocalDraftEnvelope = {
	clerkUserId: string;
	productKey: string;
	schemaVersion: 1;
	facts: CliBlueprintFactsDraft;
	placeholdersInUse: string[];
	createdAt: number;
	updatedAt: number;
};

export type DraftMutation =
	| {
			op: "set";
			fieldKey: CliBlueprintFactKey;
			value: string;
	  }
	| {
			op: "unset";
			fieldKey: CliBlueprintFactKey;
	  }
	| {
			op: "append";
			fieldKey: CliBlueprintFactKey;
			value: string;
	  }
	| {
			op: "remove";
			fieldKey: CliBlueprintFactKey;
			value: string;
	  };

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasRecognizedDraftSourceKey(input: Record<string, unknown>) {
	return Object.keys(input).some((key) => recognizedDraftSourceKeys.has(key));
}

async function readTextInputSource(
	repoRootPath: string,
	inputPath: string,
): Promise<string> {
	if (inputPath !== "-") {
		return readFile(resolveProjectPath(repoRootPath, inputPath), "utf8");
	}

	let source = "";
	for await (const chunk of process.stdin) {
		source += chunk.toString();
	}
	return source;
}

export async function readDraftInputSource(
	repoRootPath: string,
	inputPath: string,
) {
	return readTextInputSource(repoRootPath, inputPath);
}

function createLocalDraftEnvelope(args: {
	clerkUserId: string;
	productKey: string;
	facts?: CliBlueprintFactsDraft;
	placeholdersInUse?: string[];
	createdAt?: number;
	updatedAt?: number;
}): LocalDraftEnvelope {
	const createdAt = args.createdAt ?? Date.now();
	const updatedAt = args.updatedAt ?? createdAt;

	return {
		clerkUserId: args.clerkUserId,
		productKey: args.productKey,
		schemaVersion: 1,
		facts: normalizeCliFactsDraft(args.facts ?? {}),
		placeholdersInUse: args.placeholdersInUse ?? [],
		createdAt,
		updatedAt,
	};
}

export function createLocalDraftDefinition(facts: CliBlueprintFactsDraft = {}) {
	return createLocalDraftEnvelope({
		clerkUserId: SHIP_BY_SUNDAY_LOCAL_CLERK_USER_ID,
		productKey: SHIP_BY_SUNDAY_PRODUCT_KEY,
		facts,
	});
}

function fromLegacyProjectDefinition(input: unknown) {
	const parsed = parseCanonicalProjectDefinition(input);
	return createLocalDraftEnvelope({
		clerkUserId: parsed.clerkUserId,
		productKey: parsed.productKey,
		facts: extractCliFactsFromLegacyFacts(parsed.facts),
		placeholdersInUse: parsed.placeholdersInUse,
		createdAt: parsed.createdAt,
		updatedAt: parsed.updatedAt,
	});
}

function fromLegacyProjectDefinitionDraft(input: unknown) {
	const parsed = parseCanonicalProjectDefinitionDraft(input);
	return createLocalDraftEnvelope({
		clerkUserId: parsed.clerkUserId,
		productKey: parsed.productKey,
		facts: extractCliFactsFromLegacyFacts(parsed.facts),
		placeholdersInUse: parsed.placeholdersInUse,
		createdAt: parsed.createdAt,
		updatedAt: parsed.updatedAt,
	});
}

function normalizeLocalDraftEnvelope(input: unknown): LocalDraftEnvelope {
	if (!isPlainObject(input)) {
		throw createCliError(
			"invalid_state",
			"Draft file is invalid. Remove it and re-run init or import.",
			1,
		);
	}

	const clerkUserId = input.clerkUserId;
	const productKey = input.productKey;
	const facts = input.facts;

	if (typeof clerkUserId !== "string" || typeof productKey !== "string") {
		throw createCliError(
			"invalid_state",
			"Draft file is invalid. Remove it and re-run init or import.",
			1,
		);
	}

	return createLocalDraftEnvelope({
		clerkUserId,
		productKey,
		facts: isPlainObject(facts) ? (facts as CliBlueprintFactsDraft) : {},
		placeholdersInUse: Array.isArray(input.placeholdersInUse)
			? input.placeholdersInUse.map((entry) => String(entry))
			: [],
		createdAt:
			typeof input.createdAt === "number" ? input.createdAt : undefined,
		updatedAt:
			typeof input.updatedAt === "number" ? input.updatedAt : undefined,
	});
}

function toLocalDraftEnvelope(input: unknown): LocalDraftEnvelope {
	if (isPlainObject(input) && "schemaVersion" in input && "facts" in input) {
		if (
			isPlainObject(input.facts) &&
			("screen_sequence" in input.facts ||
				"price_usd_cents" in input.facts ||
				"marketing_goals" in input.facts ||
				"pricing_model" in input.facts ||
				"surface_type" in input.facts)
		) {
			try {
				return fromLegacyProjectDefinition(input);
			} catch {
				return fromLegacyProjectDefinitionDraft(input);
			}
		}

		if (isPlainObject(input.facts)) {
			return normalizeLocalDraftEnvelope(input);
		}
	}

	if (isPlainObject(input) && input.facts && isPlainObject(input.facts)) {
		if (!hasRecognizedDraftSourceKey(input.facts)) {
			throw createCliError(
				"invalid_input",
				"Draft file is invalid. Remove it and re-run init or import.",
				2,
			);
		}
		return createLocalDraftDefinition(
			extractCliFactsFromLegacyFacts(input.facts as Record<string, unknown>),
		);
	}

	if (
		isPlainObject(input) &&
		input.clerkUserId &&
		input.productKey &&
		input.facts
	) {
		return normalizeLocalDraftEnvelope(input);
	}

	if (isPlainObject(input) && "schemaVersion" in input && !("facts" in input)) {
		try {
			return fromLegacyProjectDefinition(input);
		} catch {
			return fromLegacyProjectDefinitionDraft(input);
		}
	}

	if (isPlainObject(input)) {
		if (!hasRecognizedDraftSourceKey(input)) {
			throw createCliError(
				"invalid_input",
				"Draft file is invalid. Remove it and re-run init or import.",
				2,
			);
		}
		return createLocalDraftDefinition(
			extractCliFactsFromLegacyFacts(input as Record<string, unknown>),
		);
	}

	throw createCliError(
		"invalid_state",
		"Draft file is invalid. Remove it and re-run init or import.",
		1,
	);
}

export async function loadLocalDraft(
	repoRootPath: string,
): Promise<LocalDraftEnvelope | null> {
	const draftFilePath = getDraftFilePath(repoRootPath);

	try {
		return await readDraftFile(draftFilePath);
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "ENOENT") {
			const recoveryDraftFilePath = getDraftTempFilePath(repoRootPath);
			const recoveryDraft = await readRecoveredDraft(
				recoveryDraftFilePath,
				draftFilePath,
			);
			if (recoveryDraft) {
				return recoveryDraft;
			}
			return null;
		}

		throw error;
	}
}

async function readDraftFile(filePath: string) {
	try {
		const draftSource = await readFile(filePath, "utf8");
		return parseDraftSource(filePath, draftSource);
	} catch (error) {
		if (isDraftPathError(error)) {
			throw createDraftPathCliError(
				`Could not read draft file ${filePath}. Remove the blocking path and try init or import again.`,
			);
		}

		throw error;
	}
}

function parseDraftSource(filePath: string, draftSource: string) {
	try {
		return toLocalDraftEnvelope(JSON.parse(draftSource));
	} catch {
		throw createCliError(
			"invalid_state",
			`Draft file ${filePath} is invalid. Remove it and re-run init or import.`,
			1,
		);
	}
}

async function readRecoveredDraft(
	recoveryDraftFilePath: string,
	draftFilePath: string,
) {
	try {
		const draftSource = await readFile(recoveryDraftFilePath, "utf8");
		const draft = parseDraftSource(recoveryDraftFilePath, draftSource);
		await rename(recoveryDraftFilePath, draftFilePath);
		return draft;
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "ENOENT") {
			return null;
		}

		if (isDraftPathError(error)) {
			throw createDraftPathCliError(
				`Could not recover draft from ${recoveryDraftFilePath} into ${draftFilePath}. Remove the recovery file and try init or import again.`,
			);
		}

		throw error;
	}
}

export async function requireLocalDraft(repoRootPath: string) {
	const draft = await loadLocalDraft(repoRootPath);
	if (!draft) {
		throw createCliError("missing_draft", LOCAL_DRAFT_MISSING_MESSAGE, 4);
	}

	return draft;
}

export async function saveLocalDraft(repoRootPath: string, draft: unknown) {
	const normalizedDraft = toLocalDraftEnvelope(draft);
	const draftFilePath = getDraftFilePath(repoRootPath);
	const temporaryDraftFilePath = getDraftTempFilePath(repoRootPath);
	let fileHandle: Awaited<ReturnType<typeof open>> | null = null;
	try {
		await mkdir(getDraftDirectoryPath(repoRootPath), { recursive: true });
		fileHandle = await open(temporaryDraftFilePath, "w");
		await fileHandle.writeFile(JSON.stringify(normalizedDraft, null, 2));
		await fileHandle.sync();
		await fileHandle.close();
		await rename(temporaryDraftFilePath, draftFilePath);
	} catch (error) {
		if (fileHandle) {
			await fileHandle.close().catch(() => {});
		}
		await rm(temporaryDraftFilePath, { force: true });
		if (isDraftPathError(error)) {
			throw createDraftPathCliError(
				`Could not write draft file ${draftFilePath}. Remove the blocking path and try init or import again.`,
			);
		}
		throw error;
	}
}

function isDraftPathError(error: unknown) {
	if (!(error instanceof Error) || !("code" in error)) {
		return false;
	}

	return (
		typeof error.code === "string" && DRAFT_PATH_ERROR_CODES.has(error.code)
	);
}

function createDraftPathCliError(message: string) {
	return createCliError("invalid_state", message, 1);
}

export async function initializeLocalDraft({
	projectRootPath,
	fixture,
	force,
}: {
	projectRootPath: string;
	fixture: CliFixtureName;
	force: boolean;
}) {
	const existingDraft = await loadLocalDraft(projectRootPath);
	if (existingDraft && !force) {
		throw createCliError(
			"already_exists",
			"Local Ship by Sunday draft already exists. Re-run with --force to replace it.",
			3,
		);
	}

	const nextDraft =
		fixture === "complete"
			? createLocalDraftDefinition(
					extractCliFactsFromLegacyFacts(
						createCompleteProjectDefinition().facts as Record<string, unknown>,
					),
				)
			: createLocalDraftDefinition();
	await saveLocalDraft(projectRootPath, nextDraft);
	return nextDraft;
}

function applyMutationToFacts(
	facts: CliBlueprintFactsDraft,
	mutation: DraftMutation,
) {
	if (mutation.op === "set") {
		const normalizedValue = normalizeCliFactValue(
			mutation.fieldKey,
			mutation.value,
		);
		if (normalizedValue === undefined) {
			return {
				...facts,
				[mutation.fieldKey]:
					mutation.fieldKey === "scope_in" || mutation.fieldKey === "scope_out"
						? []
						: undefined,
			};
		}
		return {
			...facts,
			[mutation.fieldKey]: normalizedValue,
		};
	}

	const nextFacts: CliBlueprintFactsDraft = { ...facts };

	if (mutation.op === "unset") {
		if (mutation.fieldKey === "scope_in" || mutation.fieldKey === "scope_out") {
			nextFacts[mutation.fieldKey] = [];
		} else {
			delete nextFacts[mutation.fieldKey];
		}
		return normalizeCliFactsDraft(nextFacts);
	}

	if (!isBlueprintArrayField(mutation.fieldKey)) {
		throw createCliError(
			"invalid_args",
			`Field "${mutation.fieldKey}" does not support ${mutation.op}.`,
			2,
		);
	}

	const currentValue = facts[mutation.fieldKey];
	const currentValues = Array.isArray(currentValue) ? [...currentValue] : [];
	const nextValue = normalizeCliFactValue(mutation.fieldKey, [
		...currentValues,
		mutation.value,
	]);

	if (mutation.op === "append") {
		return {
			...facts,
			[mutation.fieldKey]: nextValue,
		};
	}

	const filteredValues = currentValues.filter(
		(entry) => entry !== mutation.value.trim(),
	);
	if (filteredValues.length === 0) {
		if (mutation.fieldKey === "scope_in" || mutation.fieldKey === "scope_out") {
			nextFacts[mutation.fieldKey] = [];
		} else {
			delete nextFacts[mutation.fieldKey];
		}
		return normalizeCliFactsDraft(nextFacts);
	}

	return {
		...facts,
		[mutation.fieldKey]: filteredValues,
	};
}

function saveDraftWithMergedFacts(
	draft: LocalDraftEnvelope,
	nextFacts: CliBlueprintFactsDraft,
) {
	return createLocalDraftEnvelope({
		clerkUserId: draft.clerkUserId,
		productKey: draft.productKey,
		facts: nextFacts,
		placeholdersInUse: draft.placeholdersInUse,
		createdAt: draft.createdAt,
		updatedAt: Date.now(),
	});
}

export async function importDraftFromFile(
	repoRootPath: string,
	filePath: string,
) {
	const fileSource = await readTextInputSource(repoRootPath, filePath);
	let parsedInput: unknown;
	try {
		parsedInput = JSON.parse(fileSource);
	} catch (error) {
		throw createCliError(
			"invalid_input",
			error instanceof Error ? error.message : "Invalid JSON input.",
			2,
		);
	}
	const nextDraft = toLocalDraftEnvelope(parsedInput);
	await saveLocalDraft(repoRootPath, nextDraft);
	return nextDraft;
}

export async function readLocalDraftSource(repoRootPath: string) {
	const draft = await requireLocalDraft(repoRootPath);

	return JSON.stringify(draft, null, 2);
}

export async function exportDraftToFile(repoRootPath: string, outPath: string) {
	const draftSource = await readLocalDraftSource(repoRootPath);
	const absoluteOutPath = resolveProjectPath(repoRootPath, outPath);
	await mkdir(path.dirname(absoluteOutPath), { recursive: true });
	await writeFile(absoluteOutPath, draftSource, {
		flag: "wx",
	});
	return absoluteOutPath;
}

function assertStagePatchKeys(
	stage: CliBlueprintStageDefinition,
	patch: Record<string, unknown>,
) {
	const allowedFieldKeys = new Set(
		stage.steps.flatMap((step) => step.fieldKeys),
	);

	for (const fieldKey of Object.keys(patch)) {
		if (!allowedFieldKeys.has(fieldKey as CliBlueprintFactKey)) {
			throw createCliError(
				"invalid_patch",
				`Field "${fieldKey}" does not belong to the ${stage.label} stage.`,
				2,
			);
		}
	}
}

function splitPatchEntries(
	patch: Record<string, unknown>,
): [Record<string, unknown>, CliBlueprintFactKey[]] {
	const nextFactsPatch: Record<string, unknown> = {};
	const clearedFieldKeys: CliBlueprintFactKey[] = [];

	for (const [fieldKey, value] of Object.entries(patch)) {
		if (value === null) {
			clearedFieldKeys.push(fieldKey as CliBlueprintFactKey);
			continue;
		}
		nextFactsPatch[fieldKey] = value;
	}

	return [nextFactsPatch, clearedFieldKeys];
}

export async function applyDraftPatchFromFile(
	repoRootPath: string,
	stage: CliBlueprintStageDefinition,
	filePath: string,
) {
	const draft = await ensureLocalDraft(repoRootPath);
	const patchSource = await readTextInputSource(repoRootPath, filePath);
	let parsedPatch: unknown;
	try {
		parsedPatch = JSON.parse(patchSource);
	} catch (error) {
		throw createCliError(
			"invalid_input",
			error instanceof Error ? error.message : "Invalid JSON patch input.",
			2,
		);
	}
	const rawPatch =
		isPlainObject(parsedPatch) &&
		"facts" in parsedPatch &&
		parsedPatch.facts &&
		isPlainObject(parsedPatch.facts)
			? (parsedPatch.facts as Record<string, unknown>)
			: (parsedPatch as Record<string, unknown>);

	assertStagePatchKeys(stage, rawPatch);
	const [nextFactsPatch, clearedFieldKeys] = splitPatchEntries(rawPatch);
	const normalizedFactsPatch: CliBlueprintFactsDraft = {};

	for (const [fieldKey, value] of Object.entries(nextFactsPatch)) {
		const normalizedValue = normalizeCliFactValue(
			fieldKey as CliBlueprintFactKey,
			value,
		);
		if (normalizedValue !== undefined) {
			normalizedFactsPatch[fieldKey as CliBlueprintFactKey] = normalizedValue;
		}
	}

	const mergedFacts = { ...draft.facts, ...normalizedFactsPatch };

	for (const fieldKey of clearedFieldKeys) {
		if (fieldKey === "scope_in" || fieldKey === "scope_out") {
			mergedFacts[fieldKey] = [];
		} else {
			delete mergedFacts[fieldKey];
		}
	}

	const nextDraft = saveDraftWithMergedFacts(draft, mergedFacts);
	await saveLocalDraft(repoRootPath, nextDraft);
	return nextDraft;
}

export async function setDraftFieldValue(
	repoRootPath: string,
	fieldKey: CliBlueprintFactKey,
	value: string,
) {
	const draft = await ensureLocalDraft(repoRootPath);
	const nextFacts = applyMutationToFacts(draft.facts, {
		op: "set",
		fieldKey,
		value,
	});
	const nextDraft = saveDraftWithMergedFacts(draft, nextFacts);
	await saveLocalDraft(repoRootPath, nextDraft);
	return nextDraft;
}

export async function unsetDraftFieldValue(
	repoRootPath: string,
	fieldKey: CliBlueprintFactKey,
) {
	const draft = await ensureLocalDraft(repoRootPath);
	const nextFacts = applyMutationToFacts(draft.facts, {
		op: "unset",
		fieldKey,
	});
	const nextDraft = saveDraftWithMergedFacts(draft, nextFacts);
	await saveLocalDraft(repoRootPath, nextDraft);
	return nextDraft;
}

export async function appendDraftFieldValue(
	repoRootPath: string,
	fieldKey: CliBlueprintFactKey,
	value: string,
) {
	const draft = await ensureLocalDraft(repoRootPath);
	const nextFacts = applyMutationToFacts(draft.facts, {
		op: "append",
		fieldKey,
		value,
	});
	const nextDraft = saveDraftWithMergedFacts(draft, nextFacts);
	await saveLocalDraft(repoRootPath, nextDraft);
	return nextDraft;
}

export async function removeDraftFieldValue(
	repoRootPath: string,
	fieldKey: CliBlueprintFactKey,
	value: string,
) {
	const draft = await ensureLocalDraft(repoRootPath);
	const nextFacts = applyMutationToFacts(draft.facts, {
		op: "remove",
		fieldKey,
		value,
	});
	const nextDraft = saveDraftWithMergedFacts(draft, nextFacts);
	await saveLocalDraft(repoRootPath, nextDraft);
	return nextDraft;
}

export async function applyDraftMutations(
	repoRootPath: string,
	mutations: readonly DraftMutation[],
) {
	const draft = await ensureLocalDraft(repoRootPath);
	let nextFacts = draft.facts;

	for (const mutation of mutations) {
		nextFacts = applyMutationToFacts(nextFacts, mutation);
	}

	const nextDraft = saveDraftWithMergedFacts(draft, nextFacts);
	await saveLocalDraft(repoRootPath, nextDraft);
	return nextDraft;
}

export async function ensureLocalDraft(repoRootPath: string) {
	const existingDraft = await loadLocalDraft(repoRootPath);
	if (existingDraft) {
		return existingDraft;
	}

	const draft = createLocalDraftDefinition();
	await saveLocalDraft(repoRootPath, draft);
	return draft;
}

export function deriveLocalDraftStatus(facts: CliBlueprintFactsDraft) {
	return deriveCliStageStatus(facts);
}
