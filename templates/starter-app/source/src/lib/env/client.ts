import { z } from "zod";

import { resolveAppUrl } from "./app-url";

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_CONVEX_URL: z.url(),
});

const clientAnalyticsEnvSchema = z.object({
  NEXT_PUBLIC_POSTHOG_HOST: z.url(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
});

const clientSentryEnvSchema = z.object({
  NEXT_PUBLIC_SENTRY_DSN: z.string().min(1),
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.string().min(1),
});

export function parseClientEnv(
  input: Partial<
    Record<keyof z.infer<typeof clientEnvSchema>, string | undefined>
  >,
) {
  const parsedClientEnv = clientEnvSchema.safeParse({
    ...input,
    NEXT_PUBLIC_APP_URL: resolveAppUrl(input.NEXT_PUBLIC_APP_URL),
  });

  if (!parsedClientEnv.success) {
    throw new Error(
      `Invalid public environment variables:\n${z.prettifyError(parsedClientEnv.error)}`,
    );
  }

  return parsedClientEnv.data;
}

function hasAnyDefinedValue(input: Record<string, string | undefined>) {
  return Object.values(input).some(
    (value) => value !== undefined && value !== "",
  );
}

export function parseOptionalClientAnalyticsEnv(
  input: Partial<
    Record<keyof z.infer<typeof clientAnalyticsEnvSchema>, string | undefined>
  >,
) {
  if (!hasAnyDefinedValue(input)) {
    return null;
  }

  const parsedAnalyticsEnv = clientAnalyticsEnvSchema.safeParse(input);

  if (!parsedAnalyticsEnv.success) {
    throw new Error(
      `Invalid public analytics environment variables:\n${z.prettifyError(parsedAnalyticsEnv.error)}`,
    );
  }

  return parsedAnalyticsEnv.data;
}

export function parseOptionalClientSentryEnv(
  input: Partial<
    Record<keyof z.infer<typeof clientSentryEnvSchema>, string | undefined>
  >,
) {
  if (!hasAnyDefinedValue(input)) {
    return null;
  }

  const parsedSentryEnv = clientSentryEnvSchema.safeParse(input);

  if (!parsedSentryEnv.success) {
    throw new Error(
      `Invalid public Sentry environment variables:\n${z.prettifyError(parsedSentryEnv.error)}`,
    );
  }

  return parsedSentryEnv.data;
}

export const clientEnv = parseClientEnv({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
});

export function getClientAnalyticsEnv() {
  return parseOptionalClientAnalyticsEnv({
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  });
}

export function getClientSentryEnv() {
  return parseOptionalClientSentryEnv({
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  });
}
