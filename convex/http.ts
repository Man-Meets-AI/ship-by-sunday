import { httpRouter } from "convex/server";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

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
			console.error("stripe webhook processing error", error);
			return jsonResponse(
				{ error: "Unable to grant product access." },
				{ status: 500 },
			);
		}
	}),
});

export default http;
