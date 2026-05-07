import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(workspace)/_components/access-required/access-required-page";
import { WorkspaceFulfillmentChoice } from "@/app/(workspace)/_components/workspace-fulfillment-choice";
import { loadWorkspacePageAccess } from "@/app/(workspace)/_server/load-workspace-page-access";
import { routeConfig } from "@/config/product";

export const metadata: Metadata = {
	title: "Choose workspace path",
};

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ welcome?: string }>;
}) {
	const { welcome } = await searchParams;
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}

	if (workspaceAccess.access.fulfillmentTrack === "generated_codebase") {
		redirect(routeConfig.codebase);
	}

	if (workspaceAccess.access.fulfillmentTrack === "existing_codebase_doctor") {
		redirect(routeConfig.workspaceSetup);
	}

	const showCheckoutWelcome = welcome === "checkout";
	const user = showCheckoutWelcome ? await currentUser() : null;

	return (
		<WorkspaceFulfillmentChoice
			showCheckoutWelcome={showCheckoutWelcome}
			accountEmail={user?.primaryEmailAddress?.emailAddress ?? undefined}
		/>
	);
}
