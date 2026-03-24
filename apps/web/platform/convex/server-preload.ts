import "server-only";

import { fetchQuery } from "convex/nextjs";
import type {
	FunctionArgs,
	FunctionReference,
	FunctionReturnType,
} from "convex/server";

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
