"use node";

import Stripe from "stripe";
import { v } from "convex/values";

import { apiConfig, PRODUCT_COURSE_SLUG } from "../config/product";
import { readCheckoutIntentFromMetadata } from "../platform/billing/checkout/checkout-intent";
import { internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { productAccessGrantResultValidator } from "./access/validators";
import { normalizeCheckoutEmail } from "./checkoutClaims";
import { requireConvexEnv } from "./env";

const checkoutClaimActionResultValidator = v.union(
	v.object({
		kind: v.literal("sign_in_required"),
		sessionId: v.string(),
		checkoutEmail: v.optional(v.string()),
		currentAccountEmail: v.optional(v.string()),
	}),
	v.object({
		kind: v.literal("invalid_session"),
		sessionId: v.string(),
	}),
	v.object({
		kind: v.literal("payment_pending"),
		sessionId: v.string(),
		paymentStatus: v.string(),
	}),
	v.object({
		kind: v.literal("missing_checkout_email"),
		sessionId: v.string(),
	}),
	v.object({
		kind: v.literal("wrong_account"),
		sessionId: v.string(),
		checkoutEmail: v.optional(v.string()),
		currentAccountEmail: v.optional(v.string()),
	}),
	v.object({
		kind: v.literal("validated"),
		sessionId: v.string(),
		claimResult: v.union(
			productAccessGrantResultValidator,
			v.object({
				claim: v.literal("claimed"),
				grantResult: productAccessGrantResultValidator,
			}),
			v.object({
				claim: v.literal("already_claimed"),
				grantResult: productAccessGrantResultValidator,
			}),
		),
	}),
);

type CheckoutClaimActionResult =
	| {
			kind: "sign_in_required";
			sessionId: string;
			checkoutEmail?: string;
			currentAccountEmail?: string;
	  }
	| {
			kind: "invalid_session";
			sessionId: string;
	  }
	| {
			kind: "payment_pending";
			sessionId: string;
			paymentStatus: string;
	  }
	| {
			kind: "missing_checkout_email";
			sessionId: string;
	  }
	| {
			kind: "wrong_account";
			sessionId: string;
			checkoutEmail?: string;
			currentAccountEmail?: string;
	  }
	| {
			kind: "validated";
			sessionId: string;
			claimResult: SuccessfulCheckoutClaimResult;
	  };

type SuccessfulCheckoutClaimResult =
	| {
			granted: "inserted" | "patched";
	  }
	| {
			claim: "claimed" | "already_claimed";
			grantResult: {
				granted: "inserted" | "patched";
			};
	  };

const checkoutSessionFulfillmentResultValidator = v.union(
	v.object({
		kind: v.literal("fulfilled"),
		sessionId: v.string(),
		checkoutEmail: v.string(),
		clerkUserId: v.string(),
		clerkUserStatus: v.union(v.literal("exists"), v.literal("created")),
		grantResult: productAccessGrantResultValidator,
	}),
	v.object({
		kind: v.literal("invalid_session"),
		sessionId: v.string(),
	}),
	v.object({
		kind: v.literal("payment_pending"),
		sessionId: v.string(),
		paymentStatus: v.string(),
	}),
	v.object({
		kind: v.literal("missing_checkout_email"),
		sessionId: v.string(),
	}),
	v.object({
		kind: v.literal("clerk_lookup_failed"),
		sessionId: v.string(),
		checkoutEmail: v.string(),
		message: v.string(),
	}),
	v.object({
		kind: v.literal("clerk_create_failed"),
		sessionId: v.string(),
		checkoutEmail: v.string(),
		message: v.string(),
	}),
	v.object({
		kind: v.literal("clerk_user_conflict"),
		sessionId: v.string(),
		checkoutEmail: v.string(),
		matchingUserCount: v.number(),
	}),
	v.object({
		kind: v.literal("grant_failed"),
		sessionId: v.string(),
		checkoutEmail: v.string(),
		clerkUserId: v.string(),
		message: v.string(),
	}),
);

type CheckoutSessionFulfillmentResult =
	| {
			kind: "fulfilled";
			sessionId: string;
			checkoutEmail: string;
			clerkUserId: string;
			clerkUserStatus: "exists" | "created";
			grantResult: {
				granted: "inserted" | "patched";
			};
	  }
	| {
			kind: "invalid_session";
			sessionId: string;
	  }
	| {
			kind: "payment_pending";
			sessionId: string;
			paymentStatus: string;
	  }
	| {
			kind: "missing_checkout_email";
			sessionId: string;
	  }
	| {
			kind: "clerk_lookup_failed";
			sessionId: string;
			checkoutEmail: string;
			message: string;
	  }
	| {
			kind: "clerk_create_failed";
			sessionId: string;
			checkoutEmail: string;
			message: string;
	  }
	| {
			kind: "clerk_user_conflict";
			sessionId: string;
			checkoutEmail: string;
			matchingUserCount: number;
	  }
	| {
			kind: "grant_failed";
			sessionId: string;
			checkoutEmail: string;
			clerkUserId: string;
			message: string;
	  };

type ClerkUserLookupResult =
	| {
			status: "exists";
			clerkUserId: string;
	  }
	| {
			status: "created";
			clerkUserId: string;
	  }
	| {
			status: "conflict";
			matchingUserCount: number;
	  }
	| {
			status: "lookup_failed" | "create_failed";
			message: string;
	  };

type ClerkUserSearchResult =
	| {
			status: "exists";
			clerkUserId: string;
	  }
	| {
			status: "missing";
	  }
	| {
			status: "conflict";
			matchingUserCount: number;
	  }
	| {
			status: "lookup_failed";
			message: string;
	  };

type ClerkEmailAddressPayload = {
	email_address?: unknown;
};

type ClerkUserPayload = {
	id?: unknown;
	email_addresses?: unknown;
};

const checkoutEmailClaimActionResultValidator = v.union(
	v.object({
		kind: v.literal("sign_in_required"),
		checkoutEmail: v.optional(v.string()),
		currentAccountEmail: v.optional(v.string()),
	}),
	v.object({
		kind: v.literal("no_pending_claim"),
	}),
	v.object({
		kind: v.literal("email_not_verified"),
	}),
	v.object({
		kind: v.literal("wrong_account"),
		sessionId: v.string(),
		checkoutEmail: v.optional(v.string()),
		currentAccountEmail: v.optional(v.string()),
	}),
	v.object({
		kind: v.literal("validated"),
		sessionId: v.string(),
		claimResult: v.union(
			productAccessGrantResultValidator,
			v.object({
				claim: v.literal("claimed"),
				grantResult: productAccessGrantResultValidator,
			}),
			v.object({
				claim: v.literal("already_claimed"),
				grantResult: productAccessGrantResultValidator,
			}),
		),
	}),
);

type CheckoutEmailClaimActionResult =
	| {
			kind: "sign_in_required";
			checkoutEmail?: string;
			currentAccountEmail?: string;
	  }
	| {
			kind: "no_pending_claim";
	  }
	| {
			kind: "email_not_verified";
	  }
	| {
			kind: "wrong_account";
			sessionId: string;
			checkoutEmail?: string;
			currentAccountEmail?: string;
	  }
	| {
			kind: "validated";
			sessionId: string;
			claimResult: SuccessfulCheckoutClaimResult;
	  };

function getStripeClient() {
	return new Stripe(requireConvexEnv("STRIPE_SECRET_KEY"), {
		apiVersion: apiConfig.stripeApiVersion,
	});
}

function getCheckoutEmail(session: Stripe.Checkout.Session) {
	const checkoutEmail = session.customer_details?.email;
	return typeof checkoutEmail === "string" && checkoutEmail.length > 0
		? checkoutEmail
		: null;
}

function getCurrentAccountEmail(identity: { email?: unknown }) {
	return typeof identity.email === "string" && identity.email.length > 0
		? identity.email
		: undefined;
}

function getMessageFromClerkPayload(payload: unknown, fallback: string) {
	if (!payload || typeof payload !== "object") {
		return fallback;
	}

	const record = payload as {
		errors?: Array<{ long_message?: unknown; message?: unknown }>;
		message?: unknown;
	};
	const clerkError = record.errors?.[0];
	if (typeof clerkError?.long_message === "string") {
		return clerkError.long_message;
	}

	if (typeof clerkError?.message === "string") {
		return clerkError.message;
	}

	if (typeof record.message === "string") {
		return record.message;
	}

	return fallback;
}

function getExactClerkUsersByEmail(users: unknown, email: string) {
	if (!Array.isArray(users)) {
		return [];
	}

	const normalizedEmail = normalizeCheckoutEmail(email);
	return users.filter((user: ClerkUserPayload) => {
		if (!Array.isArray(user?.email_addresses)) {
			return false;
		}

		return user.email_addresses.some((address: ClerkEmailAddressPayload) => {
			return (
				typeof address?.email_address === "string" &&
				normalizeCheckoutEmail(address.email_address) === normalizedEmail
			);
		});
	});
}

async function fetchClerkJson({
	pathname,
	secretKey,
	searchParams,
	init,
}: {
	pathname: string;
	secretKey: string;
	searchParams?: Record<string, string>;
	init?: RequestInit;
}) {
	const url = new URL(pathname, "https://api.clerk.com");
	for (const [key, value] of Object.entries(searchParams ?? {})) {
		url.searchParams.set(key, value);
	}

	const response = await fetch(url, {
		...init,
		headers: {
			Authorization: `Bearer ${secretKey}`,
			...init?.headers,
		},
	});
	const body = await response.json().catch(() => null);

	return {
		ok: response.ok,
		status: response.status,
		body,
	};
}

async function findCheckoutEmailClerkUser({
	checkoutEmail,
	secretKey,
}: {
	checkoutEmail: string;
	secretKey: string;
}): Promise<ClerkUserSearchResult> {
	const lookup = await fetchClerkJson({
		pathname: "/v1/users",
		secretKey,
		searchParams: {
			limit: "100",
			query: normalizeCheckoutEmail(checkoutEmail),
		},
	});

	if (!lookup.ok) {
		return {
			status: "lookup_failed",
			message: getMessageFromClerkPayload(
				lookup.body,
				`Clerk user lookup failed with status ${lookup.status}.`,
			),
		};
	}

	const exactUsers = getExactClerkUsersByEmail(lookup.body, checkoutEmail);
	if (exactUsers.length > 1) {
		return {
			status: "conflict",
			matchingUserCount: exactUsers.length,
		};
	}

	const existingUser = exactUsers[0] as ClerkUserPayload | undefined;
	if (typeof existingUser?.id === "string") {
		return {
			status: "exists",
			clerkUserId: existingUser.id,
		};
	}

	return {
		status: "missing",
	};
}

async function resolveCheckoutEmailClerkUser({
	checkoutEmail,
	stripeCheckoutSessionId,
}: {
	checkoutEmail: string;
	stripeCheckoutSessionId: string;
}): Promise<ClerkUserLookupResult> {
	const secretKey = requireConvexEnv("CLERK_SECRET_KEY");
	const existingUser = await findCheckoutEmailClerkUser({
		checkoutEmail,
		secretKey,
	});

	if (existingUser.status !== "missing") {
		return existingUser;
	}

	const created = await fetchClerkJson({
		pathname: "/v1/users",
		secretKey,
		init: {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email_address: [normalizeCheckoutEmail(checkoutEmail)],
				skip_password_requirement: true,
				private_metadata: {
					shipBySundayPaidCheckoutFulfillment: {
						checkoutEmail: normalizeCheckoutEmail(checkoutEmail),
						stripeCheckoutSessionId,
						source: "checkoutClaimsActions.fulfillCheckoutSessionByEmail",
						createdAt: new Date().toISOString(),
					},
				},
			}),
		},
	});

	if (!created.ok) {
		const retryLookup = await findCheckoutEmailClerkUser({
			checkoutEmail,
			secretKey,
		});
		if (retryLookup.status === "exists" || retryLookup.status === "conflict") {
			return retryLookup;
		}

		return {
			status: "create_failed",
			message: getMessageFromClerkPayload(
				created.body,
				`Clerk user creation failed with status ${created.status}.`,
			),
		};
	}

	const createdUser = created.body as ClerkUserPayload | null;
	if (typeof createdUser?.id !== "string") {
		return {
			status: "create_failed",
			message: "Clerk user creation did not return a user id.",
		};
	}

	return {
		status: "created",
		clerkUserId: createdUser.id,
	};
}

function getStripeIds(session: Stripe.Checkout.Session) {
	return {
		stripeCustomerId:
			typeof session.customer === "string" ? session.customer : undefined,
		stripePaymentIntentId:
			typeof session.payment_intent === "string"
				? session.payment_intent
				: undefined,
	};
}

function getSessionLegacyFulfillmentFields(session: Stripe.Checkout.Session) {
	const checkoutIntent = readCheckoutIntentFromMetadata(session.metadata);
	return checkoutIntent.fulfillmentTrack === "unspecified"
		? {}
		: { fulfillmentTrack: checkoutIntent.fulfillmentTrack };
}

async function fulfillPaidCheckoutSessionByEmail({
	ctx,
	session,
	stripeEventId,
	stripeEventType,
}: {
	ctx: ActionCtx;
	session: Stripe.Checkout.Session;
	stripeEventId: string;
	stripeEventType: string;
}): Promise<CheckoutSessionFulfillmentResult> {
	if (session.metadata?.courseSlug !== PRODUCT_COURSE_SLUG) {
		return {
			kind: "invalid_session",
			sessionId: session.id,
		};
	}

	if (
		session.payment_status !== "paid" &&
		session.payment_status !== "no_payment_required"
	) {
		return {
			kind: "payment_pending",
			sessionId: session.id,
			paymentStatus: session.payment_status,
		};
	}

	const checkoutEmail = getCheckoutEmail(session);
	if (!checkoutEmail) {
		return {
			kind: "missing_checkout_email",
			sessionId: session.id,
		};
	}

	const { stripeCustomerId, stripePaymentIntentId } = getStripeIds(session);
	const checkoutFulfillment = getSessionLegacyFulfillmentFields(session);
	await ctx.runMutation(
		internal.checkoutClaims.upsertPendingCheckoutClaimFromStripe,
		{
			stripeCheckoutSessionId: session.id,
			checkoutEmail,
			courseSlug: PRODUCT_COURSE_SLUG,
			paymentStatus: session.payment_status,
			stripeCustomerId,
			stripePaymentIntentId,
			...checkoutFulfillment,
			stripeEventId,
			stripeEventType,
		},
	);

	const clerkUser = await resolveCheckoutEmailClerkUser({
		checkoutEmail,
		stripeCheckoutSessionId: session.id,
	});

	switch (clerkUser.status) {
		case "lookup_failed":
			return {
				kind: "clerk_lookup_failed",
				sessionId: session.id,
				checkoutEmail,
				message: clerkUser.message,
			};
		case "create_failed":
			return {
				kind: "clerk_create_failed",
				sessionId: session.id,
				checkoutEmail,
				message: clerkUser.message,
			};
		case "conflict":
			return {
				kind: "clerk_user_conflict",
				sessionId: session.id,
				checkoutEmail,
				matchingUserCount: clerkUser.matchingUserCount,
			};
		case "exists":
		case "created":
			break;
		default:
			return clerkUser satisfies never;
	}

	try {
		const repairResult = await ctx.runMutation(
			internal.checkoutClaims.repairPaidCheckoutClaim,
			{
				stripeCheckoutSessionId: session.id,
				checkoutEmail,
				clerkUserId: clerkUser.clerkUserId,
			},
		);

		switch (repairResult.repair) {
			case "repaired":
			case "already_claimed_by_target":
				return {
					kind: "fulfilled",
					sessionId: session.id,
					checkoutEmail,
					clerkUserId: clerkUser.clerkUserId,
					clerkUserStatus: clerkUser.status,
					grantResult: repairResult.grantResult,
				};
			case "claimed_by_other_user":
			case "missing_claim":
			case "payment_not_paid":
			case "checkout_email_mismatch":
				return {
					kind: "grant_failed",
					sessionId: session.id,
					checkoutEmail,
					clerkUserId: clerkUser.clerkUserId,
					message: `Paid checkout repair failed: ${repairResult.repair}.`,
				};
			default:
				return repairResult satisfies never;
		}
	} catch (error) {
		return {
			kind: "grant_failed",
			sessionId: session.id,
			checkoutEmail,
			clerkUserId: clerkUser.clerkUserId,
			message:
				error instanceof Error
					? error.message
					: "Unable to fulfill paid checkout access.",
		};
	}
}

function mapPendingClaimResult({
	sessionId,
	claimResult,
	checkoutEmail,
	currentAccountEmail,
}: {
	sessionId: string;
	checkoutEmail?: string;
	currentAccountEmail?: string;
	claimResult:
		| {
				claim: "claimed" | "already_claimed";
				grantResult: {
					granted: "inserted" | "patched";
				};
		  }
		| {
				claim:
					| "claimed_by_other_user"
					| "email_mismatch"
					| "email_not_verified"
					| "missing_claim";
		  };
}): CheckoutEmailClaimActionResult {
	switch (claimResult.claim) {
		case "claimed":
		case "already_claimed":
			return {
				kind: "validated" as const,
				sessionId,
				claimResult,
			};
		case "claimed_by_other_user":
		case "email_mismatch":
		case "email_not_verified":
			return {
				kind: "wrong_account" as const,
				sessionId,
				checkoutEmail,
				currentAccountEmail,
			};
		case "missing_claim":
			return {
				kind: "no_pending_claim" as const,
			};
		default:
			return claimResult satisfies never;
	}
}

export const fulfillCheckoutSessionByEmail = internalAction({
	args: {
		sessionId: v.string(),
		stripeEventId: v.string(),
		stripeEventType: v.string(),
	},
	returns: checkoutSessionFulfillmentResultValidator,
	handler: async (ctx, args): Promise<CheckoutSessionFulfillmentResult> => {
		let session: Stripe.Checkout.Session;
		try {
			session = await getStripeClient().checkout.sessions.retrieve(
				args.sessionId,
			);
		} catch (error) {
			if (
				error instanceof Stripe.errors.StripeError &&
				error.type === "StripeInvalidRequestError"
			) {
				return {
					kind: "invalid_session" as const,
					sessionId: args.sessionId,
				};
			}

			throw error;
		}

		return await fulfillPaidCheckoutSessionByEmail({
			ctx,
			session,
			stripeEventId: args.stripeEventId,
			stripeEventType: args.stripeEventType,
		});
	},
});

export const fulfillCheckoutSessionFromSuccessPage = action({
	args: {
		fulfillmentToken: v.string(),
		sessionId: v.string(),
	},
	returns: checkoutSessionFulfillmentResultValidator,
	handler: async (ctx, args): Promise<CheckoutSessionFulfillmentResult> => {
		if (
			args.fulfillmentToken !==
			requireConvexEnv("CHECKOUT_FULFILLMENT_RETRY_SECRET")
		) {
			return {
				kind: "invalid_session" as const,
				sessionId: args.sessionId,
			};
		}

		let session: Stripe.Checkout.Session;
		try {
			session = await getStripeClient().checkout.sessions.retrieve(
				args.sessionId,
			);
		} catch (error) {
			if (
				error instanceof Stripe.errors.StripeError &&
				error.type === "StripeInvalidRequestError"
			) {
				return {
					kind: "invalid_session" as const,
					sessionId: args.sessionId,
				};
			}

			throw error;
		}

		return await fulfillPaidCheckoutSessionByEmail({
			ctx,
			session,
			stripeEventId: `checkout-success:${session.id}`,
			stripeEventType: "checkout.success.fulfillment",
		});
	},
});

export const claimCheckoutSessionForViewer = action({
	args: {
		sessionId: v.string(),
	},
	returns: checkoutClaimActionResultValidator,
	handler: async (ctx, args): Promise<CheckoutClaimActionResult> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return {
				kind: "sign_in_required" as const,
				sessionId: args.sessionId,
			};
		}

		let session: Stripe.Checkout.Session;
		try {
			session = await getStripeClient().checkout.sessions.retrieve(
				args.sessionId,
			);
		} catch (error) {
			if (
				error instanceof Stripe.errors.StripeError &&
				error.type === "StripeInvalidRequestError"
			) {
				return {
					kind: "invalid_session" as const,
					sessionId: args.sessionId,
				};
			}

			throw error;
		}

		if (session.metadata?.courseSlug !== PRODUCT_COURSE_SLUG) {
			return {
				kind: "invalid_session" as const,
				sessionId: session.id,
			};
		}

		if (
			session.payment_status !== "paid" &&
			session.payment_status !== "no_payment_required"
		) {
			return {
				kind: "payment_pending" as const,
				sessionId: session.id,
				paymentStatus: session.payment_status,
			};
		}

		const checkoutSessionClerkUserId =
			session.metadata?.clerkUserId ?? session.client_reference_id ?? null;
		const currentAccountEmail = getCurrentAccountEmail(identity);

		if (checkoutSessionClerkUserId) {
			if (checkoutSessionClerkUserId !== identity.subject) {
				return {
					kind: "wrong_account" as const,
					sessionId: session.id,
					checkoutEmail: getCheckoutEmail(session) ?? undefined,
					currentAccountEmail,
				};
			}

			const grantResult: { granted: "inserted" | "patched" } =
				await ctx.runMutation(internal.access.grantProductAccess, {
					clerkUserId: identity.subject,
					source: "stripe_checkout",
					stripeCustomerId:
						typeof session.customer === "string" ? session.customer : undefined,
					stripeCheckoutSessionId: session.id,
					stripePaymentIntentId:
						typeof session.payment_intent === "string"
							? session.payment_intent
							: undefined,
					...getSessionLegacyFulfillmentFields(session),
				});

			return {
				kind: "validated" as const,
				sessionId: session.id,
				claimResult: grantResult,
			};
		}

		const checkoutEmail = getCheckoutEmail(session);
		if (!checkoutEmail) {
			return {
				kind: "missing_checkout_email" as const,
				sessionId: session.id,
			};
		}

		await ctx.runMutation(
			internal.checkoutClaims.upsertPendingCheckoutClaimFromStripe,
			{
				stripeCheckoutSessionId: session.id,
				checkoutEmail,
				courseSlug: PRODUCT_COURSE_SLUG,
				paymentStatus: session.payment_status,
				stripeCustomerId:
					typeof session.customer === "string" ? session.customer : undefined,
				stripePaymentIntentId:
					typeof session.payment_intent === "string"
						? session.payment_intent
						: undefined,
				...getSessionLegacyFulfillmentFields(session),
				stripeEventId: `claim:${session.id}`,
				stripeEventType: "checkout.success.claim",
			},
		);

		const claimResult:
			| {
					claim: "claimed" | "already_claimed";
					grantResult: {
						granted: "inserted" | "patched";
					};
			  }
			| {
					claim:
						| "claimed_by_other_user"
						| "email_mismatch"
						| "email_not_verified"
						| "missing_claim";
			  } = await ctx.runMutation(
			internal.checkoutClaims.claimPendingCheckoutClaim,
			{
				stripeCheckoutSessionId: session.id,
			},
		);

		switch (claimResult.claim) {
			case "claimed":
			case "already_claimed":
				return {
					kind: "validated" as const,
					sessionId: session.id,
					claimResult,
				};
			case "claimed_by_other_user":
			case "email_mismatch":
			case "email_not_verified":
				return {
					kind: "wrong_account" as const,
					sessionId: session.id,
					checkoutEmail,
					currentAccountEmail,
				};
			case "missing_claim":
				return {
					kind: "invalid_session" as const,
					sessionId: session.id,
				};
			default:
				return claimResult satisfies never;
		}
	},
});

export const claimLatestPendingCheckoutForViewer = action({
	args: {},
	returns: checkoutEmailClaimActionResultValidator,
	handler: async (ctx): Promise<CheckoutEmailClaimActionResult> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return {
				kind: "sign_in_required" as const,
			};
		}

		if (!identity.email || !identity.emailVerified) {
			return {
				kind: "email_not_verified" as const,
			};
		}

		const latestClaim = await ctx.runQuery(
			internal.checkoutClaims.getLatestCheckoutClaimByEmail,
			{
				checkoutEmailNormalized: normalizeCheckoutEmail(identity.email),
			},
		);
		if (!latestClaim) {
			return {
				kind: "no_pending_claim" as const,
			};
		}

		const claimResult:
			| {
					claim: "claimed" | "already_claimed";
					grantResult: {
						granted: "inserted" | "patched";
					};
			  }
			| {
					claim:
						| "claimed_by_other_user"
						| "email_mismatch"
						| "email_not_verified"
						| "missing_claim";
			  } = await ctx.runMutation(
			internal.checkoutClaims.claimPendingCheckoutClaim,
			{
				stripeCheckoutSessionId: latestClaim.stripeCheckoutSessionId,
			},
		);

		return mapPendingClaimResult({
			sessionId: latestClaim.stripeCheckoutSessionId,
			checkoutEmail: latestClaim.checkoutEmail,
			currentAccountEmail: getCurrentAccountEmail(identity),
			claimResult,
		});
	},
});
