import { MissionPage } from "@/features/course/mission/components/mission-page";
import { requireCourseAccess } from "@/features/course/access/server/course-access";

export default async function Page() {
	await requireCourseAccess();

	return <MissionPage />;
}
