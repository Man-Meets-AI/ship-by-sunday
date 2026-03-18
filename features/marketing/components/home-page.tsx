import { redirectEntitledHomeVisitor } from "@/features/course/access/server/course-access";
import { homePageContent } from "@/features/marketing/content/home";
import { HomePageView } from "./home-page/view";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ marketing?: string }>;
}) {
	const { marketing } = await searchParams;

	await redirectEntitledHomeVisitor({ allowMarketing: marketing === "1" });

	return <HomePageView content={homePageContent} />;
}
