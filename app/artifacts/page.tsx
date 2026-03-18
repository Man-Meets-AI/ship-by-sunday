import { ArtifactsPage } from "@/features/course/artifacts/components/artifacts-page";
import { requireCourseAccess } from "@/features/course/access/server/course-access";

export default async function Page() {
	await requireCourseAccess();

	return <ArtifactsPage />;
}
