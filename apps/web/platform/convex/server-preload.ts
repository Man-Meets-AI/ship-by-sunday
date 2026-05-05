import "server-only";

import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { FunctionArgs, FunctionReference } from "convex/server";

import { getConvexServerSession } from "@/platform/auth/convex-auth";

export async function fetchAuthenticatedQuery<
	Query extends FunctionReference<"query">,
>(query: Query, args: FunctionArgs<Query>) {
	const session = await getConvexServerSession();
	if (!session.token) {
		return null;
	}

	return fetchQuery(query, args, { token: session.token });
}

export async function fetchAuthenticatedMutation<
	Mutation extends FunctionReference<"mutation">,
>(mutation: Mutation, args: FunctionArgs<Mutation>) {
	const session = await getConvexServerSession();
	if (!session.token) {
		return null;
	}

	return fetchMutation(mutation, args, { token: session.token });
}
