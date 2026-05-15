import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMutationMock = vi.fn();
const fetchQueryMock = vi.fn();
const requireConvexTokenMock = vi.fn();
const requireViewerIdentityMock = vi.fn();

vi.mock("convex/nextjs", () => ({
  fetchMutation: fetchMutationMock,
  fetchQuery: fetchQueryMock,
}));

vi.mock("@/lib/auth/convex", () => ({
  requireConvexToken: requireConvexTokenMock,
}));

vi.mock("@/lib/auth/clerk", () => ({
  requireViewerIdentity: requireViewerIdentityMock,
}));

describe("ensureConvexViewerReady", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireConvexTokenMock.mockResolvedValue("convex-token");
    requireViewerIdentityMock.mockResolvedValue({
      authSubject: "user_123",
      email: "hello@example.com",
      imageUrl: "https://example.com/avatar.png",
      name: "Test User",
    });
  });

  it("reuses the existing synced viewer when Convex is already ready", async () => {
    fetchQueryMock.mockResolvedValue({
      user: { _id: "user_doc_123", defaultWorkspaceId: "workspace_123" },
      workspace: { _id: "workspace_123", name: "Starter" },
    });

    const { ensureConvexViewerReady } = await import("@/lib/auth/convex-viewer");
    const result = await ensureConvexViewerReady();

    expect(result).toEqual({
      identity: {
        authSubject: "user_123",
        email: "hello@example.com",
        imageUrl: "https://example.com/avatar.png",
        name: "Test User",
      },
      token: "convex-token",
    });
    expect(fetchMutationMock).not.toHaveBeenCalled();
  });

  it("syncs the viewer when Convex bootstrap data is missing", async () => {
    fetchQueryMock.mockResolvedValue(null);

    const { ensureConvexViewerReady } = await import("@/lib/auth/convex-viewer");
    await ensureConvexViewerReady();

    expect(fetchMutationMock).toHaveBeenCalledWith(
      expect.anything(),
      {
        email: "hello@example.com",
        imageUrl: "https://example.com/avatar.png",
        name: "Test User",
      },
      { token: "convex-token" },
    );
  });
});
