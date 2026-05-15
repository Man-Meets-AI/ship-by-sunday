describe("Convex entitlement module boundaries", () => {
	it("exposes entitlement handlers from the entitlement model", async () => {
		const entitlementModel = await import("@/convex/entitlements/model");

		expect(entitlementModel.viewerProductAccessHandler).toBeTypeOf("function");
		expect(entitlementModel.requireGrantedProductAccess).toBeTypeOf("function");
		expect(entitlementModel.requireGeneratedCodebaseProductAccess).toBeTypeOf(
			"function",
		);
		expect(entitlementModel.upsertProductAccessGrant).toBeTypeOf("function");
	});

	it("exposes product access validators from the entitlement domain", async () => {
		const entitlementValidators =
			await import("@/convex/entitlements/validators");

		expect(entitlementValidators.productAccessReturnValidator).toBeDefined();
		expect(
			entitlementValidators.productAccessGrantResultValidator,
		).toBeDefined();
		expect(
			entitlementValidators.productAccessCapabilityValidator,
		).toBeDefined();
	});

	it("exposes checkout validators from the billing domain", async () => {
		const billingValidators = await import("@/convex/billing/validators");

		expect(billingValidators.checkoutIntentFieldsValidator).toBeDefined();
		expect(billingValidators.checkoutFulfillmentTrackValidator).toBeDefined();
		expect(
			billingValidators.checkoutResolvedFulfillmentTrackValidator,
		).toBeDefined();
		expect(billingValidators.checkoutOfferIdValidator).toBeDefined();
	});

	it("registers the public entitlement function module directly", async () => {
		const entitlements = await import("@/convex/entitlements");

		expect(entitlements.viewerProductAccess).toBeDefined();
		expect(entitlements.resolveViewerFulfillmentTrack).toBeDefined();
		expect(entitlements.grantProductAccess).toBeDefined();
		expect(entitlements.resetProductAccess).toBeDefined();
	});
});
