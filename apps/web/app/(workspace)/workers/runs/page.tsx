import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(workspace)/_components/access-required/access-required-page";
import { WorkspaceRunsPage } from "@/app/(workspace)/_components/existing-codebase-support/workspace-runs-page";
import { loadWorkspacePageAccess } from "@/app/(workspace)/_server/load-workspace-page-access";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { hasProductSurfaceCapability } from "@/platform/access/product-surface-capabilities";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export const metadata: Metadata = {
	title: "Runs",
};

export default async function Page() {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}
	if (!hasProductSurfaceCapability(workspaceAccess.access, "worker")) {
		redirect(routeConfig.appHome);
	}

	const initialRunHistory = await fetchAuthenticatedQuery(
		api.workspace.getWorkspaceRunHistory,
		{},
	);
	if (!initialRunHistory) {
		throw new Error("Workspace run history requires authentication");
	}

	return <WorkspaceRunsPage initialRunHistory={initialRunHistory} />;
}
