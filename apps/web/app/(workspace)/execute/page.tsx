import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { routeConfig } from "@/config/product";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	const resumeDestination = await fetchAuthenticatedQuery(
		api.packet.getPacketResumeDestination,
		{},
	);

	if (!resumeDestination?.postReviewTargets) {
		redirect(routeConfig.review);
	}

	redirect(resumeDestination.postReviewTargets.buildLessonsDestination);
}
