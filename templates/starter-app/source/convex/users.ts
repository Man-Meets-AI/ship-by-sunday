import { v } from "convex/values";
import {
  makeFunctionReference,
  mutationGeneric as mutation,
  queryGeneric as query,
} from "convex/server";

import { getCurrentUser, getCurrentUserOrThrow } from "./auth";
import type {
  AuthLike,
  DatabaseLike,
  SchedulerLike,
  UserDoc,
  WorkspaceDoc,
} from "./types";
import {
  createPersonalWorkspace,
  ensureWorkspaceMembership,
  getPersonalWorkspaceForSubject,
} from "./workspaces";

const sendWelcomeEmail = makeFunctionReference<"action">(
  "notifications:sendWelcomeEmail",
);

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

async function listUsersForSubject(db: DatabaseLike, authSubject: string) {
  return (await db
    .query("users")
    .withIndex("by_auth_subject", (query) =>
      query.eq("authProvider", "clerk").eq("authSubject", authSubject),
    )
    .collect()) as UserDoc[];
}

export async function resolveRecoveredWorkspace(args: {
  authSubject: string;
  db: DatabaseLike;
  userId: string;
  usersForSubject: UserDoc[];
}) {
  const duplicateUserIds = new Set(args.usersForSubject.map((user) => user._id));
  const candidateWorkspaceId = args.usersForSubject.find(
    (user) => user.defaultWorkspaceId,
  )?.defaultWorkspaceId;

  if (candidateWorkspaceId) {
    const workspace = (await args.db.get(candidateWorkspaceId)) as WorkspaceDoc | null;

    if (
      workspace &&
      (workspace.personalOwnerAuthSubject === args.authSubject ||
        duplicateUserIds.has(workspace.createdByUserId))
    ) {
      await ensureWorkspaceMembership({
        db: args.db,
        workspaceId: workspace._id,
        userId: args.userId,
      });

      return workspace._id;
    }
  }

  const personalWorkspace = await getPersonalWorkspaceForSubject(args.db, args.authSubject);

  if (personalWorkspace) {
    await ensureWorkspaceMembership({
      db: args.db,
      workspaceId: personalWorkspace._id,
      userId: args.userId,
    });

    return personalWorkspace._id;
  }

  return null;
}

export const current = query({
  args: {},
  handler: async (ctx) => {
    const typedCtx = ctx as unknown as { db: DatabaseLike };
    const user = await getCurrentUser(ctx);

    if (!user) {
      return null;
    }

    const workspace = user.defaultWorkspaceId
      ? ((await typedCtx.db.get(user.defaultWorkspaceId)) as WorkspaceDoc | null)
      : null;

    return {
      user,
      workspace,
    };
  },
});

export const syncCurrentUserProfile = mutation({
  args: {
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const typedCtx = ctx as unknown as {
      auth: AuthLike;
      db: DatabaseLike;
      scheduler: SchedulerLike;
    };
    const identity = await typedCtx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const now = Date.now();
    const existingUsers = sortUsers(
      await listUsersForSubject(typedCtx.db, identity.subject),
    );
    const existing = existingUsers[0];

    if (existing) {
      const patch: {
        email?: string;
        imageUrl?: string;
        name?: string;
        defaultWorkspaceId?: typeof existing.defaultWorkspaceId;
        updatedAt: number;
      } = {
        updatedAt: now,
      };

      if (args.email !== undefined && args.email !== existing.email) {
        patch.email = args.email;
      }

      if (args.imageUrl !== undefined && args.imageUrl !== existing.imageUrl) {
        patch.imageUrl = args.imageUrl;
      }

      if (args.name !== undefined && args.name !== existing.name) {
        patch.name = args.name;
      }

      const existingWorkspaceId =
        existing.defaultWorkspaceId ??
        (await resolveRecoveredWorkspace({
          authSubject: identity.subject,
          db: typedCtx.db,
          userId: existing._id,
          usersForSubject: existingUsers,
        }));

      if (existingWorkspaceId && existing.defaultWorkspaceId !== existingWorkspaceId) {
        patch.defaultWorkspaceId = existingWorkspaceId;
      }

      if (!existingWorkspaceId) {
        const { workspaceId } = await createPersonalWorkspace(typedCtx, {
          authSubject: identity.subject,
          userId: existing._id,
          preferredName: args.name ?? "Personal",
        });

        patch.defaultWorkspaceId = workspaceId;
      }

      await typedCtx.db.patch(existing._id, patch);
      return existing._id;
    }

    const userId = await typedCtx.db.insert("users", {
      authProvider: "clerk",
      authSubject: identity.subject,
      email: args.email,
      imageUrl: args.imageUrl,
      name: args.name,
      createdAt: now,
      updatedAt: now,
    });

    const { created, workspaceId } = await createPersonalWorkspace(typedCtx, {
      authSubject: identity.subject,
      userId,
      preferredName: args.name ?? "Personal",
    });

    await typedCtx.db.patch(userId, {
      defaultWorkspaceId: workspaceId,
      updatedAt: now,
    });

    if (created && args.email) {
      await typedCtx.scheduler.runAfter(0, sendWelcomeEmail, {
        email: args.email,
        name: args.name,
        workspaceName: `${args.name ?? "Personal"}'s Workspace`,
      });
    }

    return userId;
  },
});

export const requireCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    return user;
  },
});
