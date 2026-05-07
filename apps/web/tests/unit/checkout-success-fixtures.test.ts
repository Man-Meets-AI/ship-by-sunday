import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	CHECKOUT_SUCCESS_FIXTURE_SLUGS,
	getCheckoutSuccessFixture,
	hasCheckoutSuccessFixtureParam,
} from "@/app/checkout/success/_lib/checkout-success-fixtures";

const ENV_KEY = "CHECKOUT_SUCCESS_FIXTURES";
const NODE_ENV_KEY = "NODE_ENV";

const expectedKindBySlug = {
	validated_polling: "validated",
	validated_arc: "validated",
	validated_redirect: "validated",
	wrong_account: "wrong_account",
	checkout_email_handoff_required: "checkout_email_handoff_required",
	sign_in_required: "sign_in_required",
	payment_pending: "payment_pending",
	invalid_session: "invalid_session",
	missing_session_id: "missing_session_id",
} as const;

describe("getCheckoutSuccessFixture", () => {
	beforeEach(() => {
		vi.stubEnv(ENV_KEY, "1");
		vi.stubEnv(NODE_ENV_KEY, "development");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("returns null when CHECKOUT_SUCCESS_FIXTURES is unset, even with a valid fixture slug", () => {
		vi.stubEnv(ENV_KEY, "");
		expect(
			getCheckoutSuccessFixture({ fixture: "validated_polling" }),
		).toBeNull();
	});

	it("returns null when CHECKOUT_SUCCESS_FIXTURES is not exactly '1'", () => {
		vi.stubEnv(ENV_KEY, "true");
		expect(
			getCheckoutSuccessFixture({ fixture: "validated_polling" }),
		).toBeNull();
	});

	it("returns null when env is set but no fixture param is provided", () => {
		expect(getCheckoutSuccessFixture({})).toBeNull();
		expect(getCheckoutSuccessFixture({ fixture: undefined })).toBeNull();
	});

	it("detects fixture query presence separately from fixture activation", () => {
		expect(hasCheckoutSuccessFixtureParam({})).toBe(false);
		expect(hasCheckoutSuccessFixtureParam({ fixture: undefined })).toBe(false);
		expect(hasCheckoutSuccessFixtureParam({ fixture: "" })).toBe(true);
		expect(
			hasCheckoutSuccessFixtureParam({ fixture: "validated_polling" }),
		).toBe(true);
	});

	it("returns null when fixture param is not a known slug", () => {
		expect(getCheckoutSuccessFixture({ fixture: "wat" })).toBeNull();
		expect(getCheckoutSuccessFixture({ fixture: "" })).toBeNull();
	});

	it("returns null when NODE_ENV is production, even with env + valid slug", () => {
		vi.stubEnv(NODE_ENV_KEY, "production");
		expect(getCheckoutSuccessFixture({ fixture: "validated_arc" })).toBeNull();
	});

	it.each(CHECKOUT_SUCCESS_FIXTURE_SLUGS)(
		"returns the expected packet for %s",
		(slug) => {
			const result = getCheckoutSuccessFixture({ fixture: slug });
			expect(result).not.toBeNull();
			expect(result?.fixtureSlug).toBe(slug);
			expect(result?.checkoutSessionState.kind).toBe(expectedKindBySlug[slug]);
		},
	);

	it("validated_arc carries a positive fixtureFlipAfterMs and validated_polling does not", () => {
		const arc = getCheckoutSuccessFixture({ fixture: "validated_arc" });
		const polling = getCheckoutSuccessFixture({
			fixture: "validated_polling",
		});
		expect(arc?.fixtureFlipAfterMs).toBeGreaterThan(0);
		expect(polling?.fixtureFlipAfterMs).toBeUndefined();
	});

	it("validated_redirect starts with hasAccess true and suppresses redirect", () => {
		const redirect = getCheckoutSuccessFixture({
			fixture: "validated_redirect",
		});
		expect(redirect?.initialProductAccess?.hasAccess).toBe(true);
		expect(redirect?.fixtureSuppressRedirect).toBe(true);
	});

	it("validated_polling and validated_arc start with hasAccess false", () => {
		expect(
			getCheckoutSuccessFixture({ fixture: "validated_polling" })
				?.initialProductAccess?.hasAccess,
		).toBe(false);
		expect(
			getCheckoutSuccessFixture({ fixture: "validated_arc" })
				?.initialProductAccess?.hasAccess,
		).toBe(false);
	});

	it("recovery variants render with no preloaded access", () => {
		const recoverySlugs: ReadonlyArray<
			(typeof CHECKOUT_SUCCESS_FIXTURE_SLUGS)[number]
		> = [
			"wrong_account",
			"checkout_email_handoff_required",
			"sign_in_required",
			"payment_pending",
			"invalid_session",
			"missing_session_id",
		];
		for (const slug of recoverySlugs) {
			const packet = getCheckoutSuccessFixture({ fixture: slug });
			expect(packet?.initialProductAccess).toBeNull();
		}
	});
});
