import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(protected)/_components/access-required/access-required-page";
import { WorkspaceLoopsPage } from "@/app/(protected)/_components/existing-codebase-support/workspace-loops-page";
import { loadWorkspacePageAccess } from "@/app/(protected)/_server/load-workspace-page-access";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { hasProductSurfaceCapability } from "@/platform/access/product-surface-capabilities";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export const metadata: Metadata = {
	title: "Loops",
};

export default async function Page() {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}
	if (!hasProductSurfaceCapability(workspaceAccess.access, "worker")) {
		redirect(routeConfig.appHome);
	}

	const [initialFindings, initialRunHistory] = await Promise.all([
		fetchAuthenticatedQuery(api.workspace.listWorkspaceFindings, {}),
		fetchAuthenticatedQuery(api.workspace.getWorkspaceRunHistory, {}),
	]);
	if (!initialFindings || !initialRunHistory) {
		throw new Error("Workspace loop catalog requires authentication");
	}

	return (
		<WorkspaceLoopsPage
			initialFindings={initialFindings}
			initialRunHistory={initialRunHistory}
		/>
	);
}
