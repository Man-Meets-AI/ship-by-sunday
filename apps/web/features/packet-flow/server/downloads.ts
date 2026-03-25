import "server-only";

import { fetchQuery } from "convex/nextjs";
import {
	canonicalProjectFactsSchema,
	createCanonicalProjectDefinition,
} from "@packet-compiler";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { getConvexServerSession } from "@/platform/auth/convex-auth";

type PacketWorkspaceState = FunctionReturnType<
	typeof api.packet.getPacketWorkspaceState
>;

export async function getPacketDownloadContext(): Promise<{
	canonicalProjectDefinition: ReturnType<typeof createCanonicalProjectDefinition>;
	workspaceState: PacketWorkspaceState;
} | null> {
	const session = await getConvexServerSession();
	if (!session.token) {
		return null;
	}

	const [access, projectDefinition, workspaceState] = await Promise.all([
		fetchQuery(api.access.viewerProductAccess, {}, { token: session.token }),
		fetchQuery(api.packet.getProjectDefinition, {}, { token: session.token }),
		fetchQuery(api.packet.getPacketWorkspaceState, {}, { token: session.token }),
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
	};
}
