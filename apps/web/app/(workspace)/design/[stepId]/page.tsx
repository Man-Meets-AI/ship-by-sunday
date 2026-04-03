import { redirect } from "next/navigation";
import { getLegacyBlueprintRedirectHref } from "@/features/blueprint-flow/lib/legacy-blueprint-route-redirects";

export default async function Page({
	params,
}: {
	params: Promise<{ stepId: string }>;
}) {
	const { stepId } = await params;
	redirect(getLegacyBlueprintRedirectHref("design", stepId));
}
