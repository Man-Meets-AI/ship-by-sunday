import { redirectEntitledHomeVisitor } from "@/features/course/access/server/course-access";
import HomePage from "@/features/marketing/components/home-page";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ marketing?: string }>;
}) {
	const { marketing } = await searchParams;
	const disableHomeEntitlementRedirect =
		process.env.DISABLE_CLERK_MIDDLEWARE === "1";

	if (!disableHomeEntitlementRedirect) {
		await redirectEntitledHomeVisitor({ allowMarketing: marketing === "1" });
	}

	return <HomePage />;
}
