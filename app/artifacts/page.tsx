import { requireCourseAccess } from "@/features/course/access/server/course-access";
import { ArtifactsPage } from "@/features/course/artifacts/components/artifacts-page";

export default async function Page() {
	await requireCourseAccess();

	return <ArtifactsPage />;
}
