import { redirect } from "next/navigation";
import { getLegacyCodebaseRouteRedirectHref } from "@/app/(app)/_lib/legacy-codebase-route-redirects";

export default async function Page({
	params,
}: {
	params: Promise<{ stepId: string }>;
}) {
	const { stepId } = await params;

	redirect(getLegacyCodebaseRouteRedirectHref({ route: "product", stepId }));
}
