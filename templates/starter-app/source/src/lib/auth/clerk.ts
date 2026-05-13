"server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getViewerAuthSubject() {
  const { userId } = await auth();

  return userId ?? null;
}

export async function getViewerIdentity() {
  const userId = await getViewerAuthSubject();

  if (!userId) {
    return null;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return {
    authProvider: "clerk" as const,
    authSubject: userId,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    imageUrl: user?.imageUrl ?? null,
    name: fullName || user?.username || null,
  };
}

export async function requireViewerIdentity() {
  const identity = await getViewerIdentity();

  if (!identity) {
    throw new Error("Expected an authenticated viewer.");
  }

  return identity;
}
