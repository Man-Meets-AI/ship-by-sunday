import {
	canonicalProjectDefinitionDraftSchema,
	canonicalProjectDefinitionSchema,
	canonicalProjectFactsDraftSchema,
	type CanonicalProjectDefinition,
	type CanonicalProjectDefinitionDraft,
	type CanonicalProjectFactsDraft,
} from "./schema";
import { deriveCodebaseFacts } from "./derived-codebase-facts";
import type { JsonValue } from "../json-value";

export const CANONICAL_PROJECT_DEFINITION_SCHEMA_VERSION = 1;

type CreateCanonicalProjectDefinitionArgs = {
	clerkUserId: string;
	productKey: string;
	facts: CanonicalProjectFactsDraft;
	placeholdersInUse?: CanonicalProjectDefinition["placeholdersInUse"];
	createdAt?: number;
	updatedAt?: number;
};

type CreateCanonicalProjectDefinitionDraftArgs = {
	clerkUserId: string;
	productKey: string;
	facts?: CanonicalProjectFactsDraft;
	placeholdersInUse?: CanonicalProjectDefinitionDraft["placeholdersInUse"];
	createdAt?: number;
	updatedAt?: number;
};

export function parseCanonicalProjectDefinition(
	input: JsonValue,
): CanonicalProjectDefinition {
	const parsedInput = canonicalProjectDefinitionDraftSchema.parse(input);
	return canonicalProjectDefinitionSchema.parse({
		...parsedInput,
		facts: deriveCodebaseFacts(parsedInput.facts),
	});
}

export function parseCanonicalProjectFactsDraft(
	input: JsonValue,
): CanonicalProjectFactsDraft {
	return canonicalProjectFactsDraftSchema.parse(input);
}

export function parseCanonicalProjectDefinitionDraft(
	input: JsonValue,
): CanonicalProjectDefinitionDraft {
	return canonicalProjectDefinitionDraftSchema.parse(input);
}

export function createCanonicalProjectDefinition(
	args: CreateCanonicalProjectDefinitionArgs,
): CanonicalProjectDefinition {
	const createdAt = args.createdAt ?? Date.now();
	const updatedAt = args.updatedAt ?? createdAt;
	const facts = deriveCodebaseFacts(args.facts);

	return parseCanonicalProjectDefinition({
		clerkUserId: args.clerkUserId,
		productKey: args.productKey,
		schemaVersion: CANONICAL_PROJECT_DEFINITION_SCHEMA_VERSION,
		facts,
		placeholdersInUse: args.placeholdersInUse ?? [],
		createdAt,
		updatedAt,
	});
}

export function createCanonicalProjectDefinitionDraft(
	args: CreateCanonicalProjectDefinitionDraftArgs,
): CanonicalProjectDefinitionDraft {
	const createdAt = args.createdAt ?? Date.now();
	const updatedAt = args.updatedAt ?? createdAt;

	return parseCanonicalProjectDefinitionDraft({
		clerkUserId: args.clerkUserId,
		productKey: args.productKey,
		schemaVersion: CANONICAL_PROJECT_DEFINITION_SCHEMA_VERSION,
		facts: args.facts ?? {},
		placeholdersInUse: args.placeholdersInUse ?? [],
		createdAt,
		updatedAt,
	});
}

export {
	canonicalProjectDefinitionDraftSchema,
	canonicalProjectDefinitionSchema,
	canonicalProjectFactsDraftSchema,
	canonicalProjectFactsSchema,
	type CanonicalPlaceholderField,
	type CanonicalProjectDefinition,
	type CanonicalProjectDefinitionDraft,
	type CanonicalProjectFactKey,
	type CanonicalProjectFacts,
	type CanonicalProjectFactsDraft,
	canonicalProjectFactKeys,
	placeholderFriendlyFactKeys,
} from "./schema";
export { deriveCodebaseFacts } from "./derived-codebase-facts";
