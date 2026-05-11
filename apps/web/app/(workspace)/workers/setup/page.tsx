import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(workspace)/_components/access-required/access-required-page";
import { ExistingCodebaseSetupPage } from "@/app/(workspace)/_components/existing-codebase-setup/existing-codebase-setup-page";
import { loadWorkspacePageAccess } from "@/app/(workspace)/_server/load-workspace-page-access";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { hasProductSurfaceCapability } from "@/platform/access/product-surface-capabilities";
import {
	getSupportModeBlockedMutationMessage,
	isSupportModeBlockedMutationResult,
} from "@/platform/admin-impersonation";
import { fetchAuthenticatedMutation } from "@/platform/convex/server-preload";

export const metadata: Metadata = {
	title: "Existing codebase setup",
};

export default async function Page() {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}
	if (!hasProductSurfaceCapability(workspaceAccess.access, "worker")) {
		redirect(routeConfig.appHome);
	}

	const initialSetupState = await fetchAuthenticatedMutation(
		api.workspace.prepareWorkspaceSetupPairing,
		{
			runnerMode: "daemon",
		},
	);

	if (!initialSetupState) {
		throw new Error("Worker setup requires an authenticated session");
	}
	if (isSupportModeBlockedMutationResult(initialSetupState)) {
		throw new Error(getSupportModeBlockedMutationMessage());
	}

	return (
		<ExistingCodebaseSetupPage
			initialSetupState={initialSetupState}
			initialRenderedAt={Date.now()}
		/>
	);
}
