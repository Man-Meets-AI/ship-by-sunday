import type { ImpersonationBlockReason } from "@/convex/impersonation/types";

export type SupportModeBlockedMutationResult = {
	kind: "support_mode_blocked";
	reason: ImpersonationBlockReason;
};

export function isSupportModeBlockedMutationResult(
	result: object | string | number | boolean | null | undefined,
): result is SupportModeBlockedMutationResult {
	return (
		typeof result === "object" &&
		result !== null &&
		"kind" in result &&
		result.kind === "support_mode_blocked"
	);
}

export function getSupportModeBlockedMutationMessage() {
	return "Action unavailable during support mode.";
}
