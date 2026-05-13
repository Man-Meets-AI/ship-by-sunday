"server-only";

import { api } from "@convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";

import { requireConvexToken } from "@/lib/auth/convex";
import { requireViewerIdentity } from "@/lib/auth/clerk";

export async function ensureConvexViewerReady() {
  const token = await requireConvexToken();
  const identity = await requireViewerIdentity();
  const currentViewer = await fetchQuery(api.users.current, {}, { token });

  if (!currentViewer?.user || !currentViewer.workspace) {
    await fetchMutation(
      api.users.syncCurrentUserProfile,
      {
        email: identity.email ?? undefined,
        imageUrl: identity.imageUrl ?? undefined,
        name: identity.name ?? undefined,
      },
      { token },
    );
  }

  return {
    identity,
    token,
  };
}
