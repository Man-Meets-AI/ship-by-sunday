"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import posthog from "posthog-js";

type UserBootstrapStatus = "idle" | "syncing" | "synced" | "error";

type UserBootstrapContextValue = {
  errorMessage: string | null;
  retry: () => void;
  status: UserBootstrapStatus;
};

const UserBootstrapContext = createContext<UserBootstrapContextValue | null>(null);

export function UserBootstrapProvider({ children }: { children: ReactNode }) {
  const { isLoaded, user } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const syncCurrentUserProfile = useMutation(api.users.syncCurrentUserProfile);
  const [syncState, setSyncState] = useState<{
    errorMessage: string | null;
    status: UserBootstrapStatus;
    subject: string | null;
  }>({
    errorMessage: null,
    status: "idle",
    subject: null,
  });
  const [retryToken, setRetryToken] = useState(0);
  const syncStateRef = useRef(syncState);

  useEffect(() => {
    syncStateRef.current = syncState;
  }, [syncState]);

  useEffect(() => {
    if (!isLoaded || isLoading || !isAuthenticated || !user) {
      if (isLoaded && !user) {
        posthog.reset();
      }
      return;
    }

    const currentSyncState = syncStateRef.current;

    if (
      currentSyncState.subject === user.id &&
      (currentSyncState.status === "syncing" ||
        currentSyncState.status === "synced" ||
        currentSyncState.status === "error")
    ) {
      return;
    }
    const currentUser = user;
    let cancelled = false;

    void (async () => {
      try {
        setSyncState({
          errorMessage: null,
          status: "syncing",
          subject: currentUser.id,
        });
        await syncCurrentUserProfile({
          email: currentUser.primaryEmailAddress?.emailAddress,
          imageUrl: currentUser.imageUrl,
          name:
            [currentUser.firstName, currentUser.lastName]
              .filter(Boolean)
              .join(" ") ||
            currentUser.username ||
            undefined,
        });

        if (cancelled) {
          return;
        }

        posthog.identify(currentUser.id, {
          email: currentUser.primaryEmailAddress?.emailAddress,
          name:
            [currentUser.firstName, currentUser.lastName]
              .filter(Boolean)
              .join(" ") ||
            currentUser.username ||
            undefined,
        });
        setSyncState({
          errorMessage: null,
          status: "synced",
          subject: currentUser.id,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setSyncState({
          errorMessage:
            error instanceof Error
              ? error.message
              : "Could not finish account setup.",
          status: "error",
          subject: currentUser.id,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    isLoaded,
    isLoading,
    retryToken,
    syncCurrentUserProfile,
    user,
  ]);

  const status =
    !isLoaded || !user || !isAuthenticated
      ? "idle"
      : syncState.subject === user.id
        ? syncState.status
        : "idle";
  const errorMessage =
    syncState.subject === user?.id ? syncState.errorMessage : null;

  const value = useMemo<UserBootstrapContextValue>(
    () => ({
      errorMessage,
      retry: () => {
        setSyncState({
          errorMessage: null,
          status: "idle",
          subject: null,
        });
        setRetryToken((value) => value + 1);
      },
      status,
    }),
    [errorMessage, status],
  );

  return (
    <UserBootstrapContext.Provider value={value}>
      {children}
    </UserBootstrapContext.Provider>
  );
}

export function useUserBootstrapStatus() {
  const context = useContext(UserBootstrapContext);

  if (!context) {
    throw new Error("useUserBootstrapStatus must be used within UserBootstrapProvider.");
  }

  return context;
}
