import { z } from "zod";

function normalizeEnvValue(value: string | undefined) {
	if (typeof value !== "string") {
		return value;
	}

	const normalized = value.trim();
	return normalized.length > 0 ? normalized : undefined;
}

const serverEnvSchema = z.object({
	APP_BASE_URL: z.string().url().optional(),
	GOOGLE_SITE_VERIFICATION: z.string().min(1).optional(),
	CLERK_SECRET_KEY: z.string().min(1).optional(),
	CLERK_FRONTEND_API_URL: z.string().min(1).optional(),
	STRIPE_SECRET_KEY: z.string().min(1).optional(),
	STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
	STRIPE_PRICE_ID: z.string().min(1).optional(),
	STRIPE_PRODUCT_ID: z.string().min(1).optional(),
	CODEX_BINARY: z.string().min(1).optional(),
	CODEX_APP_SERVER_ENABLED: z.string().min(1).optional(),
	CODEX_APP_SERVER_HOME_ROOT: z.string().min(1).optional(),
	CODEX_APP_SERVER_MODEL: z.string().min(1).optional(),
	CODEX_APP_SERVER_TIMEOUT_MS: z.string().min(1).optional(),
});

export const serverEnv = serverEnvSchema.parse({
	APP_BASE_URL: normalizeEnvValue(process.env.APP_BASE_URL),
	GOOGLE_SITE_VERIFICATION: normalizeEnvValue(
		process.env.GOOGLE_SITE_VERIFICATION,
	),
	CLERK_SECRET_KEY: normalizeEnvValue(process.env.CLERK_SECRET_KEY),
	CLERK_FRONTEND_API_URL: normalizeEnvValue(process.env.CLERK_FRONTEND_API_URL),
	STRIPE_SECRET_KEY: normalizeEnvValue(process.env.STRIPE_SECRET_KEY),
	STRIPE_WEBHOOK_SECRET: normalizeEnvValue(process.env.STRIPE_WEBHOOK_SECRET),
	STRIPE_PRICE_ID: normalizeEnvValue(process.env.STRIPE_PRICE_ID),
	STRIPE_PRODUCT_ID: normalizeEnvValue(process.env.STRIPE_PRODUCT_ID),
	CODEX_BINARY: normalizeEnvValue(process.env.CODEX_BINARY),
	CODEX_APP_SERVER_ENABLED: normalizeEnvValue(
		process.env.CODEX_APP_SERVER_ENABLED,
	),
	CODEX_APP_SERVER_HOME_ROOT: normalizeEnvValue(
		process.env.CODEX_APP_SERVER_HOME_ROOT,
	),
	CODEX_APP_SERVER_MODEL: normalizeEnvValue(process.env.CODEX_APP_SERVER_MODEL),
	CODEX_APP_SERVER_TIMEOUT_MS: normalizeEnvValue(
		process.env.CODEX_APP_SERVER_TIMEOUT_MS,
	),
});

export function requireServerEnv<K extends keyof typeof serverEnv>(key: K) {
	const value = serverEnv[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}

	return value;
}
