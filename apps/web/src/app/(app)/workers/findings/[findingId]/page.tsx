import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(app)/_components/access-required/access-required-page";
import { WorkspaceFindingDetailPage } from "@/app/(app)/_components/existing-codebase-findings/workspace-finding-detail-page";
import { loadWorkspacePageAccess } from "@/app/(app)/_server/load-workspace-page-access";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { hasProductSurfaceCapability } from "@/platform/access/product-surface-capabilities";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export const metadata: Metadata = {
	title: "Finding",
};

export default async function Page({
	params,
}: {
	params: Promise<{ findingId: string }>;
}) {
	const [workspaceAccess, { findingId }] = await Promise.all([
		loadWorkspacePageAccess(),
		params,
	]);
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}
	if (!hasProductSurfaceCapability(workspaceAccess.access, "worker")) {
		redirect(routeConfig.appHome);
	}

	const [initialFindings, setupState] = await Promise.all([
		fetchAuthenticatedQuery(api.workspace.listWorkspaceFindings, {}),
		fetchAuthenticatedQuery(api.workspace.getWorkspaceSetupState, {}),
	]);
	if (!initialFindings) {
		throw new Error("Worker finding detail requires authentication");
	}
	if (!setupState) {
		throw new Error("Worker setup state requires authentication");
	}
	const approvalTimestamp = Date.now();

	return (
		<WorkspaceFindingDetailPage
			initialFindings={initialFindings}
			findingRouteId={findingId}
			projectId={setupState.project?._id ?? null}
			activeRunnerId={setupState.activeRunner?._id ?? null}
			approvalTimestamp={approvalTimestamp}
		/>
	);
}
