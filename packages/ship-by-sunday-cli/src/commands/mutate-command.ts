import type { CanonicalProjectFactKey } from "@manmeetsai/packet-compiler";
import { writeJsonResult } from "../cli-json";
import { createCliError } from "../cli-errors";
import { parseFieldSelector } from "../field-contract";
import {
	applyDraftMutations,
	readDraftInputSource,
	type DraftMutation,
} from "../draft/draft-store";
import type { CliIo } from "../run-cli";

type RawMutationOperation = {
	op?: unknown;
	field?: unknown;
	value?: unknown;
};

function parseRawMutationOperations(input: unknown): RawMutationOperation[] {
	if (Array.isArray(input)) {
		return input as RawMutationOperation[];
	}

	if (
		input &&
		typeof input === "object" &&
		"operations" in input &&
		Array.isArray(input.operations)
	) {
		return input.operations as RawMutationOperation[];
	}

	throw createCliError(
		"invalid_input",
		'Expected a JSON array or an object with an "operations" array.',
		2,
	);
}

function normalizeDraftMutation(
	rawOperation: RawMutationOperation,
): DraftMutation {
	const op = rawOperation.op;
	const field = rawOperation.field;

	if (op !== "set" && op !== "unset" && op !== "append" && op !== "remove") {
		throw createCliError(
			"invalid_input",
			`Unknown mutation op "${String(op)}". Expected set, unset, append, or remove.`,
			2,
		);
	}

	if (typeof field !== "string" || field.length === 0) {
		throw createCliError(
			"invalid_input",
			"Each mutation operation must include a non-empty string field selector.",
			2,
		);
	}

	const descriptor = parseFieldSelector(field);
	const fieldKey = descriptor.fieldKey as CanonicalProjectFactKey;

	if (op === "unset") {
		return { op, fieldKey };
	}

	if (typeof rawOperation.value !== "string") {
		throw createCliError(
			"invalid_input",
			`Mutation "${op}" for "${field}" requires a string value.`,
			2,
		);
	}

	return {
		op,
		fieldKey,
		value: rawOperation.value,
	};
}

export async function handleMutateCommand({
	io,
	projectRootPath,
	filePath,
	json,
}: {
	io: CliIo;
	projectRootPath: string;
	filePath: string;
	json: boolean;
}) {
	const mutationSource = await readDraftInputSource(projectRootPath, filePath);
	let parsedInput: unknown;
	try {
		parsedInput = JSON.parse(mutationSource);
	} catch (error) {
		throw createCliError(
			"invalid_input",
			error instanceof Error ? error.message : "Invalid JSON mutation input.",
			2,
		);
	}

	const rawOperations = parseRawMutationOperations(parsedInput);
	const mutations = rawOperations.map(normalizeDraftMutation);
	const nextDraft = await applyDraftMutations(projectRootPath, mutations);

	if (json) {
		writeJsonResult(io, "mutate", {
			operationCount: mutations.length,
			fields: mutations.map((mutation) => mutation.fieldKey),
			productName: nextDraft.facts.product_name ?? null,
		});
		return 0;
	}

	io.write(`Applied ${mutations.length} mutations from ${filePath}`);
	return 0;
}
