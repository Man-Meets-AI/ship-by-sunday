import type {
  AuthLike,
  DatabaseLike,
  MembershipDoc,
  UserDoc,
  WorkspaceDoc,
} from "./types";
import { canManageBillingRole } from "../src/lib/auth/roles";

type Ctx = {
  auth: AuthLike;
  db: DatabaseLike;
};

function sortUsers(users: UserDoc[]) {
  return [...users].sort((left, right) => {
    if (left.defaultWorkspaceId && !right.defaultWorkspaceId) {
      return -1;
    }

    if (!left.defaultWorkspaceId && right.defaultWorkspaceId) {
      return 1;
    }

    if (left.createdAt !== right.createdAt) {
      return left.createdAt - right.createdAt;
    }

    return left._id.localeCompare(right._id);
  });
}

export async function getCurrentUser(ctx: unknown) {
  const typedCtx = ctx as Ctx;
  const identity = await typedCtx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  const users = (await typedCtx.db
    .query("users")
    .withIndex("by_auth_subject", (query) =>
      query.eq("authProvider", "clerk").eq("authSubject", identity.subject),
    )
    .collect()) as UserDoc[];

  return sortUsers(users)[0] ?? null;
}

export async function getCurrentUserOrThrow(ctx: unknown) {
  const user = await getCurrentUser(ctx);

  if (!user) {
    throw new Error("User must be synchronized before calling this function.");
  }

  return user;
}

export async function requireWorkspaceMember(
  ctx: unknown,
  workspaceId: string,
) {
  const typedCtx = ctx as Ctx;
  const user = await getCurrentUserOrThrow(ctx);
  const membership = (await typedCtx.db
    .query("memberships")
    .withIndex("by_workspace_user", (query) =>
      query.eq("workspaceId", workspaceId).eq("userId", user._id),
    )
    .unique()) as MembershipDoc | null;

  if (!membership) {
    throw new Error("You do not have access to this workspace.");
  }

  const workspace = (await typedCtx.db.get(workspaceId)) as WorkspaceDoc | null;

  if (!workspace) {
    throw new Error("Workspace not found.");
  }

  return { user, workspace, membership };
}

export async function requireCurrentWorkspace(ctx: unknown) {
  const user = await getCurrentUserOrThrow(ctx);

  if (!user.defaultWorkspaceId) {
    throw new Error("Current user does not have a default workspace.");
  }

  return requireWorkspaceMember(ctx, user.defaultWorkspaceId);
}

export function canManageBilling(membership: MembershipDoc) {
  return canManageBillingRole(membership.role);
}
