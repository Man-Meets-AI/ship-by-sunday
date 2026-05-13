import { describe, expect, it, vi } from "vitest";

import { resolveRecoveredWorkspace } from "./users";

type QueryOperator = {
  eq: (field: string, value: unknown) => QueryOperator;
};

describe("resolveRecoveredWorkspace", () => {
  it("reattaches the canonical user to a recovered personal workspace", async () => {
    const membershipInserts: Array<Record<string, unknown>> = [];
    const memberships = [
      {
        _id: "membership_duplicate",
        createdAt: 1,
        role: "owner",
        userId: "user_duplicate",
        workspaceId: "workspace_personal",
      },
    ];
    const workspace = {
      _id: "workspace_personal",
      createdAt: 1,
      createdByUserId: "user_duplicate",
      name: "Starter",
      personalOwnerAuthSubject: "clerk_user_123",
      slug: "starter-workspace",
      updatedAt: 1,
    };
    const db = {
      get: vi.fn(async (id: string) => (id === workspace._id ? workspace : null)),
      insert: vi.fn(async (_table: string, value: Record<string, unknown>) => {
        membershipInserts.push(value);
        return "membership_canonical";
      }),
      patch: vi.fn(),
      query: vi.fn((table: string) => ({
        withIndex: vi.fn((_indexName: string, cb: (query: QueryOperator) => unknown) => {
          const filters: Record<string, unknown> = {};
          const queryOperator: QueryOperator = {
            eq(field: string, value: unknown) {
              filters[field] = value;
              return queryOperator;
            },
          };

          cb(queryOperator);

          return {
            collect: vi.fn(async () => {
              if (table === "workspaces") {
                return filters.personalOwnerAuthSubject === "clerk_user_123"
                  ? [workspace]
                  : [];
              }

              if (table === "memberships") {
                return memberships.filter(
                  (membership) =>
                    membership.workspaceId === filters.workspaceId &&
                    membership.userId === filters.userId,
                );
              }

              return [];
            }),
            unique: vi.fn(async () => {
              if (table === "memberships") {
                return (
                  memberships.find(
                    (membership) =>
                      membership.workspaceId === filters.workspaceId &&
                      membership.userId === filters.userId,
                  ) ?? null
                );
              }

              return null;
            }),
          };
        }),
      })),
    };

    const workspaceId = await resolveRecoveredWorkspace({
      authSubject: "clerk_user_123",
      db: db as never,
      userId: "user_canonical",
      usersForSubject: [
        {
          _id: "user_canonical",
          authProvider: "clerk",
          authSubject: "clerk_user_123",
          createdAt: 1,
          updatedAt: 1,
        },
        {
          _id: "user_duplicate",
          authProvider: "clerk",
          authSubject: "clerk_user_123",
          createdAt: 2,
          defaultWorkspaceId: "workspace_personal",
          updatedAt: 2,
        },
      ],
    });

    expect(workspaceId).toBe("workspace_personal");
    expect(membershipInserts).toEqual([
      {
        createdAt: expect.any(Number),
        role: "owner",
        userId: "user_canonical",
        workspaceId: "workspace_personal",
      },
    ]);
  });
});
