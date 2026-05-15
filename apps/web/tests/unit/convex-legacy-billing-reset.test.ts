type LegacyBillingAccessTableName =
	| "productAccessGrants"
	| "checkoutPurchaseIntents"
	| "pendingCheckoutClaims"
	| "stripeWebhookEvents";

type LegacyBillingAccessRecord = {
	_id: string;
};

type LegacyBillingAccessTables = Record<
	LegacyBillingAccessTableName,
	LegacyBillingAccessRecord[]
>;

function createLegacyBillingResetCtx(
	tables: Partial<LegacyBillingAccessTables> = {},
) {
	const state: LegacyBillingAccessTables = {
		productAccessGrants: [...(tables.productAccessGrants ?? [])],
		checkoutPurchaseIntents: [...(tables.checkoutPurchaseIntents ?? [])],
		pendingCheckoutClaims: [...(tables.pendingCheckoutClaims ?? [])],
		stripeWebhookEvents: [...(tables.stripeWebhookEvents ?? [])],
	};
	const deleteRecord = vi.fn(async (id: string) => {
		for (const tableName of Object.keys(
			state,
		) as LegacyBillingAccessTableName[]) {
			const index = state[tableName].findIndex((record) => record._id === id);
			if (index >= 0) {
				state[tableName].splice(index, 1);
				return;
			}
		}
	});

	return {
		ctx: {
			db: {
				query: (tableName: LegacyBillingAccessTableName) => ({
					take: async (limit: number) => state[tableName].slice(0, limit),
				}),
				delete: deleteRecord,
			},
		},
		deleteRecord,
		state,
	};
}

describe("convex/migrations/legacyBillingReset", () => {
	let moduleUnderTest: typeof import("@/convex/migrations/legacyBillingReset");

	beforeEach(async () => {
		vi.resetModules();
		moduleUnderTest = await import("@/convex/migrations/legacyBillingReset");
	});

	it("defaults to dry run and leaves legacy records untouched", async () => {
		const { ctx, deleteRecord, state } = createLegacyBillingResetCtx({
			productAccessGrants: [{ _id: "grant_1" }],
			checkoutPurchaseIntents: [{ _id: "intent_1" }],
			pendingCheckoutClaims: [{ _id: "claim_1" }],
			stripeWebhookEvents: [{ _id: "event_1" }],
		});

		await expect(
			moduleUnderTest.resetLegacyBillingAccessState._handler(ctx as never, {
				confirmation: "reset_legacy_billing_access_state",
			}),
		).resolves.toMatchObject({
			dryRun: true,
			tables: {
				productAccessGrants: { matched: 1, deleted: 0, hasMore: false },
				checkoutPurchaseIntents: { matched: 1, deleted: 0, hasMore: false },
				pendingCheckoutClaims: { matched: 1, deleted: 0, hasMore: false },
				stripeWebhookEvents: { matched: 1, deleted: 0, hasMore: false },
			},
			hasMore: false,
		});
		expect(deleteRecord).not.toHaveBeenCalled();
		expect(state.productAccessGrants).toHaveLength(1);
	});

	it("deletes a bounded batch when dryRun is false", async () => {
		const { ctx, deleteRecord, state } = createLegacyBillingResetCtx({
			productAccessGrants: [
				{ _id: "grant_1" },
				{ _id: "grant_2" },
				{ _id: "grant_3" },
			],
		});

		await expect(
			moduleUnderTest.resetLegacyBillingAccessState._handler(ctx as never, {
				confirmation: "reset_legacy_billing_access_state",
				dryRun: false,
				batchSize: 2,
			}),
		).resolves.toMatchObject({
			dryRun: false,
			batchSize: 2,
			tables: {
				productAccessGrants: { matched: 2, deleted: 2, hasMore: true },
			},
			hasMore: true,
		});
		expect(deleteRecord).toHaveBeenCalledTimes(2);
		expect(state.productAccessGrants).toEqual([{ _id: "grant_3" }]);
	});
});
