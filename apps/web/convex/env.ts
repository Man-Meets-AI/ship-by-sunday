import { z } from "zod";

function normalizeEnvValue(value: string | undefined) {
	if (typeof value !== "string") {
		return value;
	}

	const normalized = value.trim();
	return normalized.length > 0 ? normalized : undefined;
}

const convexEnvShape = {
	CLERK_FRONTEND_API_URL: z.string().min(1).optional(),
	OBSERVABILITY_INGEST_TOKEN: z.string().min(1).optional(),
	STRIPE_SECRET_KEY: z.string().min(1).optional(),
	STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
	TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
	TELEGRAM_CHAT_ID: z.string().min(1).optional(),
} as const;

type ConvexEnvKey = keyof typeof convexEnvShape;

function readConvexEnv<K extends ConvexEnvKey>(key: K) {
	return convexEnvShape[key].parse(normalizeEnvValue(process.env[key]));
}

export function requireConvexEnv<K extends ConvexEnvKey>(key: K) {
	const value = readConvexEnv(key);
	if (!value) {
		throw new Error(`Missing required Convex environment variable: ${key}`);
	}

	return value;
}
