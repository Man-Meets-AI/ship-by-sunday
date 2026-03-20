import { ConvexError, v } from "convex/values";

import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import {
	codexConnectionReturnValidator,
	codexConnectionWriteResultValidator,
	codexRateLimitSnapshotsByIdValidator,
	codexRunWriteResultValidator,
} from "./codexValidators";

type CodexCtx = QueryCtx | MutationCtx;

async function requireViewer(ctx: CodexCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new ConvexError("Unauthorized");
	}

	return identity.subject;
}

async function getConnectionDocsByViewer(ctx: CodexCtx, clerkUserId: string) {
	return await ctx.db
		.query("codexConnections")
		.withIndex("by_clerk_user_id", (queryBuilder) =>
			queryBuilder.eq("clerkUserId", clerkUserId),
		)
		.collect();
}

export const getViewerConnection = query({
	args: {},
	returns: codexConnectionReturnValidator,
	handler: async (ctx) => {
		const clerkUserId = await requireViewer(ctx);
		const docs = await getConnectionDocsByViewer(ctx, clerkUserId);
		if (docs.length === 0) {
			return null;
		}

		return (
			docs.sort((left, right) => right.updatedAt - left.updatedAt)[0] ?? null
		);
	},
});

export const upsertViewerConnection = mutation({
	args: {
		authMode: v.union(v.literal("managed_chatgpt")),
		status: v.union(
			v.literal("connecting"),
			v.literal("connected"),
			v.literal("disconnected"),
			v.literal("error"),
		),
		accountId: v.optional(v.string()),
		planType: v.optional(v.string()),
		connectedAt: v.optional(v.number()),
		lastRateLimitSnapshot: v.optional(codexRateLimitSnapshotsByIdValidator),
	},
	returns: codexConnectionWriteResultValidator,
	handler: async (ctx, args) => {
		const clerkUserId = await requireViewer(ctx);
		const now = Date.now();
		const docs = await getConnectionDocsByViewer(ctx, clerkUserId);
		const latest =
			docs.sort((left, right) => right.updatedAt - left.updatedAt)[0] ?? null;

		const patch = {
			authMode: args.authMode,
			accountId: args.accountId,
			planType: args.planType,
			connectedAt: args.connectedAt,
			status: args.status,
			lastRateLimitSnapshot: args.lastRateLimitSnapshot,
			updatedAt: now,
		};

		if (latest) {
			await ctx.db.patch(latest._id, patch);

			// Keep a single active row per user to avoid stale duplicates over time.
			for (const duplicate of docs) {
				if (duplicate._id !== latest._id) {
					await ctx.db.delete(duplicate._id);
				}
			}

			return {
				connectionId: latest._id,
				updatedAt: now,
				mode: "patched" as const,
			};
		}

		const connectionId = await ctx.db.insert("codexConnections", {
			clerkUserId,
			...patch,
		});

		return {
			connectionId,
			updatedAt: now,
			mode: "inserted" as const,
		};
	},
});

export const recordRun = mutation({
	args: {
		lessonId: v.optional(v.string()),
		templateId: v.string(),
		status: v.union(v.literal("success"), v.literal("error")),
		latencyMs: v.optional(v.number()),
		errorCode: v.optional(v.string()),
	},
	returns: codexRunWriteResultValidator,
	handler: async (ctx, args) => {
		const userId = await requireViewer(ctx);
		const createdAt = Date.now();

		const runId = await ctx.db.insert("codexRuns", {
			userId,
			lessonId: args.lessonId,
			templateId: args.templateId,
			status: args.status,
			latencyMs: args.latencyMs,
			errorCode: args.errorCode,
			createdAt,
		});

		return {
			runId,
			createdAt,
		};
	},
});
