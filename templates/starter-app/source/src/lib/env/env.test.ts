import { afterEach, describe, expect, it } from "vitest";

import {
  parseClientEnv,
  parseOptionalClientAnalyticsEnv,
  parseOptionalClientSentryEnv,
} from "@/lib/env/client";
import { DEFAULT_DEVELOPMENT_APP_URL } from "@/lib/env/app-url";
import { getBillingEnvIfConfigured, parseServerEnv } from "@/lib/env/server";

const baseEnv = {
  CLERK_JWT_ISSUER_DOMAIN: "https://example.clerk.accounts.dev",
  CLERK_SECRET_KEY: "sk_test_example",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_example",
  NEXT_PUBLIC_CONVEX_URL: "https://example.convex.cloud",
  NEXT_PUBLIC_POSTHOG_HOST: "https://us.i.posthog.com",
  NEXT_PUBLIC_POSTHOG_KEY: "phc_example",
  NEXT_PUBLIC_SENTRY_DSN: "https://public@example.ingest.sentry.io/123456",
  POSTHOG_API_KEY: "phx_example",
  RESEND_API_KEY: "re_example",
  RESEND_FROM_EMAIL: "hello@example.com",
  SENTRY_AUTH_TOKEN: "token",
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: "test",
  SENTRY_ORG: "example-org",
  SENTRY_PROJECT: "example-project",
  CONVEX_WEBHOOK_MUTATION_SECRET: "convex_webhook_secret",
  STRIPE_PRICE_PRO_MONTHLY: "price_example",
  STRIPE_SECRET_KEY: "sk_test_example",
  STRIPE_WEBHOOK_SECRET: "whsec_example",
} as const;

const originalNodeEnv = process.env.NODE_ENV;

function setNodeEnv(nodeEnv: string | undefined) {
  Object.assign(process.env, { NODE_ENV: nodeEnv });
}

function restoreEnv(originalEnv: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

afterEach(() => {
  setNodeEnv(originalNodeEnv);
});

describe("env validation", () => {
  it("accepts a valid client env payload", () => {
    expect(
      parseClientEnv({
        NEXT_PUBLIC_APP_URL: baseEnv.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
          baseEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        NEXT_PUBLIC_CONVEX_URL: baseEnv.NEXT_PUBLIC_CONVEX_URL,
      }),
    ).toMatchObject({
      NEXT_PUBLIC_APP_URL: baseEnv.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_CONVEX_URL: baseEnv.NEXT_PUBLIC_CONVEX_URL,
    });
  });

  it("falls back to localhost for client env during development", () => {
    setNodeEnv("development");

    expect(
      parseClientEnv({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
          baseEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        NEXT_PUBLIC_CONVEX_URL: baseEnv.NEXT_PUBLIC_CONVEX_URL,
      }),
    ).toMatchObject({
      NEXT_PUBLIC_APP_URL: DEFAULT_DEVELOPMENT_APP_URL,
      NEXT_PUBLIC_CONVEX_URL: baseEnv.NEXT_PUBLIC_CONVEX_URL,
    });
  });

  it("still rejects a missing client app url outside development", () => {
    setNodeEnv("test");

    expect(() =>
      parseClientEnv({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
          baseEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        NEXT_PUBLIC_CONVEX_URL: baseEnv.NEXT_PUBLIC_CONVEX_URL,
      }),
    ).toThrow(/Invalid public environment variables/);
  });

  it("treats client analytics env as optional unless partially configured", () => {
    expect(parseOptionalClientAnalyticsEnv({})).toBeNull();
    expect(() =>
      parseOptionalClientAnalyticsEnv({
        NEXT_PUBLIC_POSTHOG_HOST: baseEnv.NEXT_PUBLIC_POSTHOG_HOST,
      }),
    ).toThrow(/Invalid public analytics environment variables/);
  });

  it("treats client Sentry env as optional unless partially configured", () => {
    expect(parseOptionalClientSentryEnv({})).toBeNull();
    expect(() =>
      parseOptionalClientSentryEnv({
        NEXT_PUBLIC_SENTRY_DSN: baseEnv.NEXT_PUBLIC_SENTRY_DSN,
      }),
    ).toThrow(/Invalid public Sentry environment variables/);
  });

  it("rejects an invalid server env payload", () => {
    expect(() =>
      parseServerEnv({
        ...baseEnv,
        NEXT_PUBLIC_APP_URL: "not-a-url",
      }),
    ).toThrow(/Invalid server environment variables/);
  });

  it("accepts a fully valid server env payload", () => {
    expect(
      parseServerEnv({
        ...baseEnv,
        RESEND_FROM_EMAIL: "Starter Stack <hello@example.com>",
      }),
    ).toMatchObject({
      STRIPE_PRICE_PRO_MONTHLY: baseEnv.STRIPE_PRICE_PRO_MONTHLY,
      RESEND_FROM_EMAIL: "Starter Stack <hello@example.com>",
    });
  });

  it("falls back to localhost for server env during development", () => {
    setNodeEnv("development");

    expect(
      parseServerEnv({
        ...baseEnv,
        NEXT_PUBLIC_APP_URL: undefined,
        RESEND_FROM_EMAIL: "Starter Stack <hello@example.com>",
      }),
    ).toMatchObject({
      NEXT_PUBLIC_APP_URL: DEFAULT_DEVELOPMENT_APP_URL,
      STRIPE_PRICE_PRO_MONTHLY: baseEnv.STRIPE_PRICE_PRO_MONTHLY,
    });
  });

  it("treats billing env as optional when it is entirely unset", () => {
    const originalBillingEnv = {
      CONVEX_WEBHOOK_MUTATION_SECRET:
        process.env.CONVEX_WEBHOOK_MUTATION_SECRET,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    };

    delete process.env.CONVEX_WEBHOOK_MUTATION_SECRET;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.STRIPE_PRICE_PRO_MONTHLY;
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;

    try {
      expect(getBillingEnvIfConfigured()).toBeNull();
    } finally {
      restoreEnv(originalBillingEnv);
    }
  });

  it("still fails loudly when billing env is only partially configured", () => {
    const originalBillingEnv = {
      CONVEX_WEBHOOK_MUTATION_SECRET:
        process.env.CONVEX_WEBHOOK_MUTATION_SECRET,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    };

    process.env.CONVEX_WEBHOOK_MUTATION_SECRET = "convex_webhook_secret";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    delete process.env.STRIPE_PRICE_PRO_MONTHLY;
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;

    try {
      expect(() => getBillingEnvIfConfigured()).toThrow(
        /Invalid billing environment variables/,
      );
    } finally {
      restoreEnv(originalBillingEnv);
    }
  });
});
