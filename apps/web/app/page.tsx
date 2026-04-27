import HomePage from "@/app/_components/home-page/home-page";
import { HomePageStructuredData } from "@/app/_components/home-page/sections/home-page-structured-data";
import { redirectGrantedHomeVisitor } from "@/platform/access/product-access";
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
