import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(app)/_components/access-required/access-required-page";
import { WorkspaceFindingsPage } from "@/app/(app)/_components/existing-codebase-findings/workspace-findings-page";
import { loadWorkspacePageAccess } from "@/app/(app)/_server/load-workspace-page-access";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { hasProductSurfaceCapability } from "@/platform/access/product-surface-capabilities";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export const metadata: Metadata = {
	title: "Findings",
};

export default async function Page() {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}
	if (!hasProductSurfaceCapability(workspaceAccess.access, "worker")) {
		redirect(routeConfig.appHome);
	}

	const initialFindings = await fetchAuthenticatedQuery(
		api.workspace.listWorkspaceFindings,
		{},
	);
	if (!initialFindings) {
		throw new Error("Workspace findings require authentication");
	}

	return <WorkspaceFindingsPage initialFindings={initialFindings} />;
}
