import { api } from "@/convex/_generated/api";
import { ArtifactsPage } from "@/features/course/artifacts/components/artifacts-page";
import { CourseModuleDisabledState } from "@/features/starter/components/course-module-disabled-state";
import { isStarterModuleEnabled } from "@/features/starter/lib/starter-selectors";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	if (!isStarterModuleEnabled("course")) {
		return <CourseModuleDisabledState />;
	}

	return (
		<ArtifactsPage
			initialArtifacts={await fetchAuthenticatedQuery(
				api.course.listArtifacts,
				{},
			)}
		/>
	);
}
