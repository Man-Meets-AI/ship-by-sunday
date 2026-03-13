import { z } from "zod";

const serverEnvSchema = z.object({
	CLERK_SECRET_KEY: z.string().min(1).optional(),
	CLERK_FRONTEND_API_URL: z.string().min(1).optional(),
	STRIPE_SECRET_KEY: z.string().min(1).optional(),
	STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
	STRIPE_PRICE_ID: z.string().min(1).optional(),
	STRIPE_PRODUCT_ID: z.string().min(1).optional(),
	CODEX_BINARY: z.string().min(1).optional(),
	CODEX_APP_SERVER_HOME_ROOT: z.string().min(1).optional(),
	CODEX_APP_SERVER_MODEL: z.string().min(1).optional(),
	CODEX_APP_SERVER_TIMEOUT_MS: z.string().min(1).optional(),
});

export const serverEnv = serverEnvSchema.parse({
	CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
	CLERK_FRONTEND_API_URL: process.env.CLERK_FRONTEND_API_URL,
	STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
	STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
	STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
	STRIPE_PRODUCT_ID: process.env.STRIPE_PRODUCT_ID,
	CODEX_BINARY: process.env.CODEX_BINARY,
	CODEX_APP_SERVER_HOME_ROOT: process.env.CODEX_APP_SERVER_HOME_ROOT,
	CODEX_APP_SERVER_MODEL: process.env.CODEX_APP_SERVER_MODEL,
	CODEX_APP_SERVER_TIMEOUT_MS: process.env.CODEX_APP_SERVER_TIMEOUT_MS,
});

export function requireServerEnv<K extends keyof typeof serverEnv>(key: K) {
	const value = serverEnv[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}

	return value;
}
