import { z } from "zod";

function normalizeEnvValue(value: string | undefined) {
	if (typeof value !== "string") {
		return value;
	}

	const normalized = value.trim();
	return normalized.length > 0 ? normalized : undefined;
}

const publicEnvSchema = z.object({
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
	NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1),
	NEXT_PUBLIC_CONVEX_URL: z.string().url(),
});

export const publicEnv = publicEnvSchema.parse({
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: normalizeEnvValue(
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
	),
	NEXT_PUBLIC_CLERK_SIGN_IN_URL: normalizeEnvValue(
		process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
	),
	NEXT_PUBLIC_CONVEX_URL: normalizeEnvValue(process.env.NEXT_PUBLIC_CONVEX_URL),
});
