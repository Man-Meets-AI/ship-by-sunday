import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(protected)/_components/access-required/access-required-page";
import { WorkspaceDoctorPassPage } from "@/app/(protected)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-page";
import { loadWorkspacePageAccess } from "@/app/(protected)/_server/load-workspace-page-access";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { hasProductSurfaceCapability } from "@/platform/access/product-surface-capabilities";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export const metadata: Metadata = {
	title: "Doctor Pass",
};

export default async function Page() {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}
	if (!hasProductSurfaceCapability(workspaceAccess.access, "worker")) {
		redirect(routeConfig.appHome);
	}

	const initialSyncPreviewState = await fetchAuthenticatedQuery(
		api.workspace.getWorkspaceSyncPreviewState,
		{},
	);
	if (!initialSyncPreviewState) {
		throw new Error("Worker doctor pass state requires authentication");
	}

	return (
		<WorkspaceDoctorPassPage
			initialSyncPreviewState={initialSyncPreviewState}
		/>
	);
}
