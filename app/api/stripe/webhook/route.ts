import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import Stripe from "stripe";

import { api } from "@/convex/_generated/api";
import { requireServerEnv, serverEnv } from "@/lib/env/server";

function getWebhookStripe() {
	return new Stripe(requireServerEnv("STRIPE_SECRET_KEY"), {
		apiVersion: "2026-02-25.clover",
	});
}

export async function POST(request: Request) {
	const signature = request.headers.get("stripe-signature");
	const webhookSecret = serverEnv.STRIPE_WEBHOOK_SECRET;

	if (!signature || !webhookSecret || !serverEnv.STRIPE_SECRET_KEY) {
		return NextResponse.json(
			{ error: "Missing Stripe webhook configuration." },
			{ status: 500 },
		);
	}

	const body = await request.text();

	let event: Stripe.Event;

	try {
		event = getWebhookStripe().webhooks.constructEvent(
			body,
			signature,
			webhookSecret,
		);
	} catch (error) {
		console.error("stripe webhook signature error", error);
		return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
	}

	if (
		event.type !== "checkout.session.completed" &&
		event.type !== "checkout.session.async_payment_succeeded"
	) {
		return NextResponse.json({ ignored: true });
	}

	const session = event.data.object as Stripe.Checkout.Session;
	const clerkUserId =
		session.metadata?.clerkUserId ?? session.client_reference_id ?? undefined;
	const courseSlug = session.metadata?.courseSlug ?? "ship-by-sunday";

	if (!clerkUserId) {
		return NextResponse.json(
			{ error: "Missing clerk user reference." },
			{ status: 400 },
		);
	}

	await fetchMutation(api.course.grantEntitlementFromStripe, {
		webhookSecret,
		clerkUserId,
		courseSlug,
		stripeCustomerId:
			typeof session.customer === "string" ? session.customer : undefined,
		stripeCheckoutSessionId: session.id,
		stripePaymentIntentId:
			typeof session.payment_intent === "string"
				? session.payment_intent
				: undefined,
	});

	return NextResponse.json({ received: true });
}
