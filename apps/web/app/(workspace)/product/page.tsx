import { redirect } from "next/navigation";
import { getLegacyBlueprintRouteRedirectHref } from "@/app/(workspace)/_lib/legacy-blueprint-route-redirects";

export default function Page() {
	redirect(getLegacyBlueprintRouteRedirectHref({ route: "product" }));
}
