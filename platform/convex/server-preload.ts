import "server-only";

import { preloadQuery, preloadedQueryResult } from "convex/nextjs";
import type { Preloaded } from "convex/react";
import type {
	FunctionArgs,
	FunctionReference,
	FunctionReturnType,
} from "convex/server";

import { getConvexServerSession } from "@/platform/auth/convex-auth";

export async function preloadAuthenticatedQuery<
	Query extends FunctionReference<"query">,
>(query: Query, args: FunctionArgs<Query>) {
	const session = await getConvexServerSession();
	if (!session.token) {
		return null;
	}

	return preloadQuery(query, args, { token: session.token });
}

export async function preloadAuthenticatedQueryWithResult<
	Query extends FunctionReference<"query">,
>(
	query: Query,
	args: FunctionArgs<Query>,
): Promise<{
	preloaded: Preloaded<Query> | null;
	result: FunctionReturnType<Query> | null;
}> {
	const preloaded = await preloadAuthenticatedQuery(query, args);

	return {
		preloaded,
		result: preloaded ? preloadedQueryResult(preloaded) : null,
	};
}
