import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(workspace)/_components/access-required/access-required-page";
import { WorkspaceDoctorPassPage } from "@/app/(workspace)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-page";
import { loadWorkspacePageAccess } from "@/app/(workspace)/_server/load-workspace-page-access";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export const metadata: Metadata = {
	title: "Doctor Pass",
};

export default async function Page() {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}
	if (workspaceAccess.access.fulfillmentTrack !== "existing_codebase_doctor") {
		redirect(
			workspaceAccess.access.fulfillmentTrack === "generated_codebase"
				? routeConfig.codebase
				: routeConfig.workspaceChoice,
		);
	}

	const initialSyncPreviewState = await fetchAuthenticatedQuery(
		api.workspace.getWorkspaceSyncPreviewState,
		{},
	);
	if (!initialSyncPreviewState) {
		throw new Error("Workspace doctor pass state requires authentication");
	}

	return (
		<WorkspaceDoctorPassPage
			initialSyncPreviewState={initialSyncPreviewState}
		/>
	);
}
