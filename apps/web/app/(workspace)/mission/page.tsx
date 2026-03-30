import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { routeConfig } from "@/config/product";
import { BonusRouteStatePanel } from "@/features/execute-ship/components/bonus-route-state-panel";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	const resumeDestination = await fetchAuthenticatedQuery(
		api.packet.getPacketResumeDestination,
		{},
	);

	if (!resumeDestination?.postReviewTargets) {
		return (
			<BonusRouteStatePanel
				eyebrow="Continuation library"
				title="Lesson Map opens after Review & Download."
				description="Finish the core Ship Rails run first. Once your product truth is locked and your Ship Kit is generated, the post-review Lesson Map opens as the continuation surface for building, launch prep, and revisiting the work."
				actionHref={routeConfig.review}
				actionLabel="Go to Review & Download"
			/>
		);
	}

	redirect(resumeDestination.postReviewTargets.lessonMapDestination);
}
