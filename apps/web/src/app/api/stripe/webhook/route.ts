import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { syncStripeWebhookEventToConvex } from "@/lib/billing/stripe-sync";
import { getStripe } from "@/platform/billing/stripe";
import { requireServerEnv } from "@/platform/env/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	const payload = await request.text();
	const signature = request.headers.get("stripe-signature");
	if (!signature) {
		return NextResponse.json(
			{ error: "Missing Stripe signature." },
			{ status: 400 },
		);
	}

	let event: Stripe.Event;
	try {
		event = getStripe().webhooks.constructEvent(
			payload,
			signature,
			requireServerEnv("STRIPE_WEBHOOK_SECRET"),
		);
	} catch {
		return NextResponse.json(
			{ error: "Invalid Stripe signature." },
			{ status: 400 },
		);
	}

	try {
		const result = await syncStripeWebhookEventToConvex(event);
		return NextResponse.json({
			received: true,
			result: result.kind,
		});
	} catch (error) {
		console.error("Stripe webhook billing sync failed", {
			eventId: event.id,
			eventType: event.type,
			error,
		});

		return NextResponse.json(
			{ error: "Unable to sync Stripe billing event." },
			{ status: 500 },
		);
	}
}
