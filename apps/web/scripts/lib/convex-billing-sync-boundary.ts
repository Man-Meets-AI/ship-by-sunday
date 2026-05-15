import type { FunctionReference } from "convex/server";

export type ConvexBillingCustomerOwner = {
	readonly email?: string;
	readonly ownerClerkUserId: string;
} | null;

export type ConvexBillingSyncBoundaryArgs = {
	readonly convexWebhookMutationSecret: string;
	readonly stripeCustomerId: string;
};

export type ConvexBillingSyncBoundaryFunctionReference = FunctionReference<
	"query",
	"public",
	ConvexBillingSyncBoundaryArgs,
	ConvexBillingCustomerOwner
>;

export type ConvexBillingSyncBoundaryFetchQuery = (
	functionReference: ConvexBillingSyncBoundaryFunctionReference,
	args: ConvexBillingSyncBoundaryArgs,
) => Promise<ConvexBillingCustomerOwner>;

type ConvexBillingSyncBoundaryCheckInput = {
	readonly env?: ConvexWebhookMutationSecretEnv;
	readonly fetchQuery: ConvexBillingSyncBoundaryFetchQuery;
	readonly functionReference: ConvexBillingSyncBoundaryFunctionReference;
};

type ConvexWebhookMutationSecretEnv = Readonly<
	Record<string, string | undefined>
>;

const sentinelStripeCustomerId = "cus_billing_sync_preflight_missing_customer";

export function requireConvexWebhookMutationSecretForPreflight(
	env: ConvexWebhookMutationSecretEnv = process.env,
) {
	const secret = env.CONVEX_WEBHOOK_MUTATION_SECRET?.trim();
	if (!secret) {
		throw new Error(
			"Missing required environment variable: CONVEX_WEBHOOK_MUTATION_SECRET",
		);
	}

	if (secret.length < 32) {
		throw new Error(
			"CONVEX_WEBHOOK_MUTATION_SECRET must be at least 32 characters.",
		);
	}

	return secret;
}

export async function assertConvexBillingSyncBoundaryReady({
	env = process.env,
	fetchQuery,
	functionReference,
}: ConvexBillingSyncBoundaryCheckInput) {
	const convexWebhookMutationSecret =
		requireConvexWebhookMutationSecretForPreflight(env);
	const lookupResult = await fetchQuery(functionReference, {
		convexWebhookMutationSecret,
		stripeCustomerId: sentinelStripeCustomerId,
	});

	if (lookupResult !== null) {
		throw new Error(
			"Convex billing sync boundary preflight expected a null lookup for the sentinel Stripe customer.",
		);
	}

	return {
		ok: true,
		functionName: "api.billing.lookupStripeCustomerOwnerFromServer",
		stripeCustomerId: sentinelStripeCustomerId,
	};
}
