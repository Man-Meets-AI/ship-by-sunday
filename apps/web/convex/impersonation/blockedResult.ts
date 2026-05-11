import { v } from "convex/values";

import type { ImpersonationBlockReason } from "./types";
import { impersonationBlockReasonValidator } from "./validators";

export type SupportModeBlockedMutationResult = {
	kind: "support_mode_blocked";
	reason: ImpersonationBlockReason;
};

export const supportModeBlockedMutationResultValidator = v.object({
	kind: v.literal("support_mode_blocked"),
	reason: impersonationBlockReasonValidator,
});

export function createSupportModeBlockedMutationResult(
	reason: ImpersonationBlockReason,
): SupportModeBlockedMutationResult {
	return {
		kind: "support_mode_blocked",
		reason,
	};
}
