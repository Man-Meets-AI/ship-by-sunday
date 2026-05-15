import { redirect } from "next/navigation";
import { getLegacyCodebaseRouteRedirectHref } from "@/app/(app)/_lib/legacy-codebase-route-redirects";

export default function Page() {
	redirect(getLegacyCodebaseRouteRedirectHref({ route: "build-plan" }));
}
