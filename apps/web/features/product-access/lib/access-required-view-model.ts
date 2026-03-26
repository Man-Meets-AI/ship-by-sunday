import { assertNever } from "@/features/course/lesson/lib/assert";
import type {
	ProductAccess,
	ProductAccessStatus,
} from "@/features/product-access/lib/product-access";
import { workspaceDisplayConfig } from "@/features/starter/lib/starter-selectors";

export type AccessActionModel =
	| {
			kind: "retry";
			label: string;
			busyLabel: string;
			variant?: "default" | "secondary" | "outline";
	  }
	| {
			kind: "reauthenticate";
			label: string;
			signInHref: string;
			variant?: "default" | "secondary" | "outline";
	  }
	| {
			kind: "checkout";
			label: string;
	  }
	| {
			kind: "link";
			label: string;
			href: string;
			variant?: "default" | "secondary" | "outline";
	  };

export type AccessPathModel = {
	tone: "recovery" | "purchase";
	title: string;
	description: string;
	actions: readonly AccessActionModel[];
};

export type AccessViewState =
	| { kind: "loading" }
	| { kind: Exclude<ProductAccessStatus, "granted"> };

export type AccessViewModel = {
	title: string;
	shellSubtitle: string;
	helperCopy: string;
	accessStateLabel: string;
	signedInAccountHint?: string;
	statusCalloutTitle?: string;
	statusCalloutBody?: string;
	helpLeadCopy: string;
	helpItems: readonly string[];
	paths: readonly AccessPathModel[];
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

export function getAccessViewState(
	access: ProductAccess | undefined,
): AccessViewState {
	if (access === undefined || access.status === "granted") {
		return { kind: "loading" };
	}

	return { kind: access.status };
}

export function getAccessViewModel({
	viewState,
	signInHref,
	homeHref,
	pricingHref,
}: {
	viewState: AccessViewState;
	signInHref: string;
	homeHref: string;
	pricingHref: string;
}): AccessViewModel {
	const openWorkspaceLabel = workspaceDisplayConfig.openHomeActionLabel;
	const backHome = {
		kind: "link" as const,
		label: "Back home",
		href: homeHref,
		variant: "secondary" as const,
	};
	const seeOffer = {
		kind: "link" as const,
		label: "Review pricing",
		href: pricingHref,
		variant: "outline" as const,
	};
	const signIn = {
		kind: "link" as const,
		label: "Sign in",
		href: signInHref,
	};
	const reauthenticate = {
		kind: "reauthenticate" as const,
		label: "Sign out and sign back in",
		signInHref,
	};
	const retryAccessCheck = {
		kind: "retry" as const,
		label: "Retry access check",
		busyLabel: "Refreshing access...",
	};
	const retrySecondary = {
		kind: "retry" as const,
		label: "Retry access check",
		busyLabel: "Refreshing access...",
		variant: "secondary" as const,
	};

	switch (viewState.kind) {
		case "loading":
			return {
				title: "Checking product access",
				shellSubtitle:
					"We’re checking whether this signed-in account already has product access.",
				helperCopy:
					"We’re checking your purchase status in the background so we can send you into the protected product automatically.",
				accessStateLabel: "Checking access",
				statusCalloutTitle: "Checking product access",
				statusCalloutBody:
					"Keep this page open while we verify whether product access is ready.",
				helpLeadCopy:
					"If you just paid, keep this tab open while we finish the product access check.",
				helpItems: [
					"Stay on this page for a few seconds so the access check can finish.",
					`Use ${openWorkspaceLabel} if your product access was already granted.`,
					"Retry checkout only if this account still needs access.",
				],
				paths: [
					{
						tone: "recovery",
						title: "Already paid",
						description:
							"Use this path if you already bought access and just need the account check to catch up.",
						actions: [retryAccessCheck, backHome],
					},
					{
						tone: "purchase",
						title: "Need to buy access",
						description:
							"If you already paid, wait for the access check first. Buy access only if this account still needs it.",
						actions: [seeOffer],
					},
				],
			};
		case "signed_out":
			return {
				title: "Sign in to check your product access",
				shellSubtitle:
					"Use the same account you used at checkout so we can reconnect your product access.",
				helperCopy:
					"If you already paid, sign in with the same email you used at checkout. If you have not purchased yet, review the offer before starting checkout.",
				accessStateLabel: "Sign-in required",
				helpLeadCopy:
					"If purchase happened on a different account, switch to that login first.",
				helpItems: [
					"Sign in with the same email used at checkout.",
					"Return here after sign-in so we can check access again.",
					"Use instant access only if this account has not purchased yet.",
				],
				paths: [
					{
						tone: "recovery",
						title: "Already paid",
						description:
							"Sign in with the same account used at checkout so we can reconnect product access.",
						actions: [signIn, backHome],
					},
					{
						tone: "purchase",
						title: "Need to buy access",
						description:
							"If you have already purchased, sign in first. Only buy access if this account has not purchased yet.",
						actions: [{ ...signIn, label: "Sign in first" }, seeOffer],
					},
				],
			};
		case "token_missing":
			return {
				title: "Refresh your account session",
				shellSubtitle:
					"We found your account, but we could not verify product access from this session yet.",
				helperCopy:
					"This usually means your signed-in browser session needs one more refresh before we can check product access.",
				accessStateLabel: "Session refresh needed",
				signedInAccountHint:
					"If this is not the email you used at checkout, sign out and switch accounts before retrying access.",
				helpLeadCopy:
					"Start with a retry. If the account check still fails, sign out and sign back in to mint a fresh session token.",
				helpItems: [
					"Retry the access check first.",
					"Sign out and sign back in if the session still does not refresh.",
					"Do not buy access again until the account check succeeds.",
				],
				paths: [
					{
						tone: "recovery",
						title: "Refresh account access",
						description:
							"Retry the access check now. If the session still looks stale, sign out and sign back in, then come back here.",
						actions: [retryAccessCheck, reauthenticate, backHome],
					},
					{
						tone: "purchase",
						title: "Hold off on buying again",
						description:
							"This looks like an account session problem, not a missing purchase. Refresh your session before starting a new checkout.",
						actions: [seeOffer],
					},
				],
			};
		case "no_access":
			return {
				title: "Access not attached to this account",
				shellSubtitle:
					"This signed-in account does not have product access yet.",
				helperCopy:
					"We could not find active product access on this account. Most people here either just completed checkout and need a few more seconds, or they are signed into a different email than the one used at purchase.",
				accessStateLabel: "No active product access found",
				signedInAccountHint:
					"If this is not the email you used at checkout, switch accounts before retrying or starting a new purchase.",
				helpLeadCopy:
					"If purchase happened on a different account, switch to that login first.",
				helpItems: [
					"Retry the access check if you already paid.",
					"Sign in with the same email used at checkout.",
					"Use instant access if this account has not purchased yet.",
				],
				paths: [
					{
						tone: "recovery",
						title: "Already paid",
						description:
							"Use this path if you already bought access and need the account lookup to catch up.",
						actions: [retryAccessCheck, backHome],
					},
					{
						tone: "purchase",
						title: "Need to buy access",
						description:
							"If you completed checkout already, use retry access check first. Buy access only if this account has not purchased yet.",
						actions: [{ kind: "checkout", label: "Buy access now" }, seeOffer],
					},
				],
			};
		case "pending":
			return {
				title: "Product access is still processing",
				shellSubtitle:
					"This account has a product access record, but it is not granted yet.",
				helperCopy:
					"Your purchase looks close, but product access is still waiting on a final update.",
				accessStateLabel: "Product access pending",
				signedInAccountHint:
					"Stay on this account while the payment handoff finishes. If checkout used a different email, switch accounts before retrying.",
				helpLeadCopy:
					"Wait a moment, then retry the access check from the same account.",
				helpItems: [
					"Give the payment handoff another moment to finish.",
					"Retry the access check from this account.",
					"Do not start a second checkout while access is pending.",
				],
				paths: [
					{
						tone: "recovery",
						title: "Already paid",
						description:
							"Your purchase appears to be in flight. Retry the access check after a short wait.",
						actions: [retryAccessCheck, backHome],
					},
					{
						tone: "purchase",
						title: "Need to buy access",
						description:
							"Hold off on a new checkout while the current product access record is still pending.",
						actions: [seeOffer],
					},
				],
			};
		case "revoked":
			return {
				title: "Product access is no longer active",
				shellSubtitle:
					"This account had product access before, but it is no longer granted.",
				helperCopy:
					"We found a previous product access record for this account, but it is not currently active.",
				accessStateLabel: "Product access revoked",
				signedInAccountHint:
					"Make sure this is the original purchase email before retrying access or starting a new checkout.",
				helpLeadCopy:
					"Start by confirming you are signed into the purchase account, then retry the access check.",
				helpItems: [
					"Sign in with the original purchase account if needed.",
					"Retry the access check after switching accounts.",
					"Review the offer before starting a new checkout.",
				],
				paths: [
					{
						tone: "recovery",
						title: "Already paid",
						description:
							"Retry the access check after confirming you are using the correct account.",
						actions: [retrySecondary, reauthenticate, backHome],
					},
					{
						tone: "purchase",
						title: "Need to buy access",
						description:
							"Review the offer before buying again. This account already has a previous access record.",
						actions: [seeOffer],
					},
				],
			};
		case "refunded":
			return {
				title: "Product access is no longer active",
				shellSubtitle: "This account has a refunded product access record.",
				helperCopy:
					"We found a previous purchase on this account, but product access is no longer active.",
				accessStateLabel: "Product access refunded",
				signedInAccountHint:
					"Confirm this is the purchase email before you retry access or decide to buy again.",
				helpLeadCopy:
					"Confirm you are using the correct account, then decide whether you need to buy access again.",
				helpItems: [
					"Retry the access check after switching to the purchase account.",
					"Review the offer before starting a new checkout.",
					"Do not buy again until you are sure this is the right account.",
				],
				paths: [
					{
						tone: "recovery",
						title: "Already paid",
						description:
							"Use retry after confirming you are in the right account. This access record is no longer active.",
						actions: [retrySecondary, reauthenticate, backHome],
					},
					{
						tone: "purchase",
						title: "Need to buy access",
						description:
							"If you still want access on this account, review the offer before starting a new checkout.",
						actions: [seeOffer],
					},
				],
			};
	}

	return assertNever(viewState, "Unhandled access view state");
}
