import { api } from "@/convex/_generated/api";
import { PacketReviewPage } from "@/features/packet-flow/components/packet-review-page";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ showLessonMap?: string }>;
}) {
	const initialWorkspaceState = await fetchAuthenticatedQuery(
		api.packet.getPacketWorkspaceState,
		{},
	);
	const { showLessonMap } = await searchParams;

	if (!initialWorkspaceState) {
		throw new Error("Packet workspace state missing");
	}

	const isUnlocked = Boolean(
		initialWorkspaceState.workflowState?.executeShipUnlockedAt,
	);
	const initialResumeDestination = isUnlocked
		? await fetchAuthenticatedQuery(api.packet.getPacketResumeDestination, {})
		: null;
	const initialBonusMissionState =
		isUnlocked && initialResumeDestination?.postReviewTargets
			? await fetchAuthenticatedQuery(api.course.getBonusMissionState, {})
			: null;

	return (
		<PacketReviewPage
			initialWorkspaceState={initialWorkspaceState}
			initialPostReviewTargets={
				initialResumeDestination?.postReviewTargets ?? null
			}
			initialBonusMissionState={initialBonusMissionState ?? null}
			initialShowLessonMap={showLessonMap === "1"}
		/>
	);
}
