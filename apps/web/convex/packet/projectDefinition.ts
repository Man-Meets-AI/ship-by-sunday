import {
	createCanonicalProjectDefinitionDraft,
	parseCanonicalProjectFactsDraft,
	placeholderFriendlyFactKeys,
} from "../../../../packages/packet-compiler/src/canonical-project-definition/project-definition";
import { createCompleteProjectDefinition } from "../../../../packages/packet-compiler/src/fixtures/complete-project-definition";
import { v } from "convex/values";

import { PRODUCT_APP_ID } from "../../config/product";
import { requireGrantedProductAccess } from "../access/model";
import type {
	PacketMutationCtx,
	PacketReadCtx,
	PacketQueryCtx,
	ProjectDefinitionDoc,
} from "./types";
import {
	projectDefinitionFactsValidator,
	projectDefinitionPublicValidator,
} from "./validators";

export const getProjectDefinitionArgs = {};
export const getProjectDefinitionReturns = v.union(
	projectDefinitionPublicValidator,
	v.null(),
);

type SaveProjectDefinitionFactsArgs = {
	stageId: "product" | "design" | "marketing" | "build-plan";
	clearedFieldKeys: string[];
	factsPatch: Record<string, string | number | string[]>;
};

export const saveProjectDefinitionFactsArgs = {
	stageId: v.union(
		v.literal("product"),
		v.literal("design"),
		v.literal("marketing"),
		v.literal("build-plan"),
	),
	clearedFieldKeys: v.array(v.string()),
	factsPatch: projectDefinitionFactsValidator,
};
export const saveProjectDefinitionFactsReturns =
	projectDefinitionPublicValidator;
export const seedCompleteProjectDefinitionForQaArgs = {
	clerkUserId: v.string(),
};
export const seedCompleteProjectDefinitionForQaReturns =
	projectDefinitionPublicValidator;
export const resetProjectDefinitionForQaArgs = {
	clerkUserId: v.string(),
};
export const resetProjectDefinitionForQaReturns = v.null();

export async function getProjectDefinitionByClerkUserId(
	ctx: PacketReadCtx,
	clerkUserId: string,
) {
	return ctx.db
		.query("projectDefinitions")
		.withIndex("by_clerk_user_id_and_product_key", (query) =>
			query.eq("clerkUserId", clerkUserId).eq("productKey", PRODUCT_APP_ID),
		)
		.unique();
}

function serializeProjectDefinition(projectDefinition: ProjectDefinitionDoc) {
	return createCanonicalProjectDefinitionDraft({
		clerkUserId: projectDefinition.clerkUserId,
		productKey: projectDefinition.productKey,
		facts: parseCanonicalProjectFactsDraft(projectDefinition.facts),
		placeholdersInUse: projectDefinition.placeholdersInUse,
		createdAt: projectDefinition.createdAt,
		updatedAt: projectDefinition.updatedAt,
	});
}

export async function getProjectDefinitionHandler(ctx: PacketQueryCtx) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const projectDefinition = await getProjectDefinitionByClerkUserId(
		ctx,
		clerkUserId,
	);

	if (!projectDefinition) {
		return null;
	}

	return serializeProjectDefinition(projectDefinition);
}

function buildPlaceholdersInUse(
	facts: ReturnType<typeof parseCanonicalProjectFactsDraft>,
) {
	return placeholderFriendlyFactKeys.filter(
		(fieldKey) => facts[fieldKey] === undefined,
	);
}

export async function saveProjectDefinitionFactsHandler(
	ctx: PacketMutationCtx,
	args: SaveProjectDefinitionFactsArgs,
) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const existingProjectDefinition = await getProjectDefinitionByClerkUserId(
		ctx,
		clerkUserId,
	);
	const nextFactsSource = {
		...(existingProjectDefinition?.facts ?? {}),
	};
	for (const fieldKey of args.clearedFieldKeys) {
		delete nextFactsSource[fieldKey];
	}
	const nextFacts = parseCanonicalProjectFactsDraft({
		...nextFactsSource,
		...args.factsPatch,
	});
	const now = Date.now();
	const nextProjectDefinition = createCanonicalProjectDefinitionDraft({
		clerkUserId,
		productKey: PRODUCT_APP_ID,
		facts: nextFacts,
		placeholdersInUse: buildPlaceholdersInUse(nextFacts),
		createdAt: existingProjectDefinition?.createdAt ?? now,
		updatedAt: now,
	});

	if (existingProjectDefinition) {
		await ctx.db.patch(existingProjectDefinition._id, {
			facts: nextProjectDefinition.facts,
			placeholdersInUse: nextProjectDefinition.placeholdersInUse,
			updatedAt: nextProjectDefinition.updatedAt,
		});
	} else {
		await ctx.db.insert("projectDefinitions", nextProjectDefinition);
	}

	return nextProjectDefinition;
}

export async function seedCompleteProjectDefinitionForQaHandler(
	ctx: PacketMutationCtx,
	args: { clerkUserId: string },
) {
	const seededProjectDefinition = createCompleteProjectDefinition({
		clerkUserId: args.clerkUserId,
		productKey: PRODUCT_APP_ID,
	});
	const existingProjectDefinition = await getProjectDefinitionByClerkUserId(
		ctx,
		args.clerkUserId,
	);

	if (existingProjectDefinition) {
		await ctx.db.patch(existingProjectDefinition._id, {
			facts: seededProjectDefinition.facts,
			placeholdersInUse: seededProjectDefinition.placeholdersInUse,
			updatedAt: seededProjectDefinition.updatedAt,
		});
		return seededProjectDefinition;
	}

	await ctx.db.insert("projectDefinitions", seededProjectDefinition);
	return seededProjectDefinition;
}

export async function resetProjectDefinitionForQaHandler(
	ctx: PacketMutationCtx,
	args: { clerkUserId: string },
) {
	const existingProjectDefinition = await getProjectDefinitionByClerkUserId(
		ctx,
		args.clerkUserId,
	);

	if (existingProjectDefinition) {
		await ctx.db.delete(existingProjectDefinition._id);
	}

	return null;
}
