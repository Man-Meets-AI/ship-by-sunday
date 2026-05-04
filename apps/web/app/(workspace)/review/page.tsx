import { api } from "@/convex/_generated/api";
import { isReviewAutoDownloadEnabled } from "@/lib/codebase-flow/review-download-handoff";
import { AccessRequiredPage } from "@/app/(workspace)/_components/access-required/access-required-page";
import { loadWorkspacePageAccess } from "@/app/(workspace)/_server/load-workspace-page-access";
import { CodebaseReviewPage } from "@/app/(workspace)/review/_components/codebase-review-page";
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

	const initialWorkspaceState = await fetchAuthenticatedQuery(
		api.codebase.getCodebaseWorkspaceState,
		{},
	);
	const { download, showLessonMap } = await searchParams;

	if (!initialWorkspaceState) {
		throw new Error("Codebase workspace state missing");
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
