import { redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(protected)/_components/access-required/access-required-page";
import { CodebaseReviewPage } from "@/app/(protected)/generate-codebase/review/_components/codebase-review-page";
import { loadWorkspacePageAccess } from "@/app/(protected)/_server/load-workspace-page-access";
import { api } from "@/convex/_generated/api";
import { isReviewAutoDownloadEnabled } from "@/lib/codebase-flow/review-download-handoff";
import { routeConfig } from "@/config/product";
import { hasProductSurfaceCapability } from "@/platform/access/product-surface-capabilities";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ download?: string; showLessonMap?: string }>;
}) {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}
	if (
		!hasProductSurfaceCapability(workspaceAccess.access, "generate_codebase")
	) {
		redirect(routeConfig.appHome);
	}

	const [initialWorkspaceState, { download, showLessonMap }] =
		await Promise.all([
			fetchAuthenticatedQuery(api.codebase.getCodebaseWorkspaceState, {}),
			searchParams,
		]);

	if (!initialWorkspaceState) {
		throw new Error("Codebase workspace state missing");
	}
	if (!initialWorkspaceState.codebaseReadiness.review.isReady) {
		redirect(routeConfig.codebase);
	}

	const isUnlocked = Boolean(
		initialWorkspaceState.workflowState?.executeShipUnlockedAt,
	);
	const initialResumeDestination = isUnlocked
		? await fetchAuthenticatedQuery(
				api.codebase.getCodebaseResumeDestination,
				{},
			)
		: null;
	const initialBonusMissionState =
		isUnlocked && initialResumeDestination?.postReviewTargets
			? await fetchAuthenticatedQuery(api.course.getBonusMissionState, {})
			: null;

	return (
		<CodebaseReviewPage
			initialWorkspaceState={initialWorkspaceState}
			initialPostReviewTargets={
				initialResumeDestination?.postReviewTargets ?? null
			}
			initialBonusMissionState={initialBonusMissionState ?? null}
			initialAutoDownload={isReviewAutoDownloadEnabled(download)}
			initialShowLessonMap={showLessonMap === "1"}
		/>
	);
}
