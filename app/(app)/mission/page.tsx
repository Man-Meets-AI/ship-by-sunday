import { api } from "@/convex/_generated/api";
import { MissionPage } from "@/features/course/mission/components/mission-page";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	return (
		<MissionPage
			initialMission={await fetchAuthenticatedQuery(
				api.course.getMissionState,
				{},
			)}
		/>
	);
}
