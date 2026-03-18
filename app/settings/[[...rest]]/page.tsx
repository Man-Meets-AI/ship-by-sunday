import { requireCourseAccess } from "@/features/course/access/server/course-access";
import { getInitialProductTheme } from "@/features/course/shared/server/product-theme";
import { SettingsPage } from "@/features/settings/components/settings-page";

export default async function Page() {
	await requireCourseAccess();
	const initialTheme = await getInitialProductTheme();

	return <SettingsPage initialTheme={initialTheme} />;
}
