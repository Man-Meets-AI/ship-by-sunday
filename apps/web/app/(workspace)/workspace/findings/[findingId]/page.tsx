import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(workspace)/_components/access-required/access-required-page";
import { WorkspaceFindingDetailPage } from "@/app/(workspace)/_components/existing-codebase-findings/workspace-finding-detail-page";
import { loadWorkspacePageAccess } from "@/app/(workspace)/_server/load-workspace-page-access";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export const metadata: Metadata = {
	title: "Finding",
};

export default async function Page({
	params,
}: {
	params: Promise<{ findingId: string }>;
}) {
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

	const { findingId } = await params;
	const [initialFindings, setupState] = await Promise.all([
		fetchAuthenticatedQuery(api.workspace.listWorkspaceFindings, {}),
		fetchAuthenticatedQuery(api.workspace.getWorkspaceSetupState, {}),
	]);
	if (!initialFindings) {
		throw new Error("Workspace finding detail requires authentication");
	}
	if (!setupState) {
		throw new Error("Workspace setup state requires authentication");
	}

	return (
		<WorkspaceFindingDetailPage
			initialFindings={initialFindings}
			findingRouteId={findingId}
			projectId={setupState.project?._id ?? null}
			activeRunnerId={setupState.activeRunner?._id ?? null}
			approvalTimestamp={Date.now()}
		/>
	);
}
