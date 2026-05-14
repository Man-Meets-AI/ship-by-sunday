import { v } from "convex/values";

import type {
	BillingEmailDeliveryDoc,
	BillingEmailDeliveryId,
	BillingEntitlementCapability,
	BillingMutationCtx,
	BillingProductKey,
	BillingQueryCtx,
	BillingRefundDoc,
	BillingRefundState,
	ProcessedCalEventDoc,
	ProcessedStripeEventDoc,
	StarterLicenseTermDoc,
	StarterLicenseTermId,
	WorkerSealTeam6BookingDoc,
	WorkerSealTeam6BookingId,
	WorkersBillingCadence,
	WorkersSubscriptionDoc,
	WorkersSubscriptionId,
	WorkersSubscriptionStatus,
} from "./types";
import {
	billingEmailDeliveryStatusValidator,
	billingEmailKindValidator,
	billingEmailRecipientKindValidator,
	billingProductKeyValidator,
	billingProviderEventStatusValidator,
	billingProviderValidator,
	billingRefundAmountKindValidator,
	billingRefundProductStateChangeKindValidator,
	billingRefundStateValidator,
	billingRefundStatusValidator,
	viewerBillingStateReturnValidator,
	workerSealTeam6BookingStatusValidator,
	workerSealTeam6FulfillmentStatusValidator,
	workerSealTeam6IntakeAnswerValidator,
	workerSealTeam6PaymentStatusValidator,
	workersBillingCadenceValidator,
	workersSubscriptionStatusValidator,
} from "./validators";

type IndexQueryBuilder = {
	eq: (fieldName: string, value: unknown) => IndexQueryBuilder;
};

type IndexedQueryResult = {
	unique: () => Promise<Record<string, unknown> | null>;
	collect: () => Promise<Record<string, unknown>[]>;
};

type TableQuery = {
	withIndex: (
		indexName: string,
		callback: (query: IndexQueryBuilder) => IndexQueryBuilder,
	) => IndexedQueryResult;
};

type BillingDatabase = {
	query: (tableName: string) => TableQuery;
	insert: (
		tableName: string,
		value: Record<string, unknown>,
	) => Promise<string>;
	patch: (id: string, value: Record<string, unknown>) => Promise<void>;
};

type BillingDatabaseCtx = {
	db: BillingDatabase;
};

type StarterLicenseAccessInput = Pick<
	StarterLicenseTermDoc,
	"status" | "termStartAt" | "termEndAt" | "refundState"
>;

type WorkersSubscriptionAccessInput = Pick<
	WorkersSubscriptionDoc,
	| "status"
	| "cancelAtPeriodEnd"
	| "currentPeriodEndAt"
	| "accessThroughAt"
	| "terminalFailureAt"
	| "refundState"
>;

type WorkerSealTeam6PaidBookingInput = Pick<
	WorkerSealTeam6BookingDoc,
	"status" | "paymentStatus" | "refundState" | "paidAt"
>;

type WorkerSealTeam6FulfillmentStatus =
	WorkerSealTeam6BookingDoc["fulfillmentStatus"];

export type BillingAttentionState =
	| {
			kind: "none";
	  }
	| {
			kind: "workers_past_due";
			productKey: "workers";
			nondismissible: true;
			accessThroughAt?: number;
			nextPaymentAttemptAt?: number;
			latestInvoiceId?: string;
			paymentRecoveryUrl?: string;
	  };

export type BillingAccessState = {
	hasAccess: boolean;
	accessEndsAt?: number;
};

const currentWorkersSubscriptionStatuses = new Set<WorkersSubscriptionStatus>([
	"active",
	"trialing",
	"past_due",
]);
const billingRefundStateRank: Record<BillingRefundState, number> = {
	none: 0,
	partial_refunded: 1,
	fully_refunded: 2,
};
const terminalBillingEmailDeliveryStatuses = new Set<
	BillingEmailDeliveryDoc["status"]
>(["sent", "skipped"]);
const workerSealTeam6FulfillmentStatusRank: Record<
	WorkerSealTeam6FulfillmentStatus,
	number
> = {
	not_started: 0,
	prep_sent: 1,
	ops_notified: 2,
	fulfilled: 3,
	canceled: 3,
};

function getBillingDatabase(
	ctx: BillingMutationCtx | BillingQueryCtx | unknown,
) {
	return (ctx as BillingDatabaseCtx).db;
}

function queryByIndex(
	db: BillingDatabase,
	tableName: string,
	indexName: string,
	filters: Array<readonly [string, unknown]>,
) {
	return db
		.query(tableName)
		.withIndex(indexName, (query) =>
			filters.reduce(
				(indexQuery, [fieldName, value]) => indexQuery.eq(fieldName, value),
				query,
			),
		);
}

function normalizeBillingEmail(email: string) {
	return email.trim().toLowerCase();
}

function assignDefinedBillingField(
	fields: Record<string, unknown>,
	fieldName: string,
	value: unknown,
) {
	if (value !== undefined) {
		fields[fieldName] = value;
	}
}

function mergeBillingRefundState({
	existingRefundState,
	nextRefundState,
}: {
	existingRefundState?: BillingRefundState;
	nextRefundState?: BillingRefundState;
}) {
	const currentRefundState = existingRefundState ?? "none";
	if (!nextRefundState) {
		return currentRefundState;
	}

	return billingRefundStateRank[nextRefundState] >=
		billingRefundStateRank[currentRefundState]
		? nextRefundState
		: currentRefundState;
}

function mergeWorkerSealTeam6FulfillmentStatus({
	existingFulfillmentStatus,
	nextFulfillmentStatus,
}: {
	existingFulfillmentStatus?: WorkerSealTeam6FulfillmentStatus;
	nextFulfillmentStatus?: WorkerSealTeam6FulfillmentStatus;
}) {
	const currentFulfillmentStatus = existingFulfillmentStatus ?? "not_started";
	if (!nextFulfillmentStatus) {
		return currentFulfillmentStatus;
	}
	if (
		currentFulfillmentStatus === "fulfilled" ||
		currentFulfillmentStatus === "canceled"
	) {
		return currentFulfillmentStatus;
	}

	return workerSealTeam6FulfillmentStatusRank[nextFulfillmentStatus] >=
		workerSealTeam6FulfillmentStatusRank[currentFulfillmentStatus]
		? nextFulfillmentStatus
		: currentFulfillmentStatus;
}

function compareByUpdatedAtThenId(
	left: { _id: string; updatedAt?: number; createdAt?: number },
	right: { _id: string; updatedAt?: number; createdAt?: number },
) {
	const leftUpdatedAt = left.updatedAt ?? 0;
	const rightUpdatedAt = right.updatedAt ?? 0;
	if (leftUpdatedAt !== rightUpdatedAt) {
		return rightUpdatedAt - leftUpdatedAt;
	}

	const leftCreatedAt = left.createdAt ?? 0;
	const rightCreatedAt = right.createdAt ?? 0;
	if (leftCreatedAt !== rightCreatedAt) {
		return rightCreatedAt - leftCreatedAt;
	}

	return right._id.localeCompare(left._id);
}

function addOneCalendarYear(timestamp: number) {
	const date = new Date(timestamp);
	date.setUTCFullYear(date.getUTCFullYear() + 1);
	return date.getTime();
}

export function deriveStarterLicenseAccess(
	licenseTerm: StarterLicenseAccessInput | null,
	now: number,
): BillingAccessState {
	if (!licenseTerm) {
		return { hasAccess: false as const };
	}

	const hasAccess =
		licenseTerm.status === "active" &&
		licenseTerm.refundState !== "fully_refunded" &&
		licenseTerm.termStartAt <= now &&
		licenseTerm.termEndAt > now;

	return {
		hasAccess,
		...(hasAccess ? { accessEndsAt: licenseTerm.termEndAt } : {}),
	};
}

export function selectCurrentStarterLicenseTerm(
	licenseTerms: StarterLicenseTermDoc[],
	now: number,
) {
	return (
		licenseTerms
			.filter(
				(licenseTerm) => deriveStarterLicenseAccess(licenseTerm, now).hasAccess,
			)
			.sort((left, right) => {
				if (left.termEndAt !== right.termEndAt) {
					return right.termEndAt - left.termEndAt;
				}

				return compareByUpdatedAtThenId(left, right);
			})[0] ?? null
	);
}

export function getStarterRenewalTermWindow({
	activeLicenseTerm,
	paidAt,
}: {
	activeLicenseTerm: StarterLicenseAccessInput | null;
	paidAt: number;
}) {
	const canExtendCurrentTerm =
		activeLicenseTerm &&
		deriveStarterLicenseAccess(activeLicenseTerm, paidAt).hasAccess;
	const termStartAt = canExtendCurrentTerm
		? activeLicenseTerm.termEndAt
		: paidAt;

	return {
		termStartAt,
		termEndAt: addOneCalendarYear(termStartAt),
	};
}

export function deriveWorkersSubscriptionAccess(
	subscription: WorkersSubscriptionAccessInput | null,
	now: number,
): BillingAccessState {
	if (!subscription || subscription.refundState === "fully_refunded") {
		return { hasAccess: false as const };
	}

	if (subscription.cancelAtPeriodEnd && subscription.currentPeriodEndAt) {
		if (subscription.currentPeriodEndAt <= now) {
			return { hasAccess: false as const };
		}
	}

	if (subscription.status === "active" || subscription.status === "trialing") {
		return {
			hasAccess: true as const,
			...(subscription.currentPeriodEndAt
				? { accessEndsAt: subscription.currentPeriodEndAt }
				: {}),
		};
	}

	if (subscription.status !== "past_due" || subscription.terminalFailureAt) {
		return { hasAccess: false as const };
	}

	const accessThroughAt =
		subscription.accessThroughAt ?? subscription.currentPeriodEndAt;
	if (!accessThroughAt || accessThroughAt <= now) {
		return { hasAccess: false as const };
	}

	return {
		hasAccess: true as const,
		accessEndsAt: accessThroughAt,
	};
}

export function deriveWorkersBillingAttention(
	subscription:
		| (WorkersSubscriptionAccessInput &
				Pick<
					WorkersSubscriptionDoc,
					| "latestInvoiceId"
					| "paymentRecoveryUrl"
					| "nextPaymentAttemptAt"
					| "accessThroughAt"
					| "currentPeriodEndAt"
				>)
		| null,
): BillingAttentionState {
	if (
		!subscription ||
		subscription.status !== "past_due" ||
		subscription.terminalFailureAt
	) {
		return { kind: "none" };
	}

	return {
		kind: "workers_past_due",
		productKey: "workers",
		nondismissible: true,
		...((subscription.accessThroughAt ?? subscription.currentPeriodEndAt)
			? {
					accessThroughAt:
						subscription.accessThroughAt ?? subscription.currentPeriodEndAt,
				}
			: {}),
		...(subscription.nextPaymentAttemptAt
			? { nextPaymentAttemptAt: subscription.nextPaymentAttemptAt }
			: {}),
		...(subscription.latestInvoiceId
			? { latestInvoiceId: subscription.latestInvoiceId }
			: {}),
		...(subscription.paymentRecoveryUrl
			? { paymentRecoveryUrl: subscription.paymentRecoveryUrl }
			: {}),
	};
}

export function selectCurrentWorkersSubscription(
	subscriptions: WorkersSubscriptionDoc[],
) {
	const currentLikeSubscriptions = subscriptions.filter((subscription) =>
		currentWorkersSubscriptionStatuses.has(subscription.status),
	);

	if (currentLikeSubscriptions.length > 1) {
		throw new Error(
			"Expected at most one current Workers subscription per billing owner. Reconcile Stripe state before continuing.",
		);
	}

	if (currentLikeSubscriptions.length === 1) {
		return currentLikeSubscriptions[0];
	}

	return [...subscriptions].sort(compareByUpdatedAtThenId)[0] ?? null;
}

export function isWorkerSealTeam6PaidBookingReady(
	booking: WorkerSealTeam6PaidBookingInput | null,
) {
	return Boolean(
		booking &&
		booking.paymentStatus === "paid" &&
		booking.paidAt &&
		booking.refundState !== "fully_refunded" &&
		booking.status !== "canceled" &&
		booking.status !== "fulfilled",
	);
}

async function listStarterLicenseTermsForOwner(
	ctx: BillingMutationCtx | BillingQueryCtx,
	ownerClerkUserId: string,
) {
	const db = getBillingDatabase(ctx);
	return (await queryByIndex(
		db,
		"starterLicenseTerms",
		"by_owner_clerk_user_id_and_status_and_term_end_at",
		[["ownerClerkUserId", ownerClerkUserId]],
	).collect()) as StarterLicenseTermDoc[];
}

async function listWorkersSubscriptionsForOwner(
	ctx: BillingMutationCtx | BillingQueryCtx,
	ownerClerkUserId: string,
) {
	const db = getBillingDatabase(ctx);
	return (await queryByIndex(
		db,
		"workersSubscriptions",
		"by_owner_clerk_user_id_and_updated_at",
		[["ownerClerkUserId", ownerClerkUserId]],
	).collect()) as WorkersSubscriptionDoc[];
}

async function listWorkerSealTeam6BookingsForEmail(
	ctx: BillingQueryCtx,
	email: string,
) {
	const db = getBillingDatabase(ctx);
	return (await queryByIndex(
		db,
		"workerSealTeam6Bookings",
		"by_attendee_email_normalized_and_scheduled_start_at",
		[["attendeeEmailNormalized", normalizeBillingEmail(email)]],
	).collect()) as WorkerSealTeam6BookingDoc[];
}

async function upsertStripeCustomerForOwner(
	ctx: BillingMutationCtx,
	args: {
		ownerClerkUserId: string;
		stripeCustomerId: string;
		email?: string;
		now: number;
	},
) {
	const db = getBillingDatabase(ctx);
	const existingCustomer = (await queryByIndex(
		db,
		"stripeCustomers",
		"by_stripe_customer_id",
		[["stripeCustomerId", args.stripeCustomerId]],
	).unique()) as StripeCustomerRecord | null;

	if (existingCustomer) {
		await db.patch(existingCustomer._id, {
			ownerClerkUserId: args.ownerClerkUserId,
			email: args.email ?? existingCustomer.email,
			updatedAt: args.now,
		});
		return;
	}

	await db.insert("stripeCustomers", {
		ownerClerkUserId: args.ownerClerkUserId,
		stripeCustomerId: args.stripeCustomerId,
		email: args.email,
		createdAt: args.now,
		updatedAt: args.now,
	});
}

type StripeCustomerRecord = {
	_id: string;
	email?: string;
};

export const viewerBillingStateArgs = {};
export const viewerBillingStateReturns = viewerBillingStateReturnValidator;

export async function viewerBillingStateHandler(ctx: BillingQueryCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		return { kind: "signed_out" as const };
	}

	const now = Date.now();
	const ownerClerkUserId = identity.subject;
	const [licenseTerms, subscriptions, serviceBookings] = await Promise.all([
		listStarterLicenseTermsForOwner(ctx, ownerClerkUserId),
		listWorkersSubscriptionsForOwner(ctx, ownerClerkUserId),
		identity.email
			? listWorkerSealTeam6BookingsForEmail(ctx, identity.email)
			: Promise.resolve([]),
	]);

	const currentStarterLicense = selectCurrentStarterLicenseTerm(
		licenseTerms,
		now,
	);
	const starterAccess = deriveStarterLicenseAccess(currentStarterLicense, now);
	const currentWorkersSubscription =
		selectCurrentWorkersSubscription(subscriptions);
	const workersAccess = deriveWorkersSubscriptionAccess(
		currentWorkersSubscription,
		now,
	);
	const billingAttention = deriveWorkersBillingAttention(
		currentWorkersSubscription,
	);
	const entitlements = buildViewerEntitlementSummaries({
		starterAccessEndsAt: starterAccess.accessEndsAt,
		starterHasAccess: starterAccess.hasAccess,
		workersAccessEndsAt: workersAccess.accessEndsAt,
		workersHasAccess: workersAccess.hasAccess,
	});

	return {
		kind: "ready" as const,
		ownerClerkUserId,
		starter: {
			hasAccess: starterAccess.hasAccess,
			...(currentStarterLicense
				? { licenseTermId: currentStarterLicense._id }
				: {}),
			...(starterAccess.accessEndsAt
				? { accessEndsAt: starterAccess.accessEndsAt }
				: {}),
			refundState: currentStarterLicense?.refundState ?? "none",
		},
		workers: {
			hasAccess: workersAccess.hasAccess,
			...(currentWorkersSubscription
				? {
						subscriptionId: currentWorkersSubscription._id,
						stripeSubscriptionId:
							currentWorkersSubscription.stripeSubscriptionId,
						status: currentWorkersSubscription.status,
						cadence: currentWorkersSubscription.cadence,
					}
				: {}),
			...(workersAccess.accessEndsAt
				? { accessEndsAt: workersAccess.accessEndsAt }
				: {}),
			billingAttention,
		},
		entitlements,
		serviceBookings: serviceBookings.map((booking) => ({
			bookingId: booking._id,
			calBookingUid: booking.calBookingUid,
			status: booking.status,
			paymentStatus: booking.paymentStatus,
			...(booking.scheduledStartAt
				? { scheduledStartAt: booking.scheduledStartAt }
				: {}),
			...(booking.scheduledEndAt
				? { scheduledEndAt: booking.scheduledEndAt }
				: {}),
		})),
	};
}

function buildViewerEntitlementSummaries({
	starterAccessEndsAt,
	starterHasAccess,
	workersAccessEndsAt,
	workersHasAccess,
}: {
	starterAccessEndsAt?: number;
	starterHasAccess: boolean;
	workersAccessEndsAt?: number;
	workersHasAccess: boolean;
}) {
	const entitlements: Array<{
		capability: BillingEntitlementCapability;
		active: boolean;
		productKey: BillingProductKey;
		accessEndsAt?: number;
	}> = [];

	for (const capability of ["generate_codebase", "tutorials"] as const) {
		entitlements.push({
			capability,
			active: starterHasAccess,
			productKey: "starter",
			...(starterAccessEndsAt ? { accessEndsAt: starterAccessEndsAt } : {}),
		});
	}

	entitlements.push({
		capability: "worker",
		active: workersHasAccess,
		productKey: "workers",
		...(workersAccessEndsAt ? { accessEndsAt: workersAccessEndsAt } : {}),
	});

	return entitlements;
}

export const syncStarterLicenseTermArgs = {
	ownerClerkUserId: v.string(),
	stripeCustomerId: v.optional(v.string()),
	customerEmail: v.optional(v.string()),
	stripeCheckoutSessionId: v.string(),
	stripePaymentIntentId: v.optional(v.string()),
	purchasedAt: v.number(),
	refundState: v.optional(billingRefundStateValidator),
};
export const syncStarterLicenseTermReturns = v.object({
	licenseTermId: v.id("starterLicenseTerms"),
	upserted: v.union(v.literal("inserted"), v.literal("patched")),
	termStartAt: v.number(),
	termEndAt: v.number(),
});

export async function syncStarterLicenseTermHandler(
	ctx: BillingMutationCtx,
	args: {
		ownerClerkUserId: string;
		stripeCustomerId?: string;
		customerEmail?: string;
		stripeCheckoutSessionId: string;
		stripePaymentIntentId?: string;
		purchasedAt: number;
		refundState?: BillingRefundState;
	},
) {
	const db = getBillingDatabase(ctx);
	const now = Date.now();
	if (args.stripeCustomerId) {
		await upsertStripeCustomerForOwner(ctx, {
			ownerClerkUserId: args.ownerClerkUserId,
			stripeCustomerId: args.stripeCustomerId,
			email: args.customerEmail,
			now,
		});
	}

	const existingLicenseTerm = (await queryByIndex(
		db,
		"starterLicenseTerms",
		"by_stripe_checkout_session_id",
		[["stripeCheckoutSessionId", args.stripeCheckoutSessionId]],
	).unique()) as StarterLicenseTermDoc | null;

	if (existingLicenseTerm) {
		const licenseTermPatch: Record<string, unknown> = {
			ownerClerkUserId: args.ownerClerkUserId,
			purchasedAt: args.purchasedAt,
			refundState: mergeBillingRefundState({
				existingRefundState: existingLicenseTerm.refundState,
				nextRefundState: args.refundState,
			}),
			updatedAt: now,
		};
		assignDefinedBillingField(
			licenseTermPatch,
			"stripeCustomerId",
			args.stripeCustomerId,
		);
		assignDefinedBillingField(
			licenseTermPatch,
			"stripePaymentIntentId",
			args.stripePaymentIntentId,
		);
		await db.patch(existingLicenseTerm._id, licenseTermPatch);

		const existingTermWindow = {
			termStartAt: existingLicenseTerm.termStartAt,
			termEndAt: existingLicenseTerm.termEndAt,
		};

		return {
			licenseTermId: existingLicenseTerm._id,
			upserted: "patched" as const,
			...existingTermWindow,
		};
	}

	const activeLicenseTerm = selectCurrentStarterLicenseTerm(
		await listStarterLicenseTermsForOwner(ctx, args.ownerClerkUserId),
		args.purchasedAt,
	);
	const termWindow = getStarterRenewalTermWindow({
		activeLicenseTerm,
		paidAt: args.purchasedAt,
	});
	const licenseTermFields: Record<string, unknown> = {
		ownerClerkUserId: args.ownerClerkUserId,
		status: "active",
		stripeCheckoutSessionId: args.stripeCheckoutSessionId,
		purchasedAt: args.purchasedAt,
		termStartAt: termWindow.termStartAt,
		termEndAt: termWindow.termEndAt,
		refundState: args.refundState ?? "none",
		createdAt: now,
		updatedAt: now,
	};
	assignDefinedBillingField(
		licenseTermFields,
		"stripeCustomerId",
		args.stripeCustomerId,
	);
	assignDefinedBillingField(
		licenseTermFields,
		"stripePaymentIntentId",
		args.stripePaymentIntentId,
	);
	assignDefinedBillingField(
		licenseTermFields,
		"renewalOfLicenseTermId",
		activeLicenseTerm?._id,
	);

	const licenseTermId = (await db.insert(
		"starterLicenseTerms",
		licenseTermFields,
	)) as StarterLicenseTermId;

	return {
		licenseTermId,
		upserted: "inserted" as const,
		...termWindow,
	};
}

export const syncWorkersSubscriptionArgs = {
	ownerClerkUserId: v.string(),
	stripeCustomerId: v.string(),
	customerEmail: v.optional(v.string()),
	stripeSubscriptionId: v.string(),
	stripePriceId: v.optional(v.string()),
	stripeProductId: v.optional(v.string()),
	cadence: workersBillingCadenceValidator,
	status: workersSubscriptionStatusValidator,
	cancelAtPeriodEnd: v.optional(v.boolean()),
	currentPeriodStartAt: v.optional(v.number()),
	currentPeriodEndAt: v.optional(v.number()),
	accessThroughAt: v.optional(v.number()),
	latestInvoiceId: v.optional(v.string()),
	latestInvoiceHostedUrl: v.optional(v.string()),
	paymentRecoveryUrl: v.optional(v.string()),
	failedPaymentStartedAt: v.optional(v.number()),
	failedPaymentAttemptCount: v.optional(v.number()),
	nextPaymentAttemptAt: v.optional(v.number()),
	recoveredFromPastDueAt: v.optional(v.number()),
	terminalFailureAt: v.optional(v.number()),
	refundState: v.optional(billingRefundStateValidator),
};
export const syncWorkersSubscriptionReturns = v.object({
	subscriptionId: v.id("workersSubscriptions"),
	upserted: v.union(v.literal("inserted"), v.literal("patched")),
});

export async function syncWorkersSubscriptionHandler(
	ctx: BillingMutationCtx,
	args: {
		ownerClerkUserId: string;
		stripeCustomerId: string;
		customerEmail?: string;
		stripeSubscriptionId: string;
		stripePriceId?: string;
		stripeProductId?: string;
		cadence: WorkersBillingCadence;
		status: WorkersSubscriptionStatus;
		cancelAtPeriodEnd?: boolean;
		currentPeriodStartAt?: number;
		currentPeriodEndAt?: number;
		accessThroughAt?: number;
		latestInvoiceId?: string;
		latestInvoiceHostedUrl?: string;
		paymentRecoveryUrl?: string;
		failedPaymentStartedAt?: number;
		failedPaymentAttemptCount?: number;
		nextPaymentAttemptAt?: number;
		recoveredFromPastDueAt?: number;
		terminalFailureAt?: number;
		refundState?: BillingRefundState;
	},
) {
	const db = getBillingDatabase(ctx);
	const now = Date.now();
	await upsertStripeCustomerForOwner(ctx, {
		ownerClerkUserId: args.ownerClerkUserId,
		stripeCustomerId: args.stripeCustomerId,
		email: args.customerEmail,
		now,
	});

	const existingSubscription = (await queryByIndex(
		db,
		"workersSubscriptions",
		"by_stripe_subscription_id",
		[["stripeSubscriptionId", args.stripeSubscriptionId]],
	).unique()) as WorkersSubscriptionDoc | null;

	const subscriptionFields: Record<string, unknown> = {
		ownerClerkUserId: args.ownerClerkUserId,
		stripeCustomerId: args.stripeCustomerId,
		stripeSubscriptionId: args.stripeSubscriptionId,
		cadence: args.cadence,
		status: args.status,
		cancelAtPeriodEnd:
			args.cancelAtPeriodEnd ??
			existingSubscription?.cancelAtPeriodEnd ??
			false,
		refundState: mergeBillingRefundState({
			existingRefundState: existingSubscription?.refundState,
			nextRefundState: args.refundState,
		}),
		updatedAt: now,
	};
	assignDefinedBillingField(
		subscriptionFields,
		"stripePriceId",
		args.stripePriceId,
	);
	assignDefinedBillingField(
		subscriptionFields,
		"stripeProductId",
		args.stripeProductId,
	);
	assignDefinedBillingField(
		subscriptionFields,
		"currentPeriodStartAt",
		args.currentPeriodStartAt,
	);
	assignDefinedBillingField(
		subscriptionFields,
		"currentPeriodEndAt",
		args.currentPeriodEndAt,
	);
	assignDefinedBillingField(
		subscriptionFields,
		"accessThroughAt",
		args.accessThroughAt,
	);
	assignDefinedBillingField(
		subscriptionFields,
		"latestInvoiceId",
		args.latestInvoiceId,
	);
	assignDefinedBillingField(
		subscriptionFields,
		"latestInvoiceHostedUrl",
		args.latestInvoiceHostedUrl,
	);
	assignDefinedBillingField(
		subscriptionFields,
		"paymentRecoveryUrl",
		args.paymentRecoveryUrl,
	);
	assignDefinedBillingField(
		subscriptionFields,
		"failedPaymentStartedAt",
		args.failedPaymentStartedAt,
	);
	assignDefinedBillingField(
		subscriptionFields,
		"failedPaymentAttemptCount",
		args.failedPaymentAttemptCount,
	);
	assignDefinedBillingField(
		subscriptionFields,
		"nextPaymentAttemptAt",
		args.nextPaymentAttemptAt,
	);
	assignDefinedBillingField(
		subscriptionFields,
		"recoveredFromPastDueAt",
		args.recoveredFromPastDueAt,
	);
	assignDefinedBillingField(
		subscriptionFields,
		"terminalFailureAt",
		args.terminalFailureAt,
	);

	if (existingSubscription) {
		await db.patch(existingSubscription._id, subscriptionFields);
		return {
			subscriptionId: existingSubscription._id,
			upserted: "patched" as const,
		};
	}

	const subscriptionId = (await db.insert("workersSubscriptions", {
		...subscriptionFields,
		createdAt: now,
	})) as WorkersSubscriptionId;

	return {
		subscriptionId,
		upserted: "inserted" as const,
	};
}

export const recordProcessedStripeEventArgs = {
	stripeEventId: v.string(),
	eventType: v.string(),
	status: billingProviderEventStatusValidator,
	ownerClerkUserId: v.optional(v.string()),
	stripeObjectId: v.optional(v.string()),
	errorMessage: v.optional(v.string()),
};
export const recordProcessedStripeEventReturns = v.object({
	eventId: v.id("processedStripeEvents"),
	recorded: v.union(v.literal("inserted"), v.literal("duplicate")),
});

export async function recordProcessedStripeEventHandler(
	ctx: BillingMutationCtx,
	args: {
		stripeEventId: string;
		eventType: string;
		status: "applied" | "skipped" | "failed";
		ownerClerkUserId?: string;
		stripeObjectId?: string;
		errorMessage?: string;
	},
) {
	const db = getBillingDatabase(ctx);
	const existingEvent = (await queryByIndex(
		db,
		"processedStripeEvents",
		"by_stripe_event_id",
		[["stripeEventId", args.stripeEventId]],
	).unique()) as ProcessedStripeEventDoc | null;
	if (existingEvent) {
		return {
			eventId: existingEvent._id,
			recorded: "duplicate" as const,
		};
	}

	const now = Date.now();
	const eventId = await db.insert("processedStripeEvents", {
		stripeEventId: args.stripeEventId,
		eventType: args.eventType,
		status: args.status,
		ownerClerkUserId: args.ownerClerkUserId,
		stripeObjectId: args.stripeObjectId,
		errorMessage: args.errorMessage,
		receivedAt: now,
		processedAt: args.status === "applied" ? now : undefined,
		updatedAt: now,
	});

	return {
		eventId: eventId as ProcessedStripeEventDoc["_id"],
		recorded: "inserted" as const,
	};
}

export const recordProcessedCalEventArgs = {
	calEventId: v.string(),
	eventType: v.string(),
	status: billingProviderEventStatusValidator,
	ownerClerkUserId: v.optional(v.string()),
	calBookingUid: v.optional(v.string()),
	errorMessage: v.optional(v.string()),
};
export const recordProcessedCalEventReturns = v.object({
	eventId: v.id("processedCalEvents"),
	recorded: v.union(v.literal("inserted"), v.literal("duplicate")),
});

export async function recordProcessedCalEventHandler(
	ctx: BillingMutationCtx,
	args: {
		calEventId: string;
		eventType: string;
		status: "applied" | "skipped" | "failed";
		ownerClerkUserId?: string;
		calBookingUid?: string;
		errorMessage?: string;
	},
) {
	const db = getBillingDatabase(ctx);
	const existingEvent = (await queryByIndex(
		db,
		"processedCalEvents",
		"by_cal_event_id",
		[["calEventId", args.calEventId]],
	).unique()) as ProcessedCalEventDoc | null;
	if (existingEvent) {
		return {
			eventId: existingEvent._id,
			recorded: "duplicate" as const,
		};
	}

	const now = Date.now();
	const eventId = await db.insert("processedCalEvents", {
		calEventId: args.calEventId,
		eventType: args.eventType,
		status: args.status,
		ownerClerkUserId: args.ownerClerkUserId,
		calBookingUid: args.calBookingUid,
		errorMessage: args.errorMessage,
		receivedAt: now,
		processedAt: args.status === "applied" ? now : undefined,
		updatedAt: now,
	});

	return {
		eventId: eventId as ProcessedCalEventDoc["_id"],
		recorded: "inserted" as const,
	};
}

export const upsertBillingRefundArgs = {
	provider: billingProviderValidator,
	providerRefundId: v.string(),
	productKey: billingProductKeyValidator,
	ownerClerkUserId: v.optional(v.string()),
	stripeCustomerId: v.optional(v.string()),
	stripePaymentIntentId: v.optional(v.string()),
	stripeChargeId: v.optional(v.string()),
	calBookingUid: v.optional(v.string()),
	amount: v.number(),
	currency: v.string(),
	amountKind: billingRefundAmountKindValidator,
	status: billingRefundStatusValidator,
	productStateChange: v.boolean(),
	productStateChangeKind: billingRefundProductStateChangeKindValidator,
	reason: v.optional(v.string()),
};
export const upsertBillingRefundReturns = v.object({
	refundId: v.id("billingRefunds"),
	upserted: v.union(v.literal("inserted"), v.literal("patched")),
});

export async function upsertBillingRefundHandler(
	ctx: BillingMutationCtx,
	args: {
		provider: "stripe" | "cal_com";
		providerRefundId: string;
		productKey: BillingProductKey;
		ownerClerkUserId?: string;
		stripeCustomerId?: string;
		stripePaymentIntentId?: string;
		stripeChargeId?: string;
		calBookingUid?: string;
		amount: number;
		currency: string;
		amountKind: "full" | "partial";
		status: "pending" | "succeeded" | "failed" | "canceled";
		productStateChange: boolean;
		productStateChangeKind:
			| "none"
			| "access_removed"
			| "future_fulfillment_canceled"
			| "fulfilled_service_recorded";
		reason?: string;
	},
) {
	const db = getBillingDatabase(ctx);
	const existingRefund = (await queryByIndex(
		db,
		"billingRefunds",
		"by_provider_and_provider_refund_id",
		[
			["provider", args.provider],
			["providerRefundId", args.providerRefundId],
		],
	).unique()) as BillingRefundDoc | null;
	const now = Date.now();
	const refundFields = {
		provider: args.provider,
		providerRefundId: args.providerRefundId,
		productKey: args.productKey,
		ownerClerkUserId: args.ownerClerkUserId,
		stripeCustomerId: args.stripeCustomerId,
		stripePaymentIntentId: args.stripePaymentIntentId,
		stripeChargeId: args.stripeChargeId,
		calBookingUid: args.calBookingUid,
		amount: args.amount,
		currency: args.currency,
		amountKind: args.amountKind,
		status: args.status,
		productStateChange: args.productStateChange,
		productStateChangeKind: args.productStateChangeKind,
		reason: args.reason,
		updatedAt: now,
	};

	if (existingRefund) {
		await db.patch(existingRefund._id, refundFields);
		return {
			refundId: existingRefund._id,
			upserted: "patched" as const,
		};
	}

	const refundId = (await db.insert("billingRefunds", {
		...refundFields,
		createdAt: now,
	})) as BillingRefundDoc["_id"];

	return {
		refundId,
		upserted: "inserted" as const,
	};
}

export const upsertBillingEmailDeliveryArgs = {
	idempotencyKey: v.string(),
	emailKind: billingEmailKindValidator,
	productKey: billingProductKeyValidator,
	recipientKind: billingEmailRecipientKindValidator,
	recipientEmail: v.optional(v.string()),
	ownerClerkUserId: v.optional(v.string()),
	providerMessageId: v.optional(v.string()),
	status: billingEmailDeliveryStatusValidator,
	skippedReason: v.optional(v.string()),
	lastError: v.optional(v.string()),
	sentAt: v.optional(v.number()),
};
export const upsertBillingEmailDeliveryReturns = v.object({
	deliveryId: v.id("billingEmailDeliveries"),
	upserted: v.union(v.literal("inserted"), v.literal("patched")),
});

export async function upsertBillingEmailDeliveryHandler(
	ctx: BillingMutationCtx,
	args: {
		idempotencyKey: string;
		emailKind: BillingEmailDeliveryDoc["emailKind"];
		productKey: BillingProductKey;
		recipientKind: BillingEmailDeliveryDoc["recipientKind"];
		recipientEmail?: string;
		ownerClerkUserId?: string;
		providerMessageId?: string;
		status: BillingEmailDeliveryDoc["status"];
		skippedReason?: string;
		lastError?: string;
		sentAt?: number;
	},
) {
	const db = getBillingDatabase(ctx);
	const existingDelivery = (await queryByIndex(
		db,
		"billingEmailDeliveries",
		"by_idempotency_key",
		[["idempotencyKey", args.idempotencyKey]],
	).unique()) as BillingEmailDeliveryDoc | null;
	const now = Date.now();

	if (
		existingDelivery &&
		terminalBillingEmailDeliveryStatuses.has(existingDelivery.status)
	) {
		return {
			deliveryId: existingDelivery._id,
			upserted: "patched" as const,
		};
	}

	const deliveryFields: Record<string, unknown> = {
		idempotencyKey: args.idempotencyKey,
		emailKind: args.emailKind,
		productKey: args.productKey,
		recipientKind: args.recipientKind,
		status: args.status,
		updatedAt: now,
	};
	assignDefinedBillingField(
		deliveryFields,
		"recipientEmail",
		args.recipientEmail,
	);
	assignDefinedBillingField(
		deliveryFields,
		"ownerClerkUserId",
		args.ownerClerkUserId,
	);
	assignDefinedBillingField(
		deliveryFields,
		"providerMessageId",
		args.providerMessageId,
	);
	assignDefinedBillingField(
		deliveryFields,
		"skippedReason",
		args.skippedReason,
	);
	assignDefinedBillingField(deliveryFields, "lastError", args.lastError);
	assignDefinedBillingField(deliveryFields, "sentAt", args.sentAt);

	if (existingDelivery) {
		await db.patch(existingDelivery._id, deliveryFields);
		return {
			deliveryId: existingDelivery._id,
			upserted: "patched" as const,
		};
	}

	const deliveryId = (await db.insert("billingEmailDeliveries", {
		...deliveryFields,
		createdAt: now,
	})) as BillingEmailDeliveryId;

	return {
		deliveryId,
		upserted: "inserted" as const,
	};
}

export const syncWorkerSealTeam6BookingArgs = {
	calBookingUid: v.string(),
	calEventTypeId: v.optional(v.string()),
	stripeCustomerId: v.optional(v.string()),
	stripePaymentIntentId: v.optional(v.string()),
	status: workerSealTeam6BookingStatusValidator,
	paymentStatus: workerSealTeam6PaymentStatusValidator,
	refundState: v.optional(billingRefundStateValidator),
	fulfillmentStatus: v.optional(workerSealTeam6FulfillmentStatusValidator),
	attendeeEmail: v.string(),
	attendeeName: v.optional(v.string()),
	attendeeTimeZone: v.optional(v.string()),
	scheduledStartAt: v.optional(v.number()),
	scheduledEndAt: v.optional(v.number()),
	rescheduleUrl: v.optional(v.string()),
	cancelUrl: v.optional(v.string()),
	calBookingUrl: v.optional(v.string()),
	intakeAnswers: v.optional(v.array(workerSealTeam6IntakeAnswerValidator)),
	paidAt: v.optional(v.number()),
	canceledAt: v.optional(v.number()),
	fulfilledAt: v.optional(v.number()),
	customerPrepEmailDeliveryId: v.optional(v.id("billingEmailDeliveries")),
	opsEmailDeliveryId: v.optional(v.id("billingEmailDeliveries")),
};
export const syncWorkerSealTeam6BookingReturns = v.object({
	bookingId: v.id("workerSealTeam6Bookings"),
	upserted: v.union(v.literal("inserted"), v.literal("patched")),
	paidBookingReady: v.boolean(),
});

export async function syncWorkerSealTeam6BookingHandler(
	ctx: BillingMutationCtx,
	args: {
		calBookingUid: string;
		calEventTypeId?: string;
		stripeCustomerId?: string;
		stripePaymentIntentId?: string;
		status: WorkerSealTeam6BookingDoc["status"];
		paymentStatus: WorkerSealTeam6BookingDoc["paymentStatus"];
		refundState?: BillingRefundState;
		fulfillmentStatus?: WorkerSealTeam6BookingDoc["fulfillmentStatus"];
		attendeeEmail: string;
		attendeeName?: string;
		attendeeTimeZone?: string;
		scheduledStartAt?: number;
		scheduledEndAt?: number;
		rescheduleUrl?: string;
		cancelUrl?: string;
		calBookingUrl?: string;
		intakeAnswers?: Array<{ label: string; value: string }>;
		paidAt?: number;
		canceledAt?: number;
		fulfilledAt?: number;
		customerPrepEmailDeliveryId?: BillingEmailDeliveryId;
		opsEmailDeliveryId?: BillingEmailDeliveryId;
	},
) {
	const db = getBillingDatabase(ctx);
	const existingBooking = (await queryByIndex(
		db,
		"workerSealTeam6Bookings",
		"by_cal_booking_uid",
		[["calBookingUid", args.calBookingUid]],
	).unique()) as WorkerSealTeam6BookingDoc | null;
	const now = Date.now();
	const refundState = mergeBillingRefundState({
		existingRefundState: existingBooking?.refundState,
		nextRefundState: args.refundState,
	});
	const fulfillmentStatus = mergeWorkerSealTeam6FulfillmentStatus({
		existingFulfillmentStatus: existingBooking?.fulfillmentStatus,
		nextFulfillmentStatus: args.fulfillmentStatus,
	});
	const bookingFields: Record<string, unknown> = {
		calBookingUid: args.calBookingUid,
		status: args.status,
		paymentStatus: args.paymentStatus,
		refundState,
		fulfillmentStatus,
		attendeeEmail: args.attendeeEmail,
		attendeeEmailNormalized: normalizeBillingEmail(args.attendeeEmail),
		updatedAt: now,
	};
	assignDefinedBillingField(
		bookingFields,
		"calEventTypeId",
		args.calEventTypeId,
	);
	assignDefinedBillingField(
		bookingFields,
		"stripeCustomerId",
		args.stripeCustomerId,
	);
	assignDefinedBillingField(
		bookingFields,
		"stripePaymentIntentId",
		args.stripePaymentIntentId,
	);
	assignDefinedBillingField(bookingFields, "attendeeName", args.attendeeName);
	assignDefinedBillingField(
		bookingFields,
		"attendeeTimeZone",
		args.attendeeTimeZone,
	);
	assignDefinedBillingField(
		bookingFields,
		"scheduledStartAt",
		args.scheduledStartAt,
	);
	assignDefinedBillingField(
		bookingFields,
		"scheduledEndAt",
		args.scheduledEndAt,
	);
	assignDefinedBillingField(bookingFields, "rescheduleUrl", args.rescheduleUrl);
	assignDefinedBillingField(bookingFields, "cancelUrl", args.cancelUrl);
	assignDefinedBillingField(bookingFields, "calBookingUrl", args.calBookingUrl);
	assignDefinedBillingField(bookingFields, "intakeAnswers", args.intakeAnswers);
	assignDefinedBillingField(bookingFields, "paidAt", args.paidAt);
	assignDefinedBillingField(bookingFields, "canceledAt", args.canceledAt);
	assignDefinedBillingField(bookingFields, "fulfilledAt", args.fulfilledAt);
	assignDefinedBillingField(
		bookingFields,
		"customerPrepEmailDeliveryId",
		args.customerPrepEmailDeliveryId,
	);
	assignDefinedBillingField(
		bookingFields,
		"opsEmailDeliveryId",
		args.opsEmailDeliveryId,
	);

	if (existingBooking) {
		await db.patch(existingBooking._id, bookingFields);
		return {
			bookingId: existingBooking._id,
			upserted: "patched" as const,
			paidBookingReady: isWorkerSealTeam6PaidBookingReady({
				status: args.status,
				paymentStatus: args.paymentStatus,
				refundState,
				paidAt: args.paidAt ?? existingBooking.paidAt,
			}),
		};
	}

	const bookingId = (await db.insert("workerSealTeam6Bookings", {
		...bookingFields,
		createdAt: now,
	})) as WorkerSealTeam6BookingId;

	return {
		bookingId,
		upserted: "inserted" as const,
		paidBookingReady: isWorkerSealTeam6PaidBookingReady({
			status: args.status,
			paymentStatus: args.paymentStatus,
			refundState,
			paidAt: args.paidAt,
		}),
	};
}
