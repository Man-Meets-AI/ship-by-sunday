import { z } from "zod";

function normalizeEnvValue(value: string | undefined) {
	if (typeof value !== "string") {
		return value;
	}

	const normalized = value.trim().replace(/\\n+$/g, "").replace(/\n+$/g, "");
	return normalized.length > 0 ? normalized : undefined;
}

const convexEnvShape = {
	CLERK_SECRET_KEY: z.string().min(1).optional(),
	CLERK_FRONTEND_API_URL: z.string().min(1).optional(),
	ADMIN_IMPERSONATION_EMAILS: z.string().min(1).optional(),
	ADMIN_IMPERSONATION_ENABLED: z.string().min(1).optional(),
	ADMIN_IMPERSONATION_ROUTE_AUDIT_SECRET: z.string().min(32).optional(),
	OBSERVABILITY_INGEST_TOKEN: z.string().min(1).optional(),
	OPENAI_API_KEY: z.string().min(1).optional(),
	STRIPE_SECRET_KEY: z.string().min(1).optional(),
	STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
	CONVEX_WEBHOOK_MUTATION_SECRET: z.string().min(32).optional(),
	CHECKOUT_FULFILLMENT_RETRY_SECRET: z.string().min(32).optional(),
	TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
	TELEGRAM_CHAT_ID: z.string().min(1).optional(),
	TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN: z.string().min(1).optional(),
	TELEGRAM_SUPPORT_BOT_TOKEN: z.string().min(1).optional(),
	TELEGRAM_SUPPORT_CHAT_ID: z.string().min(1).optional(),
	TELEGRAM_SUPPORT_OPERATOR_USER_IDS: z.string().min(1).optional(),
	TELEGRAM_SUPPORT_WEBHOOK_SECRET: z.string().min(1).optional(),
	SUPPORT_CHAT_DISABLED: z.string().min(1).optional(),
	SUPPORT_AI_DRAFT_MODEL: z.string().min(1).optional(),
} as const;

type ConvexEnvKey = keyof typeof convexEnvShape;

function readConvexEnv<K extends ConvexEnvKey>(key: K) {
	try {
		return convexEnvShape[key].parse(normalizeEnvValue(process.env[key]));
	} catch (error) {
		if (error instanceof z.ZodError) {
			const message = error.issues[0]?.message ?? "Invalid value";
			throw new Error(`Invalid Convex environment variable ${key}: ${message}`);
		}

		throw error;
	}
}

export function readOptionalConvexEnv<K extends ConvexEnvKey>(key: K) {
	return readConvexEnv(key);
}

export function requireConvexEnv<K extends ConvexEnvKey>(key: K) {
	const value = readConvexEnv(key);
	if (!value) {
		throw new Error(`Missing required Convex environment variable: ${key}`);
	}

	return value;
}
