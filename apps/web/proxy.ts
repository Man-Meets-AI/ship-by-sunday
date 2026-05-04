import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { routeConfig } from "@/config/product";
import { captureServerError } from "@/platform/observability/capture-server-error";
import { getClerkAuthorizedParties } from "@/platform/auth/clerk-authorized-parties";
import { shouldBypassClerkProtection } from "@/platform/auth/clerk-middleware-bypass";

const disableClerkMiddleware = shouldBypassClerkProtection();
const clerkAuthorizedParties = getClerkAuthorizedParties();

const canonicalWorkspaceRoutes = [
	routeConfig.codebase,
	routeConfig.review,
	routeConfig.settings,
	routeConfig.workspaceChoice,
	routeConfig.workspaceSetup,
] as const;

const compatibilityWorkspaceRoutes = [
	routeConfig.execute,
	routeConfig.mission,
	routeConfig.artifacts,
	"/start",
	"/product",
	"/design",
	"/marketing",
	"/build-plan",
] as const;

const isProtectedRoute = createRouteMatcher([
	...canonicalWorkspaceRoutes.map((route) => `${route}(.*)`),
	...compatibilityWorkspaceRoutes.map((route) => `${route}(.*)`),
	"/lesson(.*)",
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
					? {
							authorizedParties: clerkAuthorizedParties,
							signInUrl: routeConfig.signIn,
							signUpUrl: routeConfig.signUp,
						}
					: {
							signInUrl: routeConfig.signIn,
							signUpUrl: routeConfig.signUp,
						},
		);

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
	],
};
