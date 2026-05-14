import {
	deriveStarterLicenseAccess,
	deriveWorkersBillingAttention,
	deriveWorkersSubscriptionAccess,
	getStarterRenewalTermWindow,
	isWorkerSealTeam6PaidBookingReady,
	recordProcessedStripeEventHandler,
	syncStarterLicenseTermHandler,
	syncWorkerSealTeam6BookingHandler,
	upsertBillingEmailDeliveryHandler,
} from "@/convex/billing/model";

type BillingTableName =
	| "stripeCustomers"
	| "starterLicenseTerms"
	| "workersSubscriptions"
	| "processedStripeEvents"
	| "billingEmailDeliveries"
	| "workerSealTeam6Bookings";

type BillingRecord = Record<string, unknown> & {
	_id: string;
};

type BillingTables = Record<BillingTableName, BillingRecord[]>;

type QueryFilter = {
	fieldName: string;
	value: unknown;
};

function createBillingMutationCtx(tables: Partial<BillingTables> = {}) {
	const state: BillingTables = {
		stripeCustomers: [...(tables.stripeCustomers ?? [])],
		starterLicenseTerms: [...(tables.starterLicenseTerms ?? [])],
		workersSubscriptions: [...(tables.workersSubscriptions ?? [])],
		processedStripeEvents: [...(tables.processedStripeEvents ?? [])],
		billingEmailDeliveries: [...(tables.billingEmailDeliveries ?? [])],
		workerSealTeam6Bookings: [...(tables.workerSealTeam6Bookings ?? [])],
	};
	let idCounter = 1;

	const db = {
		query: (tableName: BillingTableName) => ({
			withIndex: (
				_indexName: string,
				callback: (query: {
					eq: (fieldName: string, value: unknown) => unknown;
				}) => unknown,
			) => {
				const filters: QueryFilter[] = [];
				const queryBuilder = {
					eq: (fieldName: string, value: unknown) => {
						filters.push({ fieldName, value });
						return queryBuilder;
					},
				};
				callback(queryBuilder);
				const matches = state[tableName].filter((record) =>
					filters.every((filter) => record[filter.fieldName] === filter.value),
				);

				return {
					unique: async () => matches[0] ?? null,
					collect: async () => [...matches],
				};
			},
		}),
		insert: async (
			tableName: BillingTableName,
			value: Record<string, unknown>,
		) => {
			const record = {
				_id: `${tableName}_${idCounter}`,
				...value,
			};
			idCounter += 1;
			state[tableName].push(record);
			return record._id;
		},
		patch: async (id: string, value: Record<string, unknown>) => {
			for (const tableRecords of Object.values(state)) {
				const record = tableRecords.find((candidate) => candidate._id === id);
				if (record) {
					Object.assign(record, value);
					return;
				}
			}
			throw new Error(`Missing billing test record ${id}`);
		},
	};

	return {
		ctx: { db },
		state,
	};
}

describe("convex billing domain model", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("extends early Starter renewals from the current expiration", () => {
		const paidAt = Date.UTC(2026, 4, 13);
		const currentTermEnd = Date.UTC(2026, 6, 1);
		const renewalTerm = getStarterRenewalTermWindow({
			activeLicenseTerm: {
				status: "active",
				termStartAt: Date.UTC(2025, 6, 1),
				termEndAt: currentTermEnd,
				refundState: "none",
			},
			paidAt,
		});

		expect(renewalTerm).toEqual({
			termStartAt: currentTermEnd,
			termEndAt: Date.UTC(2027, 6, 1),
		});
	});

	it("starts expired Starter renewals from verified payment time", () => {
		const paidAt = Date.UTC(2026, 4, 13);
		const renewalTerm = getStarterRenewalTermWindow({
			activeLicenseTerm: {
				status: "active",
				termStartAt: Date.UTC(2024, 6, 1),
				termEndAt: Date.UTC(2025, 6, 1),
				refundState: "none",
			},
			paidAt,
		});

		expect(renewalTerm).toEqual({
			termStartAt: paidAt,
			termEndAt: Date.UTC(2027, 4, 13),
		});
	});

	it("does not grant Starter access for expired, voided, or fully refunded terms", () => {
		const now = Date.UTC(2026, 4, 13);

		expect(
			deriveStarterLicenseAccess(
				{
					status: "active",
					termStartAt: Date.UTC(2026, 0, 1),
					termEndAt: Date.UTC(2027, 0, 1),
					refundState: "none",
				},
				now,
			),
		).toMatchObject({ hasAccess: true });
		expect(
			deriveStarterLicenseAccess(
				{
					status: "active",
					termStartAt: Date.UTC(2024, 0, 1),
					termEndAt: Date.UTC(2025, 0, 1),
					refundState: "none",
				},
				now,
			),
		).toEqual({ hasAccess: false });
		expect(
			deriveStarterLicenseAccess(
				{
					status: "voided",
					termStartAt: Date.UTC(2026, 0, 1),
					termEndAt: Date.UTC(2027, 0, 1),
					refundState: "none",
				},
				now,
			),
		).toEqual({ hasAccess: false });
		expect(
			deriveStarterLicenseAccess(
				{
					status: "active",
					termStartAt: Date.UTC(2026, 0, 1),
					termEndAt: Date.UTC(2027, 0, 1),
					refundState: "fully_refunded",
				},
				now,
			),
		).toEqual({ hasAccess: false });
	});

	it("syncs a new Starter renewal term from the active term end", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-13T12:00:00.000Z"));
		const existingTermEnd = Date.UTC(2026, 6, 1);
		const { ctx, state } = createBillingMutationCtx({
			starterLicenseTerms: [
				{
					_id: "starterLicenseTerms_existing",
					ownerClerkUserId: "user_123",
					status: "active",
					stripeCheckoutSessionId: "cs_existing",
					purchasedAt: Date.UTC(2025, 6, 1),
					termStartAt: Date.UTC(2025, 6, 1),
					termEndAt: existingTermEnd,
					refundState: "none",
					createdAt: 1,
					updatedAt: 1,
				},
			],
		});

		const result = await syncStarterLicenseTermHandler(ctx as never, {
			ownerClerkUserId: "user_123",
			stripeCustomerId: "cus_123",
			customerEmail: "buyer@example.com",
			stripeCheckoutSessionId: "cs_renewal",
			stripePaymentIntentId: "pi_renewal",
			purchasedAt: Date.UTC(2026, 4, 13),
		});

		expect(result).toMatchObject({
			upserted: "inserted",
			termStartAt: existingTermEnd,
			termEndAt: Date.UTC(2027, 6, 1),
		});
		expect(state.starterLicenseTerms).toHaveLength(2);
		expect(state.starterLicenseTerms[1]).toMatchObject({
			renewalOfLicenseTermId: "starterLicenseTerms_existing",
			stripeCheckoutSessionId: "cs_renewal",
		});
		expect(state.stripeCustomers).toHaveLength(1);
	});

	it("keeps Workers access and non-dismissible billing attention during past_due retry", () => {
		const now = Date.UTC(2026, 4, 13);
		const accessThroughAt = Date.UTC(2026, 4, 27);
		const subscription = {
			status: "past_due" as const,
			cancelAtPeriodEnd: false,
			currentPeriodEndAt: accessThroughAt,
			accessThroughAt,
			terminalFailureAt: undefined,
			refundState: "none" as const,
			latestInvoiceId: "in_123",
			paymentRecoveryUrl: "https://billing.stripe.test/pay",
			nextPaymentAttemptAt: Date.UTC(2026, 4, 14),
		};

		expect(deriveWorkersSubscriptionAccess(subscription, now)).toEqual({
			hasAccess: true,
			accessEndsAt: accessThroughAt,
		});
		expect(deriveWorkersBillingAttention(subscription)).toEqual({
			kind: "workers_past_due",
			productKey: "workers",
			nondismissible: true,
			accessThroughAt,
			nextPaymentAttemptAt: Date.UTC(2026, 4, 14),
			latestInvoiceId: "in_123",
			paymentRecoveryUrl: "https://billing.stripe.test/pay",
		});
	});

	it("removes Workers access for terminal and fully refunded states", () => {
		const now = Date.UTC(2026, 4, 13);

		expect(
			deriveWorkersSubscriptionAccess(
				{
					status: "unpaid",
					cancelAtPeriodEnd: false,
					currentPeriodEndAt: Date.UTC(2026, 5, 1),
					accessThroughAt: Date.UTC(2026, 5, 1),
					terminalFailureAt: Date.UTC(2026, 4, 12),
					refundState: "none",
				},
				now,
			),
		).toEqual({ hasAccess: false });
		expect(
			deriveWorkersSubscriptionAccess(
				{
					status: "active",
					cancelAtPeriodEnd: false,
					currentPeriodEndAt: Date.UTC(2026, 5, 1),
					accessThroughAt: Date.UTC(2026, 5, 1),
					terminalFailureAt: undefined,
					refundState: "fully_refunded",
				},
				now,
			),
		).toEqual({ hasAccess: false });
	});

	it("records processed Stripe events idempotently by provider event id", async () => {
		const { ctx, state } = createBillingMutationCtx();

		const first = await recordProcessedStripeEventHandler(ctx as never, {
			stripeEventId: "evt_123",
			eventType: "invoice.payment_failed",
			status: "applied",
			ownerClerkUserId: "user_123",
			stripeObjectId: "in_123",
		});
		const second = await recordProcessedStripeEventHandler(ctx as never, {
			stripeEventId: "evt_123",
			eventType: "invoice.payment_failed",
			status: "applied",
			ownerClerkUserId: "user_123",
			stripeObjectId: "in_123",
		});

		expect(first.recorded).toBe("inserted");
		expect(second).toEqual({
			eventId: first.eventId,
			recorded: "duplicate",
		});
		expect(state.processedStripeEvents).toHaveLength(1);
	});

	it("patches billing email deliveries by idempotency key instead of inserting duplicates", async () => {
		const { ctx, state } = createBillingMutationCtx();

		const first = await upsertBillingEmailDeliveryHandler(ctx as never, {
			idempotencyKey: "workers:failed-payment:in_123:customer",
			emailKind: "workers_failed_payment_customer",
			productKey: "workers",
			recipientKind: "customer",
			recipientEmail: "buyer@example.com",
			ownerClerkUserId: "user_123",
			status: "queued",
		});
		const second = await upsertBillingEmailDeliveryHandler(ctx as never, {
			idempotencyKey: "workers:failed-payment:in_123:customer",
			emailKind: "workers_failed_payment_customer",
			productKey: "workers",
			recipientKind: "customer",
			recipientEmail: "buyer@example.com",
			ownerClerkUserId: "user_123",
			providerMessageId: "email_123",
			status: "sent",
			sentAt: Date.UTC(2026, 4, 13),
		});

		expect(first.upserted).toBe("inserted");
		expect(second).toEqual({
			deliveryId: first.deliveryId,
			upserted: "patched",
		});
		expect(state.billingEmailDeliveries).toHaveLength(1);
		expect(state.billingEmailDeliveries[0]).toMatchObject({
			status: "sent",
			providerMessageId: "email_123",
		});
	});

	it("requires paid Worker Seal Team 6 booking state before prep email readiness", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-13T12:00:00.000Z"));
		const { ctx, state } = createBillingMutationCtx();

		expect(
			isWorkerSealTeam6PaidBookingReady({
				status: "created",
				paymentStatus: "payment_pending",
				refundState: "none",
				paidAt: undefined,
			}),
		).toBe(false);
		const created = await syncWorkerSealTeam6BookingHandler(ctx as never, {
			calBookingUid: "booking_123",
			status: "created",
			paymentStatus: "payment_pending",
			attendeeEmail: "Buyer@Example.com",
		});
		const paid = await syncWorkerSealTeam6BookingHandler(ctx as never, {
			calBookingUid: "booking_123",
			status: "scheduled",
			paymentStatus: "paid",
			attendeeEmail: "Buyer@Example.com",
			paidAt: Date.UTC(2026, 4, 13),
			scheduledStartAt: Date.UTC(2026, 4, 20, 17),
			scheduledEndAt: Date.UTC(2026, 4, 20, 18),
		});

		expect(created.paidBookingReady).toBe(false);
		expect(paid).toEqual({
			bookingId: created.bookingId,
			upserted: "patched",
			paidBookingReady: true,
		});
		expect(state.workerSealTeam6Bookings).toHaveLength(1);
		expect(state.workerSealTeam6Bookings[0]).toMatchObject({
			attendeeEmailNormalized: "buyer@example.com",
			paymentStatus: "paid",
		});
	});
});
