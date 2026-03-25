import HomePage from "@/features/marketing/components/home-page";
import { HomePageStructuredData } from "@/features/marketing/components/home-page/home-page-structured-data";
import { redirectGrantedHomeVisitor } from "@/features/product-access/server/product-access";
import { shouldBypassClerkProtection } from "@/platform/auth/clerk-middleware-bypass";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ marketing?: string }>;
}) {
	const { marketing } = await searchParams;
	const disableHomeAccessRedirect = shouldBypassClerkProtection();

	if (!disableHomeAccessRedirect) {
		await redirectGrantedHomeVisitor({ allowMarketing: marketing === "1" });
	}

	return (
		<>
			<HomePageStructuredData />
			<HomePage />
		</>
	);
}
