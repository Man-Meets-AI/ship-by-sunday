import { requireCourseAccess } from "@/features/course/access/server/course-access";
import { MissionPage } from "@/features/course/mission/components/mission-page";

export default async function Page() {
	await requireCourseAccess();

	return <MissionPage />;
}
