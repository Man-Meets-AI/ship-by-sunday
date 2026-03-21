import { z } from "zod";

function normalizeEnvValue(value: string | undefined) {
	if (typeof value !== "string") {
		return value;
	}

	const normalized = value.trim();
	return normalized.length > 0 ? normalized : undefined;
}

const convexEnvSchema = z.object({
	CLERK_FRONTEND_API_URL: z.string().min(1).optional(),
	OBSERVABILITY_INGEST_TOKEN: z.string().min(1).optional(),
	STRIPE_SECRET_KEY: z.string().min(1).optional(),
	STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
	TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
	TELEGRAM_CHAT_ID: z.string().min(1).optional(),
});

const convexEnv = convexEnvSchema.parse({
	CLERK_FRONTEND_API_URL: normalizeEnvValue(process.env.CLERK_FRONTEND_API_URL),
	OBSERVABILITY_INGEST_TOKEN: normalizeEnvValue(
		process.env.OBSERVABILITY_INGEST_TOKEN,
	),
	STRIPE_SECRET_KEY: normalizeEnvValue(process.env.STRIPE_SECRET_KEY),
	STRIPE_WEBHOOK_SECRET: normalizeEnvValue(process.env.STRIPE_WEBHOOK_SECRET),
	TELEGRAM_BOT_TOKEN: normalizeEnvValue(process.env.TELEGRAM_BOT_TOKEN),
	TELEGRAM_CHAT_ID: normalizeEnvValue(process.env.TELEGRAM_CHAT_ID),
});

export function requireConvexEnv<K extends keyof typeof convexEnv>(key: K) {
	const value = convexEnv[key];
	if (!value) {
		throw new Error(`Missing required Convex environment variable: ${key}`);
	}

	return value;
}
