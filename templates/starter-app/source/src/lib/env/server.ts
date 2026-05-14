import { z } from "zod";

import { resolveAppUrl } from "./app-url";

const plainEmailSchema = z.email();
const formattedEmailSenderPattern =
  /^[^<>]+<\s*[^<>\s]+@[^<>\s]+\.[^<>\s]+\s*>$/;
const resendFromEmailSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      plainEmailSchema.safeParse(value).success ||
      formattedEmailSenderPattern.test(value),
    {
      message:
        "Expected a plain email or a formatted sender like Name <hello@example.com>",
    },
  );

export const serverEnvSchema = z.object({
  CLERK_JWT_ISSUER_DOMAIN: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_CONVEX_URL: z.url(),
  NEXT_PUBLIC_POSTHOG_HOST: z.url(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
  NEXT_PUBLIC_SENTRY_DSN: z.string().min(1),
  POSTHOG_API_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: resendFromEmailSchema,
  SENTRY_AUTH_TOKEN: z.string().min(1),
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.string().min(1),
  SENTRY_ORG: z.string().min(1),
  SENTRY_PROJECT: z.string().min(1),
  CONVEX_WEBHOOK_MUTATION_SECRET: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  STRIPE_PRICE_PRO_MONTHLY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
});

export function parseServerEnv(
  input: Partial<
    Record<keyof z.infer<typeof serverEnvSchema>, string | undefined>
  >,
) {
  const parsedServerEnv = serverEnvSchema.safeParse({
    ...input,
    NEXT_PUBLIC_APP_URL: resolveAppUrl(input.NEXT_PUBLIC_APP_URL),
  });

  if (!parsedServerEnv.success) {
    throw new Error(
      `Invalid server environment variables:\n${z.prettifyError(parsedServerEnv.error)}`,
    );
  }

  return parsedServerEnv.data;
}

const billingServerEnvSchema = z.object({
  CONVEX_WEBHOOK_MUTATION_SECRET: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
});

const convexBillingSyncEnvSchema = z.object({
  CONVEX_WEBHOOK_MUTATION_SECRET: z.string().min(1),
  STRIPE_PRICE_PRO_MONTHLY: z.string().min(1),
});

const convexAuthEnvSchema = z.object({
  CLERK_JWT_ISSUER_DOMAIN: z.string().min(1),
});

const debugToolsEnvSchema = z.object({
  ENABLE_DEBUG_TOOLS: z.preprocess(
    (value) => (value === "" || value === undefined ? "false" : value),
    z.enum(["true", "false"]),
  ),
});

const analyticsServerEnvSchema = z.object({
  NEXT_PUBLIC_POSTHOG_HOST: z.url(),
  POSTHOG_API_KEY: z.string().min(1),
});

const emailServerEnvSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: resendFromEmailSchema,
});

const openAIEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
});

const sentryServerEnvSchema = z.object({
  NEXT_PUBLIC_SENTRY_DSN: z.string().min(1),
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.string().min(1),
});

function hasAnyDefinedValue(input: Record<string, string | undefined>) {
  return Object.values(input).some(
    (value) => value !== undefined && value !== "",
  );
}

function parseOptionalEnv<TSchema extends z.ZodType>(
  schema: TSchema,
  input: Partial<Record<keyof z.infer<TSchema>, string | undefined>>,
  label: string,
) {
  if (!hasAnyDefinedValue(input as Record<string, string | undefined>)) {
    return null;
  }

  const parsedEnv = schema.safeParse(input);

  if (!parsedEnv.success) {
    throw new Error(`Invalid ${label}:\n${z.prettifyError(parsedEnv.error)}`);
  }

  return parsedEnv.data;
}

export function getBillingEnv() {
  return billingServerEnvSchema.parse({
    CONVEX_WEBHOOK_MUTATION_SECRET: process.env.CONVEX_WEBHOOK_MUTATION_SECRET,
    NEXT_PUBLIC_APP_URL: resolveAppUrl(process.env.NEXT_PUBLIC_APP_URL),
    STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  });
}

export function getBillingEnvIfConfigured() {
  const rawBillingEnv = {
    CONVEX_WEBHOOK_MUTATION_SECRET: process.env.CONVEX_WEBHOOK_MUTATION_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  };

  if (!hasAnyDefinedValue(rawBillingEnv)) {
    return null;
  }

  return parseOptionalEnv(
    billingServerEnvSchema,
    {
      ...rawBillingEnv,
      NEXT_PUBLIC_APP_URL: resolveAppUrl(rawBillingEnv.NEXT_PUBLIC_APP_URL),
    },
    "billing environment variables",
  );
}

export function getConvexBillingSyncEnv() {
  return convexBillingSyncEnvSchema.parse({
    CONVEX_WEBHOOK_MUTATION_SECRET: process.env.CONVEX_WEBHOOK_MUTATION_SECRET,
    STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY,
  });
}

export function getConvexAuthEnv() {
  return convexAuthEnvSchema.parse({
    CLERK_JWT_ISSUER_DOMAIN: process.env.CLERK_JWT_ISSUER_DOMAIN,
  });
}

export function getDebugToolsEnv() {
  return debugToolsEnvSchema.parse({
    ENABLE_DEBUG_TOOLS: process.env.ENABLE_DEBUG_TOOLS,
  });
}

export function getServerAnalyticsEnv() {
  return parseOptionalEnv(
    analyticsServerEnvSchema,
    {
      NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
    },
    "server analytics environment variables",
  );
}

export function getServerEmailEnv() {
  return parseOptionalEnv(
    emailServerEnvSchema,
    {
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    },
    "server email environment variables",
  );
}

export function getOpenAIEnvIfConfigured() {
  return parseOptionalEnv(
    openAIEnvSchema,
    {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },
    "OpenAI environment variables",
  );
}

export function getServerSentryEnv() {
  return parseOptionalEnv(
    sentryServerEnvSchema,
    {
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      NEXT_PUBLIC_SENTRY_ENVIRONMENT:
        process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
        process.env.SENTRY_ENVIRONMENT,
    },
    "server Sentry environment variables",
  );
}
