import { api } from "@/convex/_generated/api";
import { MissionPage } from "@/features/course/mission/components/mission-page";
import { serverEnv } from "@/platform/env/server";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page({
	searchParams,
}: {
	searchParams?: Promise<{ __throwTestBoundary?: string }>;
}) {
	const params = searchParams ? await searchParams : {};
	if (
		serverEnv.ENABLE_OBSERVABILITY_TEST_TRIGGER === "1" &&
		params.__throwTestBoundary === "protected-shell"
	) {
		throw new Error("Protected shell test failure");
	}

	return (
		<MissionPage
			initialMission={await fetchAuthenticatedQuery(
				api.course.getMissionState,
				{},
			)}
		/>
	);
}
