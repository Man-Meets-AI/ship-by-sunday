import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
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

async function sha256Hex(value: string) {
	const buffer = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(value),
	);
	return [...new Uint8Array(buffer)]
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}

async function recoveryTokenIsValid(candidateToken: string) {
	const expectedToken = requireConvexEnv(
		"TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN",
	);
	const [candidateHash, expectedHash] = await Promise.all([
		sha256Hex(candidateToken.trim()),
		sha256Hex(expectedToken.trim()),
	]);
	let mismatch = candidateHash.length ^ expectedHash.length;
	for (let index = 0; index < expectedHash.length; index += 1) {
		mismatch |=
			(candidateHash.charCodeAt(index) || 0) ^ expectedHash.charCodeAt(index);
	}
	return mismatch === 0;
}

async function assertSupportAdminRecoveryToken(
	ctx: ActionCtx,
	recoveryToken: string,
) {
	const accepted = await recoveryTokenIsValid(recoveryToken);
	await ctx.runMutation(internal.support.recordAdminRecoveryTokenAttempt, {
		accepted,
	});
	if (!accepted) {
		throw new Error("Invalid support recovery token.");
	}
}

export const retryFailedVisitorMessage = action({
	args: {
		messageId: v.id("supportMessages"),
		recoveryToken: v.string(),
	},
	returns: supportThreadStateValidator,
	handler: async (ctx, args): Promise<SupportThreadState> => {
		await assertSupportAdminRecoveryToken(ctx, args.recoveryToken);

		return await retryFailedSupportVisitorMessage(ctx, args.messageId);
	},
});

export const getOperationsSnapshot = action({
	args: {
		recoveryToken: v.string(),
	},
	returns: supportOperationsSnapshotValidator,
	handler: async (ctx, args): Promise<SupportOperationsSnapshot> => {
		await assertSupportAdminRecoveryToken(ctx, args.recoveryToken);

		return await ctx.runQuery(
			internal.support.getSupportOperationsSnapshot,
			{},
		);
	},
});
