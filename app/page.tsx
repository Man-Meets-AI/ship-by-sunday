import HomePage from "@/features/marketing/components/home-page";
import { redirectGrantedHomeVisitor } from "@/features/product-access/server/product-access";
import { shouldBypassClerkProtection } from "@/platform/auth/clerk-middleware-bypass";
import { getHomePageStructuredData } from "@/features/marketing/lib/home-page-structured-data";

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
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: getHomePageStructuredData(),
				}}
			/>
			<HomePage />
		</>
	);
}
