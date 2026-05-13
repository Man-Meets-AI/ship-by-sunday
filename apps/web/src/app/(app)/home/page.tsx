import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(app)/_components/access-required/access-required-page";
import { PaidAppHomePage } from "@/app/(app)/_components/paid-app-home/paid-app-home-page";
import { buildPaidAppHomeModel } from "@/app/(app)/_lib/paid-app-home-model";
import { loadWorkspacePageAccess } from "@/app/(app)/_server/load-workspace-page-access";
import { routeConfig } from "@/config/product";
import { resolveProductSurfaceCapabilities } from "@/platform/access/product-surface-capabilities";

export const metadata: Metadata = {
	title: "Home",
};

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ welcome?: string }>;
}) {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}

	const { welcome } = await searchParams;
	const showCheckoutWelcome = welcome === "checkout";
	const capabilities = resolveProductSurfaceCapabilities(
		workspaceAccess.access.capabilities,
	);
	const hasStarterAccess =
		capabilities.includes("generate_codebase") ||
		capabilities.includes("tutorials");
	const hasWorkerAccess = capabilities.includes("worker");
	if (!showCheckoutWelcome && hasStarterAccess && !hasWorkerAccess) {
		redirect(routeConfig.starterHome);
	}
	if (!showCheckoutWelcome && hasWorkerAccess && !hasStarterAccess) {
		redirect(routeConfig.workspaceSetup);
	}

	const user = showCheckoutWelcome ? await currentUser() : null;

	return (
		<PaidAppHomePage
			accountEmail={user?.primaryEmailAddress?.emailAddress ?? undefined}
			model={buildPaidAppHomeModel()}
			showCheckoutWelcome={showCheckoutWelcome}
		/>
	);
}
