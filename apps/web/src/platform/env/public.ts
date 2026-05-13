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
	NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.literal("/sign-in"),
	NEXT_PUBLIC_CONVEX_URL: z.string().url(),
	NEXT_PUBLIC_POSTHOG_TOKEN: z.string().min(1).optional(),
	NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
});

export function loadPublicEnv() {
	const clerkSignInUrl =
		normalizeEnvValue(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL) ?? "/sign-in";
	const posthogToken = normalizeEnvValue(process.env.NEXT_PUBLIC_POSTHOG_TOKEN);
	const posthogHost = normalizeEnvValue(process.env.NEXT_PUBLIC_POSTHOG_HOST);

	if ((posthogToken && !posthogHost) || (!posthogToken && posthogHost)) {
		throw new Error(
			"NEXT_PUBLIC_POSTHOG_TOKEN and NEXT_PUBLIC_POSTHOG_HOST must be set together.",
		);
	}

	return publicEnvSchema.parse({
		NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: normalizeEnvValue(
			process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
		),
		NEXT_PUBLIC_CLERK_SIGN_IN_URL: clerkSignInUrl,
		NEXT_PUBLIC_CONVEX_URL: normalizeEnvValue(
			process.env.NEXT_PUBLIC_CONVEX_URL,
		),
		NEXT_PUBLIC_POSTHOG_TOKEN: posthogToken,
		NEXT_PUBLIC_POSTHOG_HOST: posthogHost,
	});
}

export const publicEnv = loadPublicEnv();
