import type { DatabaseLike } from "./types";

type Ctx = { db: DatabaseLike };

export async function getMembershipByWorkspaceAndUser(
  ctx: Ctx,
  workspaceId: string,
  userId: string,
) {
  return ctx.db
    .query("memberships")
    .withIndex("by_workspace_user", (query) =>
      query.eq("workspaceId", workspaceId).eq("userId", userId),
    )
    .unique();
}
