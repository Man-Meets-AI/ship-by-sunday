import { httpRouter } from "convex/server";
import { z } from "zod";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { requireConvexEnv } from "./env";

const observedErrorEventSchema = z.object({
	fingerprint: z.string().min(1),
	source: z.enum([
		"next_server",
		"next_client",
		"convex",
		"stripe",
		"clerk",
		"codex",
	]),
	message: z.string().min(1),
	stack: z.string().nullable(),
	details: z.string().nullable(),
	requestId: z.string().nullable(),
	pathname: z.string().nullable(),
	userId: z.string().nullable(),
	code: z.string().nullable(),
	severity: z.enum(["medium", "high", "critical"]),
	environment: z.string().min(1),
});

const http = httpRouter();

function jsonResponse(body: unknown, init?: ResponseInit) {
	return Response.json(body, init);
}

http.route({
	path: "/stripe/webhook",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const signature = request.headers.get("stripe-signature");
		if (!signature) {
			return jsonResponse({ error: "Missing Stripe signature." }, { status: 400 });
		}

		try {
			const result = await ctx.runAction(internal.stripeWebhook.processStripeWebhook, {
				body: await request.text(),
				signature,
			});

			switch (result.kind) {
				case "invalid_signature":
					return jsonResponse(
						{ error: "Invalid signature.", message: result.message },
						{ status: 400 },
					);
				case "missing_clerk_user":
					return jsonResponse(
						{ error: "Missing clerk user reference." },
						{ status: 400 },
					);
				case "ignored":
					return jsonResponse({ ignored: true });
				case "granted":
					return jsonResponse({ received: true, grantResult: result.grantResult });
				default:
					return jsonResponse({ error: "Unhandled Stripe webhook result." }, { status: 500 });
			}
		} catch (error) {
			const result = await ctx.runMutation(internal.observability.recordObservedError, {
				fingerprint: "stripe_webhook_failed",
				source: "stripe",
				message:
					error instanceof Error
						? error.message
						: "Unable to grant product access.",
				stack: error instanceof Error ? error.stack ?? null : null,
				details: JSON.stringify({ path: "/stripe/webhook" }),
				requestId: null,
				pathname: "/stripe/webhook",
				userId: null,
				code: "stripe_webhook_failed",
				severity: "high",
				environment: process.env.NODE_ENV ?? "development",
			});
			if (result.shouldAlert) {
				await ctx.runAction(internal.observability.deliverObservedErrorAlert, {
					eventId: result.eventId,
				});
			}
			console.error("stripe webhook processing error", error);
			return jsonResponse(
				{ error: "Unable to grant product access." },
				{ status: 500 },
			);
		}
	}),
});

http.route({
	path: "/observability/events",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const authorization = request.headers.get("authorization");
		const expectedToken = requireConvexEnv("OBSERVABILITY_INGEST_TOKEN");

		if (authorization !== `Bearer ${expectedToken}`) {
			return jsonResponse({ error: "Unauthorized." }, { status: 401 });
		}

		const body = (await request.json().catch(() => null)) as unknown;
		const parsed = observedErrorEventSchema.safeParse(body);
		if (!parsed.success) {
			return jsonResponse({ error: "Invalid event payload." }, { status: 400 });
		}

		const result = await ctx.runMutation(
			internal.observability.recordObservedError,
			parsed.data,
		);

		if (result.shouldAlert) {
			await ctx.runAction(internal.observability.deliverObservedErrorAlert, {
				eventId: result.eventId,
			});
		}

		return jsonResponse({ ok: true }, { status: 202 });
	}),
});

export default http;
