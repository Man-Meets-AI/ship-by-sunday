import { mkdir, open, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
	createCompleteProjectDefinition,
	createCanonicalProjectDefinitionDraft,
	isPacketArrayField,
	isPacketNumericField,
	normalizeProblemUrgencyValue,
	normalizeProblemSeverityValue,
	parseCanonicalProjectDefinition,
	parseCanonicalProjectDefinitionDraft,
	parseCanonicalProjectFactsDraft,
	type CanonicalProjectDefinitionDraft,
	type CanonicalProjectFactKey,
	type CanonicalProjectFactsDraft,
	type PacketStageDefinition,
} from "@manmeetsai/packet-compiler";
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

const LOCAL_DRAFT_MISSING_MESSAGE =
	"No local Ship by Sunday draft exists yet. Run init, import, or resume first.";

const DRAFT_PATH_ERROR_CODES = new Set([
	"EACCES",
	"EPERM",
	"EISDIR",
	"ENOTDIR",
]);

export type DraftMutation =
	| {
			op: "set";
			fieldKey: CanonicalProjectFactKey;
			value: string;
	  }
	| {
			op: "unset";
			fieldKey: CanonicalProjectFactKey;
	  }
	| {
			op: "append";
			fieldKey: CanonicalProjectFactKey;
			value: string;
	  }
	| {
			op: "remove";
			fieldKey: CanonicalProjectFactKey;
			value: string;
	  };

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

export function createLocalDraftDefinition(
	facts: CanonicalProjectFactsDraft = {},
) {
	return createCanonicalProjectDefinitionDraft({
		clerkUserId: SHIP_BY_SUNDAY_LOCAL_CLERK_USER_ID,
		productKey: SHIP_BY_SUNDAY_PRODUCT_KEY,
		facts,
	});
}

export async function loadLocalDraft(
	repoRootPath: string,
): Promise<CanonicalProjectDefinitionDraft | null> {
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
		return parseCanonicalProjectDefinitionDraft(JSON.parse(draftSource));
	} catch (error) {
		if (error instanceof SyntaxError) {
			throw createCliError(
				"invalid_state",
				`Draft file ${filePath} is invalid. Remove it and re-run init or import.`,
				1,
			);
		}

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

export async function saveLocalDraft(
	repoRootPath: string,
	draft: CanonicalProjectDefinitionDraft,
) {
	const draftFilePath = getDraftFilePath(repoRootPath);
	const temporaryDraftFilePath = getDraftTempFilePath(repoRootPath);
	let fileHandle: Awaited<ReturnType<typeof open>> | null = null;
	try {
		await mkdir(getDraftDirectoryPath(repoRootPath), { recursive: true });
		fileHandle = await open(temporaryDraftFilePath, "w");
		await fileHandle.writeFile(JSON.stringify(draft, null, 2));
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
			? createCanonicalProjectDefinitionDraft({
					clerkUserId: SHIP_BY_SUNDAY_LOCAL_CLERK_USER_ID,
					productKey: SHIP_BY_SUNDAY_PRODUCT_KEY,
					facts: createCompleteProjectDefinition().facts,
				})
			: createLocalDraftDefinition();
	await saveLocalDraft(projectRootPath, nextDraft);
	return nextDraft;
}

function saveDraftWithMergedFacts(
	draft: CanonicalProjectDefinitionDraft,
	nextFacts: CanonicalProjectFactsDraft,
) {
	return createCanonicalProjectDefinitionDraft({
		clerkUserId: draft.clerkUserId,
		productKey: draft.productKey,
		facts: nextFacts,
		placeholdersInUse: draft.placeholdersInUse,
		createdAt: draft.createdAt,
		updatedAt: Date.now(),
	});
}

function applyMutationToFacts(
	facts: CanonicalProjectFactsDraft,
	mutation: DraftMutation,
) {
	if (mutation.op === "set") {
		return parseCanonicalProjectFactsDraft({
			...facts,
			[mutation.fieldKey]: normalizeFieldValue(
				mutation.fieldKey,
				mutation.value,
			),
		});
	}

	const nextFactsSource: Record<string, unknown> = { ...facts };

	if (mutation.op === "unset") {
		delete nextFactsSource[mutation.fieldKey];
		return parseCanonicalProjectFactsDraft(nextFactsSource);
	}

	if (mutation.op === "append") {
		if (!isPacketArrayField(mutation.fieldKey)) {
			throw createCliError(
				"invalid_args",
				`Field "${mutation.fieldKey}" does not support append.`,
				2,
			);
		}

		const rawCurrentValue = facts[mutation.fieldKey];
		const currentValues: string[] = Array.isArray(rawCurrentValue)
			? [...rawCurrentValue]
			: [];
		return parseCanonicalProjectFactsDraft({
			...facts,
			[mutation.fieldKey]: [...currentValues, mutation.value.trim()].filter(
				Boolean,
			),
		});
	}

	if (!isPacketArrayField(mutation.fieldKey)) {
		throw createCliError(
			"invalid_args",
			`Field "${mutation.fieldKey}" does not support remove.`,
			2,
		);
	}

	const rawCurrentValue = facts[mutation.fieldKey];
	const currentValues: string[] = Array.isArray(rawCurrentValue)
		? [...rawCurrentValue]
		: [];
	const nextValues = currentValues.filter(
		(entry) => entry !== mutation.value.trim(),
	);

	if (nextValues.length === 0) {
		delete nextFactsSource[mutation.fieldKey];
		return parseCanonicalProjectFactsDraft(nextFactsSource);
	}

	return parseCanonicalProjectFactsDraft({
		...facts,
		[mutation.fieldKey]: nextValues,
	});
}

function normalizeFieldValue(
	fieldKey: CanonicalProjectFactKey,
	value: string,
): string | number | string[] {
	const trimmedValue = value.trim();

	if (fieldKey === "problem_severity") {
		return normalizeProblemSeverityValue(trimmedValue);
	}
	if (fieldKey === "problem_urgency") {
		return normalizeProblemUrgencyValue(trimmedValue);
	}
	if (isPacketNumericField(fieldKey)) {
		return Number(trimmedValue);
	}
	if (isPacketArrayField(fieldKey)) {
		if (trimmedValue.startsWith("[") && trimmedValue.endsWith("]")) {
			const parsedValue = JSON.parse(trimmedValue);
			if (!Array.isArray(parsedValue)) {
				throw createCliError(
					"invalid_input",
					`Expected a JSON array for ${fieldKey}.`,
					2,
				);
			}
			return parsedValue.map((item) => String(item).trim()).filter(Boolean);
		}

		if (trimmedValue.includes("\n")) {
			return trimmedValue
				.split("\n")
				.map((line) => line.trim())
				.filter(Boolean);
		}

		return [trimmedValue];
	}

	return trimmedValue;
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

function toDraftDefinition(input: unknown) {
	try {
		return parseCanonicalProjectDefinitionDraft(input);
	} catch {
		if (
			input &&
			typeof input === "object" &&
			"facts" in input &&
			input.facts &&
			typeof input.facts === "object"
		) {
			const facts = parseCanonicalProjectFactsDraft(input.facts);
			return createLocalDraftDefinition(facts);
		}

		try {
			const canonicalProjectDefinition = parseCanonicalProjectDefinition(input);
			return createCanonicalProjectDefinitionDraft({
				clerkUserId: canonicalProjectDefinition.clerkUserId,
				productKey: canonicalProjectDefinition.productKey,
				facts: canonicalProjectDefinition.facts,
				placeholdersInUse: canonicalProjectDefinition.placeholdersInUse,
				createdAt: canonicalProjectDefinition.createdAt,
				updatedAt: canonicalProjectDefinition.updatedAt,
			});
		} catch {
			const facts = parseCanonicalProjectFactsDraft(input);
			return createLocalDraftDefinition(facts);
		}
	}
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
	const nextDraft = toDraftDefinition(parsedInput);
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
	stage: PacketStageDefinition,
	patch: Record<string, unknown>,
) {
	const allowedFieldKeys = new Set(
		stage.steps.flatMap((step) => step.fieldKeys),
	);

	for (const fieldKey of Object.keys(patch)) {
		if (!allowedFieldKeys.has(fieldKey as CanonicalProjectFactKey)) {
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
): [Record<string, unknown>, CanonicalProjectFactKey[]] {
	const nextFactsPatch: Record<string, unknown> = {};
	const clearedFieldKeys: CanonicalProjectFactKey[] = [];

	for (const [fieldKey, value] of Object.entries(patch)) {
		if (value === null) {
			clearedFieldKeys.push(fieldKey as CanonicalProjectFactKey);
			continue;
		}
		nextFactsPatch[fieldKey] = value;
	}

	return [nextFactsPatch, clearedFieldKeys];
}

export async function applyDraftPatchFromFile(
	repoRootPath: string,
	stage: PacketStageDefinition,
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
		parsedPatch &&
		typeof parsedPatch === "object" &&
		"facts" in parsedPatch &&
		parsedPatch.facts &&
		typeof parsedPatch.facts === "object"
			? (parsedPatch.facts as Record<string, unknown>)
			: (parsedPatch as Record<string, unknown>);

	assertStagePatchKeys(stage, rawPatch);
	const [nextFactsPatch, clearedFieldKeys] = splitPatchEntries(rawPatch);
	const validFactsPatch = parseCanonicalProjectFactsDraft(nextFactsPatch);
	const mergedFacts = { ...draft.facts, ...validFactsPatch };

	for (const fieldKey of clearedFieldKeys) {
		delete mergedFacts[fieldKey];
	}

	const nextDraft = createCanonicalProjectDefinitionDraft({
		clerkUserId: draft.clerkUserId,
		productKey: draft.productKey,
		facts: mergedFacts,
		placeholdersInUse: draft.placeholdersInUse,
		createdAt: draft.createdAt,
		updatedAt: Date.now(),
	});
	await saveLocalDraft(repoRootPath, nextDraft);
	return nextDraft;
}

export async function setDraftFieldValue(
	repoRootPath: string,
	fieldKey: CanonicalProjectFactKey,
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
	fieldKey: CanonicalProjectFactKey,
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
	fieldKey: CanonicalProjectFactKey,
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
	fieldKey: CanonicalProjectFactKey,
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
