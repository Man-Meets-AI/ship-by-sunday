import {
	assertManagedStripeEnvReadyForRelease,
	getManagedStripeConfigFromEnv,
	getNormalizedStripeSecretKey,
	type StripeModeLabel,
} from "@/platform/billing/managed-stripe-config";
import Stripe from "stripe";

import { apiConfig } from "@/config/product";

function parseArgs(argv: string[]) {
	let appBaseUrl: string | null = null;
	let expectedMode: StripeModeLabel | undefined;

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
		}
	}

	return {
		appBaseUrl,
		expectedMode,
	};
}

async function verifyHostedCheckoutRoute(appBaseUrl: string) {
	const response = await fetch(new URL("/api/stripe/checkout", appBaseUrl), {
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

const { appBaseUrl, expectedMode } = parseArgs(process.argv.slice(2));
const stripeConfig = getManagedStripeConfigFromEnv(process.env);
const stripe = new Stripe(getNormalizedStripeSecretKey(stripeConfig), {
	apiVersion: apiConfig.stripeApiVersion,
});

await assertManagedStripeEnvReadyForRelease(stripe, stripeConfig, {
	expectedMode,
});

const checkoutRoute =
	appBaseUrl && appBaseUrl.length > 0
		? await verifyHostedCheckoutRoute(appBaseUrl)
		: null;

console.log(
	JSON.stringify(
		{
			ok: true,
			expectedMode: expectedMode ?? null,
			appBaseUrl,
			checkoutRoute,
		},
		null,
		2,
	),
);
