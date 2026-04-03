import "server-only";

import { fetchQuery } from "convex/nextjs";
import {
	canonicalProjectFactsSchema,
	createCanonicalProjectDefinition,
} from "@blueprint-compiler";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { getConvexServerSession } from "@/platform/auth/convex-auth";

type BlueprintWorkspaceState = FunctionReturnType<
	typeof api.blueprint.getBlueprintWorkspaceState
>;

export async function getBlueprintDownloadContext(): Promise<{
	canonicalProjectDefinition: ReturnType<
		typeof createCanonicalProjectDefinition
	>;
	workspaceState: BlueprintWorkspaceState;
	token: string;
} | null> {
	const session = await getConvexServerSession();
	if (!session.token) {
		return null;
	}

	const [access, projectDefinition, workspaceState] = await Promise.all([
		fetchQuery(api.access.viewerProductAccess, {}, { token: session.token }),
		fetchQuery(
			api.blueprint.getProjectDefinition,
			{},
			{ token: session.token },
		),
		fetchQuery(
			api.blueprint.getBlueprintWorkspaceState,
			{},
			{ token: session.token },
		),
	]);

	if (!access.hasAccess || !projectDefinition) {
		return null;
	}

	return {
		canonicalProjectDefinition: createCanonicalProjectDefinition({
			clerkUserId: projectDefinition.clerkUserId,
			productKey: projectDefinition.productKey,
			facts: canonicalProjectFactsSchema.parse(projectDefinition.facts),
			placeholdersInUse: projectDefinition.placeholdersInUse,
			createdAt: projectDefinition.createdAt,
			updatedAt: projectDefinition.updatedAt,
		}),
		workspaceState,
		token: session.token,
	};
}
