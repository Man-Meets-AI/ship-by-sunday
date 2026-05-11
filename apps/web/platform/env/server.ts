import "server-only";

import { z } from "zod";

function normalizeEnvValue(value: string | undefined) {
	if (typeof value !== "string") {
		return value;
	}

	const normalized = value.trim().replace(/\\n+$/g, "").replace(/\n+$/g, "");
	return normalized.length > 0 ? normalized : undefined;
}

const serverEnvSchema = z.object({
	APP_BASE_URL: z.string().url().optional(),
	CHECKOUT_SUCCESS_FIXTURES: z.string().min(1).optional(),
	ENABLE_OBSERVABILITY_TEST_TRIGGER: z.string().min(1).optional(),
	GOOGLE_SITE_VERIFICATION: z.string().min(1).optional(),
	NEXT_PUBLIC_CONVEX_SITE_URL: z.string().url().optional(),
	CLERK_AUTHORIZED_PARTIES: z.string().min(1).optional(),
	CLERK_SECRET_KEY: z.string().min(1).optional(),
	CLERK_FRONTEND_API_URL: z.string().min(1).optional(),
	CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1).optional(),
	OBSERVABILITY_INGEST_TOKEN: z.string().min(1).optional(),
	OBSERVABILITY_INCIDENT_CONTROL_TOKEN: z.string().min(1).optional(),
	OBSERVABILITY_VERCEL_WEBHOOK_SECRET: z.string().min(1).optional(),
	POSTHOG_PROJECT_ID: z.string().min(1).optional(),
	POSTHOG_API_KEY: z.string().min(1).optional(),
	STRIPE_SECRET_KEY: z.string().min(1).optional(),
	STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
	STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
	CHECKOUT_FULFILLMENT_RETRY_SECRET: z.string().min(32).optional(),
	STRIPE_PRICE_ID: z.string().min(1).optional(),
	STRIPE_PRODUCT_ID: z.string().min(1).optional(),
	STRIPE_PROMOTION_CODE_ID: z.string().min(1).optional(),
	CODEX_BINARY: z.string().min(1).optional(),
	CODEX_APP_SERVER_ENABLED: z.string().min(1).optional(),
	CODEX_APP_SERVER_HOME_ROOT: z.string().min(1).optional(),
	CODEX_APP_SERVER_MODEL: z.string().min(1).optional(),
	CODEX_APP_SERVER_TIMEOUT_MS: z.string().min(1).optional(),
	ADMIN_IMPERSONATION_ROUTE_AUDIT_SECRET: z.string().min(32).optional(),
});

export function loadServerEnv() {
	return serverEnvSchema.parse({
		APP_BASE_URL: normalizeEnvValue(process.env.APP_BASE_URL),
		CHECKOUT_SUCCESS_FIXTURES: normalizeEnvValue(
			process.env.CHECKOUT_SUCCESS_FIXTURES,
		),
		ENABLE_OBSERVABILITY_TEST_TRIGGER: normalizeEnvValue(
			process.env.ENABLE_OBSERVABILITY_TEST_TRIGGER,
		),
		GOOGLE_SITE_VERIFICATION: normalizeEnvValue(
			process.env.GOOGLE_SITE_VERIFICATION,
		),
		NEXT_PUBLIC_CONVEX_SITE_URL: normalizeEnvValue(
			process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
		),
		CLERK_AUTHORIZED_PARTIES: normalizeEnvValue(
			process.env.CLERK_AUTHORIZED_PARTIES,
		),
		CLERK_SECRET_KEY: normalizeEnvValue(process.env.CLERK_SECRET_KEY),
		CLERK_FRONTEND_API_URL: normalizeEnvValue(
			process.env.CLERK_FRONTEND_API_URL,
		),
		CLERK_WEBHOOK_SIGNING_SECRET: normalizeEnvValue(
			process.env.CLERK_WEBHOOK_SIGNING_SECRET,
		),
		OBSERVABILITY_INGEST_TOKEN: normalizeEnvValue(
			process.env.OBSERVABILITY_INGEST_TOKEN,
		),
		OBSERVABILITY_INCIDENT_CONTROL_TOKEN: normalizeEnvValue(
			process.env.OBSERVABILITY_INCIDENT_CONTROL_TOKEN,
		),
		OBSERVABILITY_VERCEL_WEBHOOK_SECRET: normalizeEnvValue(
			process.env.OBSERVABILITY_VERCEL_WEBHOOK_SECRET,
		),
		POSTHOG_PROJECT_ID: normalizeEnvValue(process.env.POSTHOG_PROJECT_ID),
		POSTHOG_API_KEY: normalizeEnvValue(process.env.POSTHOG_API_KEY),
		STRIPE_SECRET_KEY: normalizeEnvValue(process.env.STRIPE_SECRET_KEY),
		STRIPE_PUBLISHABLE_KEY: normalizeEnvValue(
			process.env.STRIPE_PUBLISHABLE_KEY,
		),
		STRIPE_WEBHOOK_SECRET: normalizeEnvValue(process.env.STRIPE_WEBHOOK_SECRET),
		CHECKOUT_FULFILLMENT_RETRY_SECRET: normalizeEnvValue(
			process.env.CHECKOUT_FULFILLMENT_RETRY_SECRET,
		),
		STRIPE_PRICE_ID: normalizeEnvValue(process.env.STRIPE_PRICE_ID),
		STRIPE_PRODUCT_ID: normalizeEnvValue(process.env.STRIPE_PRODUCT_ID),
		STRIPE_PROMOTION_CODE_ID: normalizeEnvValue(
			process.env.STRIPE_PROMOTION_CODE_ID,
		),
		CODEX_BINARY: normalizeEnvValue(process.env.CODEX_BINARY),
		CODEX_APP_SERVER_ENABLED: normalizeEnvValue(
			process.env.CODEX_APP_SERVER_ENABLED,
		),
		CODEX_APP_SERVER_HOME_ROOT: normalizeEnvValue(
			process.env.CODEX_APP_SERVER_HOME_ROOT,
		),
		CODEX_APP_SERVER_MODEL: normalizeEnvValue(
			process.env.CODEX_APP_SERVER_MODEL,
		),
		CODEX_APP_SERVER_TIMEOUT_MS: normalizeEnvValue(
			process.env.CODEX_APP_SERVER_TIMEOUT_MS,
		),
		ADMIN_IMPERSONATION_ROUTE_AUDIT_SECRET: normalizeEnvValue(
			process.env.ADMIN_IMPERSONATION_ROUTE_AUDIT_SECRET,
		),
	});
}

export const serverEnv = loadServerEnv();

export function requireServerEnv<K extends keyof typeof serverEnv>(key: K) {
	const value = serverEnv[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}

	return value;
}
