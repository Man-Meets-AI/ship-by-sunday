"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { Toaster } from "sonner";

import { UserBootstrapProvider } from "@/components/providers/user-bootstrap";
import { convex } from "@/lib/convex/client";
import { getClientAnalyticsEnv } from "@/lib/env/client";

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    const analyticsEnv = getClientAnalyticsEnv();

    if (!analyticsEnv) {
      return;
    }

    posthog.init(analyticsEnv.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: analyticsEnv.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: "history_change",
      capture_pageleave: true,
      defaults: "2026-01-30",
      person_profiles: "identified_only",
    });
  }, []);

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <PostHogProvider client={posthog}>
        <UserBootstrapProvider>
          {children}
          <Toaster richColors position="top-right" />
        </UserBootstrapProvider>
      </PostHogProvider>
    </ConvexProviderWithClerk>
  );
}
