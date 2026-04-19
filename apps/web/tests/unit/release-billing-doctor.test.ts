import { describe, expect, it } from "vitest";

import {
	buildReleaseBillingDoctorCommand,
	resolveReleaseBillingDoctorConfig,
} from "../../scripts/lib/release-billing-doctor.mjs";

describe("release billing doctor", () => {
	it("maps preview billing checks to the hosted dev configuration", () => {
		const config = resolveReleaseBillingDoctorConfig("preview");

		expect(config).toEqual({
			appBaseUrl: "https://dev.man-meets-ai.com",
			envFile: ".env.local",
			expectedMode: "test",
			releaseEnvironment: "preview",
		});
		expect(buildReleaseBillingDoctorCommand(config)).toEqual([
			"bun",
			"--env-file=.env.local",
			"scripts/verify-managed-stripe-env.ts",
			"--expected-mode=test",
			"--app-base-url=https://dev.man-meets-ai.com",
		]);
	});

	it("maps production billing checks to the live configuration", () => {
		const config = resolveReleaseBillingDoctorConfig("production");

		expect(config).toEqual({
			appBaseUrl: "https://www.man-meets-ai.com",
			envFile: ".env.production",
			expectedMode: "live",
			releaseEnvironment: "production",
		});
		expect(buildReleaseBillingDoctorCommand(config)).toEqual([
			"bun",
			"--env-file=.env.production",
			"scripts/verify-managed-stripe-env.ts",
			"--expected-mode=live",
			"--app-base-url=https://www.man-meets-ai.com",
		]);
	});

	it("rejects unsupported release environments", () => {
		expect(() => resolveReleaseBillingDoctorConfig("staging")).toThrow(
			"Unsupported release billing environment 'staging'. Expected 'preview' or 'production'.",
		);
	});
});
