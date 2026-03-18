import { ArtifactsPage } from "@/features/course/artifacts/components/artifacts-page";
import { requireCourseAccess } from "@/features/course/access/server/course-access";
import { getInitialProductTheme } from "@/features/course/shared/server/product-theme";

export default async function Page() {
	await requireCourseAccess();
	const initialTheme = await getInitialProductTheme();

	return <ArtifactsPage initialTheme={initialTheme} />;
}
