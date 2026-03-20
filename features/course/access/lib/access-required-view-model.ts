import { assertNever } from "@/features/course/lesson/lib/assert";

export type ViewerAccess =
	| {
			hasAccess: boolean;
			status: string;
	  }
	| undefined;

export type AccessViewState =
	| { kind: "loading" }
	| { kind: "signed_out" }
	| { kind: "missing_access"; status: string };

export type AccessViewModel = {
	title: string;
	shellSubtitle: string;
	helperCopy: string;
	accessStateLabel: string;
	purchaseDecisionDescription: string;
	alreadyPaidDescription: string;
	helpLeadCopy: string;
	helpItems: readonly string[];
};

export function formatRefreshTime(timestamp: number | null) {
	if (!timestamp) {
		return null;
	}

	return new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit",
	}).format(timestamp);
}

export function getAccessViewState(access: ViewerAccess): AccessViewState {
	if (access === undefined) {
		return { kind: "loading" };
	}

	if (access.status === "signed_out" || access.status === "missing_token") {
		return { kind: "signed_out" };
	}

	return {
		kind: "missing_access",
		status: access.status,
	};
}

export function getAccessViewModel(viewState: AccessViewState): AccessViewModel {
	switch (viewState.kind) {
		case "loading":
			return {
				title: "Checking access",
				shellSubtitle:
					"We’re checking whether this signed-in account already has access.",
				helperCopy:
					"We’re checking your purchase status in the background so we can send you into Ship by Sunday automatically.",
				accessStateLabel: "Purchase sync in progress",
				purchaseDecisionDescription:
					"If you already paid, keep this page open. If nothing changes after a short wait, you can still check mission manually.",
				alreadyPaidDescription:
					"Use this path if you already bought Ship by Sunday and just need the access grant to catch up with your account.",
				helpLeadCopy:
					"If you just paid, keep this tab open while we refresh your entitlement.",
				helpItems: [
					"Stay on this page for a few seconds so purchase sync can finish.",
					"Use Open mission if your access was already granted.",
					"Retry checkout if you still need to unlock access.",
				],
			};
		case "signed_out":
			return {
				title: "Sign in to check your access",
				shellSubtitle:
					"Use the same account you used at checkout so we can reconnect your access.",
				helperCopy:
					"If you already paid, sign in with the same email you used at checkout. If you have not purchased yet, review the offer before starting checkout.",
				accessStateLabel: "Sign-in required",
				purchaseDecisionDescription:
					"If you have already purchased, sign in with the same email you used at checkout before trying anything else.",
				alreadyPaidDescription:
					"Use this path if you already bought Ship by Sunday and need to sign in with the same account used at checkout.",
				helpLeadCopy:
					"If purchase happened on a different account, switch to that login first.",
				helpItems: [
					"Open mission to retry entitlement lookup.",
					"Sign in with the same email used at checkout.",
					"Use instant access if this account has not purchased yet.",
				],
			};
		case "missing_access":
			return {
				title: "Access not attached to this account",
				shellSubtitle:
					"This signed-in account does not have Ship by Sunday access yet.",
				helperCopy:
					"We could not find an active Ship by Sunday entitlement on this account. Most people here either just completed checkout and need a few more seconds, or they are signed into a different email than the one used at purchase.",
				accessStateLabel:
					viewState.status === "none"
						? "No active entitlement found"
						: `Entitlement status: ${viewState.status}`,
				purchaseDecisionDescription:
					"If you completed checkout already, use retry access check first. Buy access only if this account has not purchased yet.",
				alreadyPaidDescription:
					"Use this path if you already bought Ship by Sunday and just need the access grant to catch up with your account.",
				helpLeadCopy:
					"If purchase happened on a different account, switch to that login first.",
				helpItems: [
					"Open mission to retry entitlement lookup.",
					"Sign in with the same email used at checkout.",
					"Use instant access if this account has not purchased yet.",
				],
			};
	}

	return assertNever(viewState, "Unhandled access view state");
}
