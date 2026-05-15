import "server-only";

import { fetchQuery } from "convex/nextjs";
import { createCanonicalProjectDefinition } from "@shipbysunday/codebase-compiler";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { hasProductSurfaceCapability } from "@/platform/access/product-surface-capabilities";
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

	const access = await fetchQuery(
		api.entitlements.viewerProductAccess,
		{},
		{ token: session.token },
	);

	if (!hasProductSurfaceCapability(access, "generate_codebase")) {
		return null;
	}

	const [projectDefinition, workspaceState] = await Promise.all([
		fetchQuery(api.codebase.getProjectDefinition, {}, { token: session.token }),
		fetchQuery(
			api.codebase.getCodebaseWorkspaceState,
			{},
			{ token: session.token },
		),
	]);

	if (!projectDefinition) {
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
