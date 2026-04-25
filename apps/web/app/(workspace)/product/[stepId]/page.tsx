import { redirect } from "next/navigation";
import { getLegacyBlueprintRouteRedirectHref } from "@/features/blueprint-flow/lib/legacy-blueprint-route-redirects";

export default async function Page({
	params,
}: {
	params: Promise<{ stepId: string }>;
}) {
	const { stepId } = await params;

	redirect(getLegacyBlueprintRouteRedirectHref({ route: "product", stepId }));
}
