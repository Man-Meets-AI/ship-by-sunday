import { api } from "@/convex/_generated/api";
import { ArtifactsPage } from "@/features/course/artifacts/components/artifacts-page";
import { preloadAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	return (
		<ArtifactsPage
			preloadedArtifacts={await preloadAuthenticatedQuery(
				api.course.listArtifacts,
				{},
			)}
		/>
	);
}
