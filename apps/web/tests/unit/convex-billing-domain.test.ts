import {
	deriveStarterLicenseAccess,
	deriveWorkersBillingAttention,
	deriveWorkersSubscriptionAccess,
	getStarterRenewalTermWindow,
	isWorkerSealTeam6PaidBookingReady,
	recordProcessedStripeEventHandler,
	selectCurrentWorkersSubscription,
	syncStarterLicenseTermHandler,
	syncWorkersSubscriptionHandler,
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
			const record: BillingRecord = {
				_id: `${tableName}_${idCounter}`,
			};
			for (const [fieldName, fieldValue] of Object.entries(value)) {
				if (fieldValue !== undefined) {
					record[fieldName] = fieldValue;
				}
			}
			idCounter += 1;
			state[tableName].push(record);
			return record._id;
		},
		patch: async (id: string, value: Record<string, unknown>) => {
			for (const tableRecords of Object.values(state)) {
				const record = tableRecords.find((candidate) => candidate._id === id);
				if (record) {
					for (const [fieldName, fieldValue] of Object.entries(value)) {
						if (fieldValue === undefined) {
							delete record[fieldName];
						} else {
							record[fieldName] = fieldValue;
						}
					}
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

	it("keeps duplicate Starter checkout syncs on the original license term window", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-13T12:00:00.000Z"));
		const paidAt = Date.UTC(2026, 4, 13);
		const originalTermEnd = Date.UTC(2027, 4, 13);
		const { ctx, state } = createBillingMutationCtx({
			starterLicenseTerms: [
				{
					_id: "starterLicenseTerms_existing",
					ownerClerkUserId: "user_123",
					status: "active",
					stripeCustomerId: "cus_existing",
					stripeCheckoutSessionId: "cs_duplicate",
					stripePaymentIntentId: "pi_existing",
					purchasedAt: paidAt,
					termStartAt: paidAt,
					termEndAt: originalTermEnd,
					refundState: "none",
					createdAt: 1,
					updatedAt: 1,
				},
			],
		});

		const result = await syncStarterLicenseTermHandler(ctx as never, {
			ownerClerkUserId: "user_123",
			stripeCheckoutSessionId: "cs_duplicate",
			purchasedAt: paidAt,
		});

		expect(result).toEqual({
			licenseTermId: "starterLicenseTerms_existing",
			upserted: "patched",
			termStartAt: paidAt,
			termEndAt: originalTermEnd,
		});
		expect(state.starterLicenseTerms).toHaveLength(1);
		expect(state.starterLicenseTerms[0]).toMatchObject({
			stripeCustomerId: "cus_existing",
			stripePaymentIntentId: "pi_existing",
			termStartAt: paidAt,
			termEndAt: originalTermEnd,
		});
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

	it("selects the latest current Workers subscription when duplicate current rows exist", () => {
		const selected = selectCurrentWorkersSubscription([
			{
				_id: "workersSubscriptions_1",
				status: "active",
				updatedAt: Date.UTC(2026, 4, 10),
				createdAt: Date.UTC(2026, 4, 1),
			},
			{
				_id: "workersSubscriptions_2",
				status: "past_due",
				updatedAt: Date.UTC(2026, 4, 12),
				createdAt: Date.UTC(2026, 4, 2),
			},
		] as never);

		expect(selected?._id).toBe("workersSubscriptions_2");
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

	it("preserves Workers subscription durable fields during partial provider syncs", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-13T12:00:00.000Z"));
		const periodStartAt = Date.UTC(2026, 4, 1);
		const periodEndAt = Date.UTC(2026, 5, 1);
		const { ctx, state } = createBillingMutationCtx({
			workersSubscriptions: [
				{
					_id: "workersSubscriptions_existing",
					ownerClerkUserId: "user_123",
					stripeCustomerId: "cus_existing",
					stripeSubscriptionId: "sub_123",
					stripePriceId: "price_existing",
					stripeProductId: "prod_existing",
					cadence: "monthly",
					status: "past_due",
					cancelAtPeriodEnd: true,
					currentPeriodStartAt: periodStartAt,
					currentPeriodEndAt: periodEndAt,
					accessThroughAt: periodEndAt,
					latestInvoiceId: "in_existing",
					latestInvoiceHostedUrl: "https://billing.stripe.test/invoice",
					paymentRecoveryUrl: "https://billing.stripe.test/recover",
					failedPaymentStartedAt: Date.UTC(2026, 4, 10),
					failedPaymentAttemptCount: 2,
					nextPaymentAttemptAt: Date.UTC(2026, 4, 14),
					refundState: "fully_refunded",
					createdAt: 1,
					updatedAt: 1,
				},
			],
		});

		const result = await syncWorkersSubscriptionHandler(ctx as never, {
			ownerClerkUserId: "user_123",
			stripeCustomerId: "cus_existing",
			stripeSubscriptionId: "sub_123",
			cadence: "monthly",
			status: "active",
		});

		expect(result).toEqual({
			subscriptionId: "workersSubscriptions_existing",
			upserted: "patched",
		});
		expect(state.workersSubscriptions[0]).toMatchObject({
			stripePriceId: "price_existing",
			stripeProductId: "prod_existing",
			cancelAtPeriodEnd: true,
			currentPeriodStartAt: periodStartAt,
			currentPeriodEndAt: periodEndAt,
			accessThroughAt: periodEndAt,
			latestInvoiceId: "in_existing",
			latestInvoiceHostedUrl: "https://billing.stripe.test/invoice",
			paymentRecoveryUrl: "https://billing.stripe.test/recover",
			failedPaymentStartedAt: Date.UTC(2026, 4, 10),
			failedPaymentAttemptCount: 2,
			nextPaymentAttemptAt: Date.UTC(2026, 4, 14),
			refundState: "fully_refunded",
			status: "active",
		});
		expect(state.stripeCustomers).toHaveLength(1);
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

	it("does not downgrade sent billing email deliveries on duplicate retries", async () => {
		const sentAt = Date.UTC(2026, 4, 13);
		const { ctx, state } = createBillingMutationCtx({
			billingEmailDeliveries: [
				{
					_id: "billingEmailDeliveries_existing",
					idempotencyKey: "workers:failed-payment:in_123:customer",
					emailKind: "workers_failed_payment_customer",
					productKey: "workers",
					recipientKind: "customer",
					recipientEmail: "buyer@example.com",
					ownerClerkUserId: "user_123",
					providerMessageId: "email_123",
					status: "sent",
					sentAt,
					createdAt: 1,
					updatedAt: 1,
				},
			],
		});

		const result = await upsertBillingEmailDeliveryHandler(ctx as never, {
			idempotencyKey: "workers:failed-payment:in_123:customer",
			emailKind: "workers_failed_payment_customer",
			productKey: "workers",
			recipientKind: "customer",
			recipientEmail: "buyer@example.com",
			ownerClerkUserId: "user_123",
			status: "failed",
			lastError: "retry observed after provider success",
		});

		expect(result).toEqual({
			deliveryId: "billingEmailDeliveries_existing",
			upserted: "patched",
		});
		expect(state.billingEmailDeliveries[0]).toMatchObject({
			providerMessageId: "email_123",
			status: "sent",
			sentAt,
			updatedAt: 1,
		});
		expect(state.billingEmailDeliveries[0]).not.toHaveProperty("lastError");
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

	it("does not downgrade paid Worker Seal Team 6 bookings when delayed Cal.com creation events arrive", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-13T12:00:00.000Z"));
		const paidAt = Date.UTC(2026, 4, 13);
		const scheduledStartAt = Date.UTC(2026, 4, 20, 17);
		const scheduledEndAt = Date.UTC(2026, 4, 20, 18);
		const { ctx, state } = createBillingMutationCtx();

		const paid = await syncWorkerSealTeam6BookingHandler(ctx as never, {
			calBookingUid: "booking_123",
			status: "scheduled",
			paymentStatus: "paid",
			attendeeEmail: "Buyer@Example.com",
			paidAt,
			scheduledStartAt,
			scheduledEndAt,
		});
		const delayedCreated = await syncWorkerSealTeam6BookingHandler(
			ctx as never,
			{
				calBookingUid: "booking_123",
				status: "created",
				paymentStatus: "payment_pending",
				attendeeEmail: "Buyer@Example.com",
			},
		);

		expect(delayedCreated).toEqual({
			bookingId: paid.bookingId,
			upserted: "patched",
			paidBookingReady: true,
		});
		expect(state.workerSealTeam6Bookings[0]).toMatchObject({
			status: "scheduled",
			paymentStatus: "paid",
			paidAt,
			scheduledStartAt,
			scheduledEndAt,
		});
	});

	it("preserves paid payment state when Cal.com cancellation events omit payment fields", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-13T12:00:00.000Z"));
		const paidAt = Date.UTC(2026, 4, 13);
		const canceledAt = Date.UTC(2026, 4, 14);
		const { ctx, state } = createBillingMutationCtx();

		const paid = await syncWorkerSealTeam6BookingHandler(ctx as never, {
			calBookingUid: "booking_123",
			status: "scheduled",
			paymentStatus: "paid",
			attendeeEmail: "Buyer@Example.com",
			paidAt,
		});
		const canceled = await syncWorkerSealTeam6BookingHandler(ctx as never, {
			calBookingUid: "booking_123",
			status: "canceled",
			paymentStatus: "payment_pending",
			fulfillmentStatus: "canceled",
			attendeeEmail: "Buyer@Example.com",
			canceledAt,
		});

		expect(canceled).toEqual({
			bookingId: paid.bookingId,
			upserted: "patched",
			paidBookingReady: false,
		});
		expect(state.workerSealTeam6Bookings[0]).toMatchObject({
			status: "canceled",
			paymentStatus: "paid",
			fulfillmentStatus: "canceled",
			paidAt,
			canceledAt,
		});
	});

	it("does not reopen canceled Worker Seal Team 6 bookings when delayed Cal.com paid events arrive", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-13T12:00:00.000Z"));
		const paidAt = Date.UTC(2026, 4, 13);
		const canceledAt = Date.UTC(2026, 4, 14);
		const { ctx, state } = createBillingMutationCtx();

		const canceled = await syncWorkerSealTeam6BookingHandler(ctx as never, {
			calBookingUid: "booking_123",
			status: "canceled",
			paymentStatus: "payment_pending",
			fulfillmentStatus: "canceled",
			attendeeEmail: "Buyer@Example.com",
			canceledAt,
		});
		const delayedPaid = await syncWorkerSealTeam6BookingHandler(ctx as never, {
			calBookingUid: "booking_123",
			status: "scheduled",
			paymentStatus: "paid",
			fulfillmentStatus: "not_started",
			attendeeEmail: "Buyer@Example.com",
			paidAt,
		});

		expect(delayedPaid).toEqual({
			bookingId: canceled.bookingId,
			upserted: "patched",
			paidBookingReady: false,
		});
		expect(state.workerSealTeam6Bookings[0]).toMatchObject({
			status: "canceled",
			paymentStatus: "paid",
			fulfillmentStatus: "canceled",
			paidAt,
			canceledAt,
		});
	});

	it("preserves Worker Seal Team 6 booking mirrors during partial syncs", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-13T12:00:00.000Z"));
		const paidAt = Date.UTC(2026, 4, 13);
		const scheduledStartAt = Date.UTC(2026, 4, 20, 17);
		const scheduledEndAt = Date.UTC(2026, 4, 20, 18);
		const { ctx, state } = createBillingMutationCtx({
			workerSealTeam6Bookings: [
				{
					_id: "workerSealTeam6Bookings_existing",
					calBookingUid: "booking_123",
					calEventTypeId: "event_type_123",
					stripeCustomerId: "cus_123",
					stripePaymentIntentId: "pi_123",
					status: "scheduled",
					paymentStatus: "paid",
					refundState: "partial_refunded",
					fulfillmentStatus: "ops_notified",
					attendeeEmail: "Buyer@Example.com",
					attendeeEmailNormalized: "buyer@example.com",
					attendeeName: "Buyer Example",
					attendeeTimeZone: "America/New_York",
					scheduledStartAt,
					scheduledEndAt,
					rescheduleUrl: "https://cal.test/reschedule",
					cancelUrl: "https://cal.test/cancel",
					calBookingUrl: "https://cal.test/booking",
					intakeAnswers: [{ label: "Goal", value: "Ship it" }],
					paidAt,
					fulfilledAt: Date.UTC(2026, 4, 21),
					customerPrepEmailDeliveryId: "billingEmailDeliveries_customer",
					opsEmailDeliveryId: "billingEmailDeliveries_ops",
					createdAt: 1,
					updatedAt: 1,
				},
			],
		});

		const result = await syncWorkerSealTeam6BookingHandler(ctx as never, {
			calBookingUid: "booking_123",
			status: "scheduled",
			paymentStatus: "paid",
			refundState: "none",
			fulfillmentStatus: "not_started",
			attendeeEmail: "Buyer@Example.com",
		});

		expect(result).toEqual({
			bookingId: "workerSealTeam6Bookings_existing",
			upserted: "patched",
			paidBookingReady: true,
		});
		expect(state.workerSealTeam6Bookings[0]).toMatchObject({
			calEventTypeId: "event_type_123",
			stripeCustomerId: "cus_123",
			stripePaymentIntentId: "pi_123",
			refundState: "partial_refunded",
			fulfillmentStatus: "ops_notified",
			attendeeName: "Buyer Example",
			attendeeTimeZone: "America/New_York",
			scheduledStartAt,
			scheduledEndAt,
			rescheduleUrl: "https://cal.test/reschedule",
			cancelUrl: "https://cal.test/cancel",
			calBookingUrl: "https://cal.test/booking",
			intakeAnswers: [{ label: "Goal", value: "Ship it" }],
			paidAt,
			fulfilledAt: Date.UTC(2026, 4, 21),
			customerPrepEmailDeliveryId: "billingEmailDeliveries_customer",
			opsEmailDeliveryId: "billingEmailDeliveries_ops",
		});
	});
});
