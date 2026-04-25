import { redirect } from "next/navigation";
import { getLegacyBlueprintRouteRedirectHref } from "@/features/blueprint-flow/lib/legacy-blueprint-route-redirects";

export default function Page() {
	redirect(getLegacyBlueprintRouteRedirectHref({ route: "build-plan" }));
}
