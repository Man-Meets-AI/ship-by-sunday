import { spawnSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
	buildReleaseBillingDoctorCommand,
	resolveReleaseBillingDoctorConfig,
} from "../../scripts/lib/release-billing-doctor.mjs";

const appRoot = path.resolve(import.meta.dirname, "../..");

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
			"--require-webhook-endpoint",
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
			"--require-webhook-endpoint",
		]);
	});

	it("rejects unsupported release environments", () => {
		expect(() => resolveReleaseBillingDoctorConfig("staging")).toThrow(
			"Unsupported release billing environment 'staging'. Expected 'preview' or 'production'.",
		);
	});

	it("keeps the standalone Stripe verifier out of the server-only module graph", () => {
		const result = spawnSync(
			"bun",
			[
				"--no-env-file",
				"scripts/verify-managed-stripe-env.ts",
				"--expected-mode=test",
			],
			{
				cwd: appRoot,
				encoding: "utf8",
				env: {
					HOME: process.env.HOME,
					PATH: process.env.PATH,
				},
			},
		);
		const output = `${result.stdout}\n${result.stderr}`;

		expect(result.status).not.toBe(0);
		expect(output).toContain(
			"Missing required environment variable: STRIPE_SECRET_KEY",
		);
		expect(output).not.toContain("server-only");
		expect(output).not.toContain("This module cannot be imported");
	});
});
