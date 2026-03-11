import { ArtifactsPage } from "@/components/artifacts-page";
import { requireCourseAccess } from "@/lib/server/course-access";
import { getInitialProductTheme } from "@/lib/server/product-theme";

export default async function Page() {
	await requireCourseAccess();
	const initialTheme = await getInitialProductTheme();

	return <ArtifactsPage initialTheme={initialTheme} />;
}
