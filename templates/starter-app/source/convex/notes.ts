import { v } from "convex/values";
import { mutationGeneric as mutation, queryGeneric as query } from "convex/server";

import { requireCurrentWorkspace } from "./auth";
import { getEntitlement } from "./entitlements";
import {
  assertNoteCreationAllowed,
  normalizeNoteInput,
} from "../src/lib/notes/rules";

export const listForCurrentWorkspace = query({
  args: {},
  handler: async (ctx) => {
    const { workspace } = await requireCurrentWorkspace(ctx);

    return ctx.db
      .query("notes")
      .withIndex("by_workspace_updated_at", (query) =>
        query.eq("workspaceId", workspace._id),
      )
      .order("desc")
      .take(50);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const { user, workspace } = await requireCurrentWorkspace(ctx);
    const { title, body } = normalizeNoteInput(args);

    const notesUnlimited = await getEntitlement(
      ctx,
      workspace._id,
      "notes_unlimited",
    );

    if (!notesUnlimited?.enabled) {
      const existingNotes = await ctx.db
        .query("notes")
        .withIndex("by_workspace_updated_at", (query) =>
          query.eq("workspaceId", workspace._id),
        )
        .collect();

      assertNoteCreationAllowed({
        existingNoteCount: existingNotes.length,
        hasUnlimitedNotes: false,
      });
    }

    const now = Date.now();

    return ctx.db.insert("notes", {
      workspaceId: workspace._id,
      createdByUserId: user._id,
      title,
      body,
      createdAt: now,
      updatedAt: now,
    });
  },
});
