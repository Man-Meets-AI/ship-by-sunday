import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(workspace)/_components/access-required/access-required-page";
import { WorkspacePrivacyPage } from "@/app/(workspace)/_components/existing-codebase-support/workspace-privacy-page";
import { loadWorkspacePageAccess } from "@/app/(workspace)/_server/load-workspace-page-access";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export const metadata: Metadata = {
	title: "Privacy",
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

	const [
		initialSetupState,
		initialSyncPreviewState,
		initialManagedGithubState,
		initialFindings,
	] = await Promise.all([
		fetchAuthenticatedQuery(api.workspace.getWorkspaceSetupState, {}),
		fetchAuthenticatedQuery(api.workspace.getWorkspaceSyncPreviewState, {}),
		fetchAuthenticatedQuery(api.workspace.getManagedGithubExecutionState, {}),
		fetchAuthenticatedQuery(api.workspace.listWorkspaceFindings, {}),
	]);
	if (
		!initialSetupState ||
		!initialSyncPreviewState ||
		!initialManagedGithubState ||
		!initialFindings
	) {
		throw new Error("Workspace privacy state requires authentication");
	}

	return (
		<WorkspacePrivacyPage
			initialSetupState={initialSetupState}
			initialSyncPreviewState={initialSyncPreviewState}
			initialManagedGithubState={initialManagedGithubState}
			initialFindings={initialFindings}
		/>
	);
}
