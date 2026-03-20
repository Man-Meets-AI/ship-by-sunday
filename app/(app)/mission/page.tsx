import { api } from "@/convex/_generated/api";
import { MissionPage } from "@/features/course/mission/components/mission-page";
import { preloadAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	return (
		<MissionPage
			preloadedMission={await preloadAuthenticatedQuery(
				api.course.getMissionState,
				{},
			)}
		/>
	);
}
