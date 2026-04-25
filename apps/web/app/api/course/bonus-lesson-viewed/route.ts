import { markBonusLessonViewedFromRequest } from "@/features/execute-ship/server/bonus-lesson-view-tracking";

export async function POST(request: Request) {
	return await markBonusLessonViewedFromRequest(request);
}
