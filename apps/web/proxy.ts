import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { routeConfig } from "@/config/product";
import { captureServerError } from "@/features/observability/server/capture-server-error";
import { getClerkAuthorizedParties } from "@/platform/auth/clerk-authorized-parties";
import { shouldBypassClerkProtection } from "@/platform/auth/clerk-middleware-bypass";

const disableClerkMiddleware = shouldBypassClerkProtection();
const clerkAuthorizedParties = getClerkAuthorizedParties();

const canonicalWorkspaceRoutes = [
	routeConfig.start,
	routeConfig.product,
	routeConfig.design,
	routeConfig.marketing,
	routeConfig.buildPlan,
	routeConfig.review,
] as const;

const isProtectedRoute = createRouteMatcher([
	...canonicalWorkspaceRoutes.map((route) => `${route}(.*)`),
	`${routeConfig.mission}(.*)`,
	"/lesson(.*)",
	`${routeConfig.artifacts}(.*)`,
	`${routeConfig.settings}(.*)`,
]);

export default disableClerkMiddleware
	? () => NextResponse.next()
	: clerkMiddleware(
			async (auth, request) => {
				try {
					if (isProtectedRoute(request)) {
						await auth.protect();
					}
				} catch (error) {
					await captureServerError({
						source: "clerk",
						error,
						pathname: request.nextUrl.pathname,
						requestId: request.headers.get("x-request-id"),
						code: "clerk_proxy_failed",
						severity: "high",
						details: {
							method: request.method,
						},
					});
					throw error;
				}
			},
			() =>
				clerkAuthorizedParties.length > 0
					? { authorizedParties: clerkAuthorizedParties }
					: {},
		);

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
	],
};
