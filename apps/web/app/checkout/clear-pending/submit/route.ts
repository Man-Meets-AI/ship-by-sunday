import { type NextRequest, NextResponse } from "next/server";

import { getSafeRedirectPath } from "@/platform/auth/auth-route-utils";
import { PENDING_CHECKOUT_SESSION_COOKIE_NAME } from "@/platform/billing/checkout/pending-checkout-session-cookie";

export function POST(request: NextRequest) {
	const redirectPath = getSafeRedirectPath(
		request.nextUrl.searchParams.get("redirect_url"),
	);
	const response = NextResponse.redirect(
		new URL(redirectPath, request.url),
		303,
	);
	response.cookies.delete(PENDING_CHECKOUT_SESSION_COOKIE_NAME);

	return response;
}
