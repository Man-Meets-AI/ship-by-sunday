import { queryGeneric as query } from "convex/server";

import { requireCurrentWorkspace } from "./auth";
import type { DatabaseLike, MembershipDoc, WorkspaceDoc } from "./types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function ensureWorkspaceMembership(args: {
  db: DatabaseLike;
  workspaceId: string;
  userId: string;
  role?: "owner" | "admin" | "member";
}) {
  const existingMembership = await args.db
    .query("memberships")
    .withIndex("by_workspace_user", (query) =>
      query.eq("workspaceId", args.workspaceId).eq("userId", args.userId),
    )
    .unique();

  if (existingMembership) {
    return existingMembership;
  }

  const createdAt = Date.now();
  const membershipId = await args.db.insert("memberships", {
    workspaceId: args.workspaceId,
    userId: args.userId,
    role: args.role ?? "owner",
    createdAt,
  });

  return {
    _id: membershipId,
    createdAt,
    role: args.role ?? "owner",
    userId: args.userId,
    workspaceId: args.workspaceId,
  };
}

export async function getPersonalWorkspaceForSubject(
  db: DatabaseLike,
  authSubject: string,
) {
  return (
    (
      await db
        .query("workspaces")
        .withIndex("by_personal_owner_auth_subject", (query) =>
          query.eq("personalOwnerAuthSubject", authSubject),
        )
        .collect()
    )
      .sort((left, right) => {
        const leftCreatedAt = left.createdAt as number;
        const rightCreatedAt = right.createdAt as number;

        if (leftCreatedAt !== rightCreatedAt) {
          return leftCreatedAt - rightCreatedAt;
        }

        return String(left._id).localeCompare(String(right._id));
      })[0] as WorkspaceDoc | undefined
  );
}

export async function createPersonalWorkspace(
  ctx: { db: DatabaseLike },
  args: {
    authSubject: string;
    userId: string;
    preferredName: string;
  },
) {
  const existingWorkspace = await getPersonalWorkspaceForSubject(
    ctx.db,
    args.authSubject,
  );

  if (existingWorkspace) {
    await ensureWorkspaceMembership({
      db: ctx.db,
      workspaceId: existingWorkspace._id,
      userId: args.userId,
    });

    return {
      created: false,
      workspaceId: existingWorkspace._id,
    };
  }

  const now = Date.now();
  const authSubjectSlug = slugify(args.authSubject).slice(-8);
  const baseSlug =
    slugify(`${args.preferredName}-workspace-${authSubjectSlug}`) ||
    `workspace-${authSubjectSlug || "personal"}`;
  let slug = baseSlug;
  let suffix = 1;

  while (
    await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (query) => query.eq("slug", slug))
      .unique()
  ) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const workspaceId = await ctx.db.insert("workspaces", {
    name: `${args.preferredName}'s Workspace`,
    slug,
    personalOwnerAuthSubject: args.authSubject,
    createdByUserId: args.userId,
    createdAt: now,
    updatedAt: now,
  });

  await ctx.db.insert("memberships", {
    workspaceId,
    userId: args.userId,
    role: "owner",
    createdAt: now,
  });

  return {
    created: true,
    workspaceId,
  };
}

export const current = query({
  args: {},
  handler: async (ctx) => {
    const { workspace, membership } = await requireCurrentWorkspace(ctx);

    return {
      workspace,
      membership,
    };
  },
});

export function isWorkspaceOwnerOrAdmin(membership: MembershipDoc) {
  return membership.role === "owner" || membership.role === "admin";
}
