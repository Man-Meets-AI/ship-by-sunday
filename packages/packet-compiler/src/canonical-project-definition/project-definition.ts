import {
	canonicalProjectDefinitionDraftSchema,
	canonicalProjectDefinitionSchema,
	canonicalProjectFactsDraftSchema,
	type CanonicalProjectDefinition,
	type CanonicalProjectDefinitionDraft,
	type CanonicalProjectFacts,
	type CanonicalProjectFactsDraft,
} from "./schema";

export const CANONICAL_PROJECT_DEFINITION_SCHEMA_VERSION = 1;

type CreateCanonicalProjectDefinitionArgs = {
	clerkUserId: string;
	productKey: string;
	facts: CanonicalProjectFacts;
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
	input: unknown,
): CanonicalProjectDefinition {
	return canonicalProjectDefinitionSchema.parse(input);
}

export function parseCanonicalProjectFactsDraft(
	input: unknown,
): CanonicalProjectFactsDraft {
	return canonicalProjectFactsDraftSchema.parse(input);
}

export function parseCanonicalProjectDefinitionDraft(
	input: unknown,
): CanonicalProjectDefinitionDraft {
	return canonicalProjectDefinitionDraftSchema.parse(input);
}

export function createCanonicalProjectDefinition(
	args: CreateCanonicalProjectDefinitionArgs,
): CanonicalProjectDefinition {
	const createdAt = args.createdAt ?? Date.now();
	const updatedAt = args.updatedAt ?? createdAt;

	return parseCanonicalProjectDefinition({
		clerkUserId: args.clerkUserId,
		productKey: args.productKey,
		schemaVersion: CANONICAL_PROJECT_DEFINITION_SCHEMA_VERSION,
		facts: args.facts,
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
