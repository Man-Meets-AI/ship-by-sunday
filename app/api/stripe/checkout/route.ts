import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getCheckoutSuccessHref, routeConfig } from "@/config/product";
import { COURSE_SLUG } from "@/features/course/lesson/model/registry";
import { getAppBaseUrl } from "@/platform/next/app-url";
import { getStripe, getStripeLineItem } from "@/platform/billing/stripe";

export async function POST(request: Request) {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json(
			{ error: "Sign in before starting checkout." },
			{ status: 401 },
		);
	}

	try {
		const stripe = getStripe();
		const user = await currentUser();
		const appBaseUrl = getAppBaseUrl(request);
		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			allow_promotion_codes: true,
			billing_address_collection: "auto",
			cancel_url: `${appBaseUrl}${routeConfig.checkoutCancel}`,
			success_url: `${appBaseUrl}${getCheckoutSuccessHref("{CHECKOUT_SESSION_ID}")}`,
			client_reference_id: userId,
			customer_email: user?.primaryEmailAddress?.emailAddress,
			line_items: [getStripeLineItem()],
			metadata: {
				clerkUserId: userId,
				courseSlug: COURSE_SLUG,
			},
			payment_intent_data: {
				metadata: {
					clerkUserId: userId,
					courseSlug: COURSE_SLUG,
				},
			},
		});

		if (!session.url) {
			return NextResponse.json(
				{ error: "Stripe did not return a checkout URL." },
				{ status: 500 },
			);
		}

		return NextResponse.json({ url: session.url });
	} catch (error) {
		console.error("stripe checkout error", error);
		return NextResponse.json(
			{ error: "Unable to start Stripe checkout." },
			{ status: 500 },
		);
	}
}
