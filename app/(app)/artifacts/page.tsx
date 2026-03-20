import { api } from "@/convex/_generated/api";
import { ArtifactsPage } from "@/features/course/artifacts/components/artifacts-page";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	return (
		<ArtifactsPage
			initialArtifacts={await fetchAuthenticatedQuery(
				api.course.listArtifacts,
				{},
			)}
		/>
	);
}
