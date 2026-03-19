import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const disableClerkMiddleware = process.env.DISABLE_CLERK_MIDDLEWARE === "1";

const isProtectedRoute = createRouteMatcher([
	"/mission(.*)",
	"/lesson(.*)",
	"/artifacts(.*)",
	"/settings(.*)",
]);

export default disableClerkMiddleware
	? () => NextResponse.next()
	: clerkMiddleware(async (auth, request) => {
			if (isProtectedRoute(request)) {
				await auth.protect();
			}
		});

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
	],
};
