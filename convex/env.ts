import { z } from "zod";

const convexEnvSchema = z.object({
	CLERK_FRONTEND_API_URL: z.string().min(1).optional(),
	STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
});

const convexEnv = convexEnvSchema.parse({
	CLERK_FRONTEND_API_URL: process.env.CLERK_FRONTEND_API_URL,
	STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
});

export function requireConvexEnv<K extends keyof typeof convexEnv>(key: K) {
	const value = convexEnv[key];
	if (!value) {
		throw new Error(`Missing required Convex environment variable: ${key}`);
	}

	return value;
}
