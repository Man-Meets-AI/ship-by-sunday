import { httpRouter } from "convex/server";
import { z } from "zod";

import {
	incidentControlStatusValues,
	incidentEnvironmentValues,
	incidentSeverityValues,
	incidentSourceValues,
	incidentSurfaceValues,
	normalizeIncidentEvent,
} from "../features/observability/lib/incident";
import {
	buildStripeWebhookResultIncidentEvent,
	getStripeModeLabelFromSecretKey,
	type StripeWebhookIncidentResult,
} from "../features/observability/lib/stripe-webhook-incident";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { requireConvexEnv } from "./env";

const observedIncidentEventSchema = z.object({
	product: z.string().min(1),
	environment: z.enum(incidentEnvironmentValues),
	fingerprint: z.string().min(1),
	source: z.enum(incidentSourceValues),
	surface: z.enum(incidentSurfaceValues),
	title: z.string().min(1),
	summary: z.string().min(1),
	code: z.string().nullable(),
	severity: z.enum(incidentSeverityValues),
	requestId: z.string().nullable(),
	pathname: z.string().nullable(),
	userId: z.string().nullable(),
	externalEventId: z.string().nullable(),
	deploymentId: z.string().nullable(),
	nativeUrl: z.string().nullable(),
	logsUrl: z.string().nullable(),
	nextAction: z.string().nullable(),
	stack: z.string().nullable(),
	details: z.string().nullable(),
});

const incidentStatusControlSchema = z.object({
	incidentId: z.string().min(1),
	status: z.enum(incidentControlStatusValues),
});

const http = httpRouter();

function jsonResponse(body: unknown, init?: ResponseInit) {
	return Response.json(body, init);
}

async function recordIncidentAndMaybeNotify(
	ctx: {
		runMutation: (
			ref: typeof internal.observability.recordIncident,
			args: ReturnType<typeof normalizeIncidentEvent>,
		) => Promise<{ incidentId: Id<"incidents">; shouldNotify: boolean }>;
		runAction: (
			ref: typeof internal.observability.deliverIncidentNotification,
			args: { incidentId: Id<"incidents"> },
		) => Promise<unknown>;
	},
	incident: ReturnType<typeof normalizeIncidentEvent>,
) {
	const result = await ctx.runMutation(
		internal.observability.recordIncident,
		incident,
	);
	if (result.shouldNotify) {
		await ctx.runAction(internal.observability.deliverIncidentNotification, {
			incidentId: result.incidentId,
		});
	}
}

function buildConvexStripeWebhookResultIncident(
	result: StripeWebhookIncidentResult,
) {
	return buildStripeWebhookResultIncidentEvent({
		result,
		stripeMode: getStripeModeLabelFromSecretKey(
			requireConvexEnv("STRIPE_SECRET_KEY"),
		),
	});
}

http.route({
	path: "/stripe/webhook",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const signature = request.headers.get("stripe-signature");
		if (!signature) {
			await recordIncidentAndMaybeNotify(
				ctx,
				normalizeIncidentEvent({
					...buildConvexStripeWebhookResultIncident({
						kind: "invalid_signature",
						message: "Missing stripe-signature header.",
					}),
					pathname: "/stripe/webhook",
				}),
			);
			return jsonResponse(
				{ error: "Missing Stripe signature." },
				{ status: 400 },
			);
		}

		try {
			const result = await ctx.runAction(
				internal.stripeWebhook.processStripeWebhook,
				{
					body: await request.text(),
					signature,
				},
			);

			switch (result.kind) {
				case "invalid_signature":
					await recordIncidentAndMaybeNotify(
						ctx,
						normalizeIncidentEvent({
							...buildConvexStripeWebhookResultIncident(result),
							pathname: "/stripe/webhook",
						}),
					);
					return jsonResponse(
						{ error: "Invalid signature.", message: result.message },
						{ status: 400 },
					);
				case "missing_checkout_email":
					await recordIncidentAndMaybeNotify(
						ctx,
						normalizeIncidentEvent({
							...buildConvexStripeWebhookResultIncident(result),
							pathname: "/stripe/webhook",
						}),
					);
					return jsonResponse(
						{ error: "Missing Stripe checkout email." },
						{ status: 400 },
					);
				case "pending_claim_saved":
					return jsonResponse({
						received: true,
						pendingClaimSaved: true,
						saveResult: result.saveResult,
					});
				case "grant_failed":
					await recordIncidentAndMaybeNotify(
						ctx,
						normalizeIncidentEvent({
							...buildConvexStripeWebhookResultIncident(result),
							pathname: "/stripe/webhook",
						}),
					);
					return jsonResponse(
						{ error: "Unable to grant product access." },
						{ status: 500 },
					);
				case "ignored":
					return jsonResponse({ ignored: true });
				case "granted":
					return jsonResponse({
						received: true,
						grantResult: result.grantResult,
					});
				default:
					return jsonResponse(
						{ error: "Unhandled Stripe webhook result." },
						{ status: 500 },
					);
			}
		} catch (error) {
			await recordIncidentAndMaybeNotify(
				ctx,
				normalizeIncidentEvent({
					source: "stripe",
					error,
					pathname: "/stripe/webhook",
					code: "stripe_webhook_failed",
					severity: "high",
					surface: "webhook",
					details: {
						path: "/stripe/webhook",
					},
				}),
			);
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
		const parsed = observedIncidentEventSchema.safeParse(body);
		if (!parsed.success) {
			return jsonResponse({ error: "Invalid event payload." }, { status: 400 });
		}

		const result = await ctx.runMutation(
			internal.observability.recordIncident,
			parsed.data,
		);

		if (result.shouldNotify) {
			await ctx.runAction(internal.observability.deliverIncidentNotification, {
				incidentId: result.incidentId,
			});
		}

		return jsonResponse({ ok: true }, { status: 202 });
	}),
});

http.route({
	path: "/observability/incidents/status",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const authorization = request.headers.get("authorization");
		const expectedToken = requireConvexEnv("OBSERVABILITY_INGEST_TOKEN");

		if (authorization !== `Bearer ${expectedToken}`) {
			return jsonResponse({ error: "Unauthorized." }, { status: 401 });
		}

		const body = (await request.json().catch(() => null)) as unknown;
		const parsed = incidentStatusControlSchema.safeParse(body);
		if (!parsed.success) {
			return jsonResponse(
				{
					error:
						"Invalid payload. Expected { incidentId, status: acked | muted | resolved | firing }.",
				},
				{ status: 400 },
			);
		}

		await ctx.runMutation(internal.observability.updateIncidentStatus, {
			incidentId: parsed.data.incidentId as Id<"incidents">,
			status: parsed.data.status,
		});

		return jsonResponse(
			{
				ok: true,
				incidentId: parsed.data.incidentId,
				status: parsed.data.status,
			},
			{ status: 200 },
		);
	}),
});

export default http;
