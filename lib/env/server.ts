import { z } from "zod";

const serverEnvSchema = z.object({
	CLERK_SECRET_KEY: z.string().min(1).optional(),
	CLERK_FRONTEND_API_URL: z.string().min(1).optional(),
	STRIPE_SECRET_KEY: z.string().min(1).optional(),
	STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
	STRIPE_PRICE_ID: z.string().min(1).optional(),
	STRIPE_PRODUCT_ID: z.string().min(1).optional(),
});

export const serverEnv = serverEnvSchema.parse({
	CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
	CLERK_FRONTEND_API_URL: process.env.CLERK_FRONTEND_API_URL,
	STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
	STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
	STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
	STRIPE_PRODUCT_ID: process.env.STRIPE_PRODUCT_ID,
});

export function requireServerEnv<K extends keyof typeof serverEnv>(key: K) {
	const value = serverEnv[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}

	return value;
}
