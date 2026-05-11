import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { requireConvexEnv } from "./env";
import { retryFailedSupportVisitorMessage } from "./support";
import type {
	SupportOperationsSnapshot,
	SupportThreadState,
} from "./support/model";
import {
	supportOperationsSnapshotValidator,
	supportThreadStateValidator,
} from "./support/validators";

export const retryFailedVisitorMessage = action({
	args: {
		messageId: v.id("supportMessages"),
		recoveryToken: v.string(),
	},
	returns: supportThreadStateValidator,
	handler: async (ctx, args): Promise<SupportThreadState> => {
		const expectedToken = requireConvexEnv(
			"TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN",
		);
		if (args.recoveryToken !== expectedToken) {
			throw new Error("Invalid support recovery token.");
		}

		return await retryFailedSupportVisitorMessage(ctx, args.messageId);
	},
});

export const getOperationsSnapshot = action({
	args: {
		recoveryToken: v.string(),
	},
	returns: supportOperationsSnapshotValidator,
	handler: async (ctx, args): Promise<SupportOperationsSnapshot> => {
		const expectedToken = requireConvexEnv(
			"TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN",
		);
		if (args.recoveryToken !== expectedToken) {
			throw new Error("Invalid support recovery token.");
		}

		return await ctx.runQuery(
			internal.support.getSupportOperationsSnapshot,
			{},
		);
	},
});
