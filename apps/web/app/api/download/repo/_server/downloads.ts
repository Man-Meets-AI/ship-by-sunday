import "server-only";

import { fetchQuery } from "convex/nextjs";
import { createCanonicalProjectDefinition } from "@shipbysunday/codebase-compiler";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { getConvexServerSession } from "@/platform/auth/convex-auth";

type CodebaseWorkspaceState = FunctionReturnType<
	typeof api.codebase.getCodebaseWorkspaceState
>;

export async function getCodebaseDownloadContext(): Promise<{
	canonicalProjectDefinition: ReturnType<
		typeof createCanonicalProjectDefinition
	>;
	workspaceState: CodebaseWorkspaceState;
	token: string;
} | null> {
	const session = await getConvexServerSession();
	if (!session.token) {
		return null;
	}

	const [access, projectDefinition, workspaceState] = await Promise.all([
		fetchQuery(api.access.viewerProductAccess, {}, { token: session.token }),
		fetchQuery(api.codebase.getProjectDefinition, {}, { token: session.token }),
		fetchQuery(
			api.codebase.getCodebaseWorkspaceState,
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
			facts: projectDefinition.facts,
			placeholdersInUse: projectDefinition.placeholdersInUse,
			createdAt: projectDefinition.createdAt,
			updatedAt: projectDefinition.updatedAt,
		}),
		workspaceState,
		token: session.token,
	};
}
