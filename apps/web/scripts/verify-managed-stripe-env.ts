import {
	assertManagedStripeEnvReadyForRelease,
	assertManagedStripeWebhookEndpointReadyForRelease,
	getManagedStripeConfigFromEnv,
	getNormalizedStripeSecretKey,
	type StripeModeLabel,
} from "@/platform/billing/managed-stripe-config";
import Stripe from "stripe";

import { apiConfig } from "@/config/product";

function parseArgs(argv: string[]) {
	let appBaseUrl: string | null = null;
	let expectedMode: StripeModeLabel | undefined;
	let expectedWebhookUrl: string | undefined;
	let requireWebhookEndpoint = false;

	for (let index = 0; index < argv.length; index += 1) {
		const current = argv[index];

		if (current?.startsWith("--app-base-url=")) {
			appBaseUrl = current.slice("--app-base-url=".length);
			continue;
		}

		if (current === "--app-base-url") {
			appBaseUrl = argv[index + 1] ?? null;
			index += 1;
			continue;
		}

		if (current?.startsWith("--expected-mode=")) {
			const value = current.slice("--expected-mode=".length);
			if (value === "test" || value === "live") {
				expectedMode = value;
			}
			continue;
		}

		if (current === "--expected-mode") {
			const value = argv[index + 1];
			if (value === "test" || value === "live") {
				expectedMode = value;
			}
			index += 1;
			continue;
		}

		if (current?.startsWith("--expected-webhook-url=")) {
			expectedWebhookUrl = current.slice("--expected-webhook-url=".length);
			requireWebhookEndpoint = true;
			continue;
		}

		if (current === "--expected-webhook-url") {
			expectedWebhookUrl = argv[index + 1];
			requireWebhookEndpoint = true;
			index += 1;
			continue;
		}

		if (current === "--require-webhook-endpoint") {
			requireWebhookEndpoint = true;
		}
	}

	return {
		appBaseUrl,
		expectedMode,
		expectedWebhookUrl,
		requireWebhookEndpoint,
	};
}

async function verifyHostedCheckoutRoute(appBaseUrl: string) {
	const checkoutRouteUrl = new URL("/api/stripe/checkout", appBaseUrl);
	const vercelAutomationBypassSecret =
		process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
	const headers = new Headers();
	if (vercelAutomationBypassSecret) {
		headers.set("x-vercel-protection-bypass", vercelAutomationBypassSecret);
	}

	const response = await fetch(checkoutRouteUrl, {
		headers,
		method: "POST",
	});
	const body = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(
			`Hosted checkout route returned ${response.status}. Body: ${JSON.stringify(body)}`,
		);
	}

	if (
		typeof body?.sessionId !== "string" ||
		typeof body?.url !== "string" ||
		!body.url.startsWith("https://checkout.stripe.com/")
	) {
		throw new Error(
			`Hosted checkout route returned an unexpected body: ${JSON.stringify(body)}`,
		);
	}

	return body as { sessionId: string; url: string };
}

async function expireHostedCheckoutRouteSession(
	stripe: Stripe,
	sessionId: string,
) {
	const session = await stripe.checkout.sessions.retrieve(sessionId);

	if (session.status !== "open") {
		return {
			expired: false,
			status: session.status,
		};
	}

	const expiredSession = await stripe.checkout.sessions.expire(sessionId);

	return {
		expired: expiredSession.status === "expired",
		status: expiredSession.status,
	};
}

const { appBaseUrl, expectedMode, expectedWebhookUrl, requireWebhookEndpoint } =
	parseArgs(process.argv.slice(2));
const stripeConfig = getManagedStripeConfigFromEnv(process.env);
const stripe = new Stripe(getNormalizedStripeSecretKey(stripeConfig), {
	apiVersion: apiConfig.stripeApiVersion,
});

await assertManagedStripeEnvReadyForRelease(stripe, stripeConfig, {
	expectedMode,
});
const webhookEndpoint = requireWebhookEndpoint
	? await assertManagedStripeWebhookEndpointReadyForRelease(
			stripe,
			stripeConfig,
			{
				expectedMode,
				expectedWebhookUrl,
			},
		)
	: null;

const checkoutRoute =
	appBaseUrl && appBaseUrl.length > 0
		? await verifyHostedCheckoutRoute(appBaseUrl)
		: null;
const checkoutRouteCleanup = checkoutRoute
	? await expireHostedCheckoutRouteSession(stripe, checkoutRoute.sessionId)
	: null;

console.log(
	JSON.stringify(
		{
			ok: true,
			expectedMode: expectedMode ?? null,
			appBaseUrl,
			webhookEndpoint,
			checkoutRoute,
			checkoutRouteCleanup,
		},
		null,
		2,
	),
);
