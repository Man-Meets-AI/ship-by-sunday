import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import Stripe from "stripe";

import { apiConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { COURSE_SLUG } from "@/features/course/lesson/model/registry";
import { requireServerEnv, serverEnv } from "@/platform/env/server";

function getWebhookStripe() {
	return new Stripe(requireServerEnv("STRIPE_SECRET_KEY"), {
		apiVersion: apiConfig.stripeApiVersion,
	});
}

function logStripeWebhook(
	level: "info" | "warn" | "error",
	payload: Record<string, unknown>,
) {
	console[level](`[stripe-webhook] ${JSON.stringify(payload)}`);
}

export async function POST(request: Request) {
	const signature = request.headers.get("stripe-signature");
	const webhookSecret = serverEnv.STRIPE_WEBHOOK_SECRET;

	if (!signature || !webhookSecret || !serverEnv.STRIPE_SECRET_KEY) {
		logStripeWebhook("error", {
			stage: "config_missing",
			hasSignature: Boolean(signature),
			hasWebhookSecret: Boolean(webhookSecret),
			hasStripeSecretKey: Boolean(serverEnv.STRIPE_SECRET_KEY),
		});
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
		logStripeWebhook("error", {
			stage: "signature_invalid",
			message:
				error instanceof Error ? error.message : "Unknown signature error",
		});
		return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
	}

	if (
		event.type !== "checkout.session.completed" &&
		event.type !== "checkout.session.async_payment_succeeded"
	) {
		logStripeWebhook("info", {
			stage: "ignored_event",
			eventId: event.id,
			eventType: event.type,
		});
		return NextResponse.json({ ignored: true });
	}

	const session = event.data.object as Stripe.Checkout.Session;
	const clerkUserId =
		session.metadata?.clerkUserId ?? session.client_reference_id ?? undefined;
	const courseSlug = session.metadata?.courseSlug ?? COURSE_SLUG;

	if (!clerkUserId) {
		logStripeWebhook("error", {
			stage: "missing_clerk_user",
			eventId: event.id,
			eventType: event.type,
			sessionId: session.id,
			clientReferenceId: session.client_reference_id ?? null,
			metadata: session.metadata ?? {},
		});
		return NextResponse.json(
			{ error: "Missing clerk user reference." },
			{ status: 400 },
		);
	}

	logStripeWebhook("info", {
		stage: "grant_started",
		eventId: event.id,
		eventType: event.type,
		sessionId: session.id,
		clerkUserId,
		courseSlug,
	});

	try {
		const grantResult = await fetchMutation(
			api.course.grantEntitlementFromStripe,
			{
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
			},
		);

		logStripeWebhook("info", {
			stage: "grant_succeeded",
			eventId: event.id,
			eventType: event.type,
			sessionId: session.id,
			clerkUserId,
			courseSlug,
			grantResult,
		});
	} catch (error) {
		logStripeWebhook("error", {
			stage: "grant_failed",
			eventId: event.id,
			eventType: event.type,
			sessionId: session.id,
			clerkUserId,
			courseSlug,
			message: error instanceof Error ? error.message : "Unknown grant error",
		});
		return NextResponse.json(
			{ error: "Unable to grant entitlement." },
			{ status: 500 },
		);
	}

	return NextResponse.json({ received: true });
}
