import { markBonusLessonViewedFromRequest } from "@/app/api/course/bonus-lesson-viewed/_server/bonus-lesson-view-tracking";

export async function POST(request: Request) {
	return await markBonusLessonViewedFromRequest(request);
}
