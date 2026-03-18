import { requireCourseAccess } from "@/features/course/access/server/course-access";
import { SettingsPage } from "@/features/settings/components/settings-page";

export default async function Page() {
	await requireCourseAccess();

	return <SettingsPage />;
}
