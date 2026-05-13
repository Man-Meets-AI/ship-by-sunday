import { redirect } from "next/navigation";

import { routeConfig } from "@/config/product";

export default async function TutorialVideoRoute({
	params,
}: {
	params: Promise<{ lessonKey: string }>;
}) {
	const { lessonKey } = await params;
	redirect(`${routeConfig.tutorials}/${lessonKey}`);
}
