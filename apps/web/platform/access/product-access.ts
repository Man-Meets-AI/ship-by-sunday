import "server-only";

import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { routeConfig } from "@/config/product";
import {
	claimCheckoutSessionForViewer,
	claimLatestPendingCheckoutForViewer,
	getCheckoutSessionForRecovery,
	getPendingCheckoutSessionIdFromCookie,
	getStripeCheckoutSessionEmail,
	isStripeCheckoutSessionForCourse,
	isStripeCheckoutSessionPaid,
} from "@/platform/billing/checkout/checkout-session-recovery";
import type { PaidCheckoutRecovery, ProductAccess } from "@/lib/product-access";
import { getConvexServerSession } from "@/platform/auth/convex-auth";

type ExistingCodebaseResumeDestination = {
	destination: string;
	kind: "existing_codebase_setup" | "fulfillment_choice";
	codebaseStageId: null;
	postReviewTargets: null;
};
type ServerResumeDestination = ExistingCodebaseResumeDestination;
export const stripeCheckoutSessionIdPattern = /^cs_(?:test|live)_[A-Za-z0-9]+$/;

async function refreshViewerProductAccess(token: string) {
	return (await fetchQuery(
		api.access.viewerProductAccess,
		{},
		{ token },
	)) as ProductAccess;
}

function withPendingCheckoutRecovery(
	access: ProductAccess,
	pendingCheckoutRecovery: PaidCheckoutRecovery,
): ProductAccess {
	return {
		...access,
		pendingCheckoutRecovery,
	};
}

async function getSignedOutPendingCheckoutRecovery(): Promise<PaidCheckoutRecovery | null> {
	const pendingCheckoutSessionId =
		await getPendingCheckoutSessionIdFromCookie();
	if (!pendingCheckoutSessionId) {
		return null;
	}
	if (!stripeCheckoutSessionIdPattern.test(pendingCheckoutSessionId)) {
		return null;
	}

	const session = await getCheckoutSessionForRecovery(pendingCheckoutSessionId);
	if (!session) {
		return null;
	}

	if (!isStripeCheckoutSessionForCourse(session)) {
		return null;
	}

	const checkoutEmail = getStripeCheckoutSessionEmail(session) ?? undefined;
	if (!isStripeCheckoutSessionPaid(session)) {
		return {
			kind: "payment_pending",
			sessionId: pendingCheckoutSessionId,
			paymentStatus: session.payment_status,
			checkoutEmail,
		};
	}

	if (!checkoutEmail) {
		return null;
	}

	return {
		kind: "sign_in_required",
		sessionId: pendingCheckoutSessionId,
		checkoutEmail,
	};
}

export async function getServerProductAccess(): Promise<ProductAccess> {
	const session = await getConvexServerSession();
	if (!session.userId) {
		const pendingCheckoutRecovery = await getSignedOutPendingCheckoutRecovery();

		return {
			clerkUserId: null,
			hasAccess: false,
			status: "signed_out",
			capabilities: [],
			...(pendingCheckoutRecovery ? { pendingCheckoutRecovery } : {}),
		};
	}

	if (!session.token) {
		return {
			clerkUserId: session.userId,
			hasAccess: false,
			status: "token_missing",
			capabilities: [],
		};
	}

	const access = await refreshViewerProductAccess(session.token);

	if (access.hasAccess) {
		return access;
	}

	const pendingCheckoutSessionId =
		await getPendingCheckoutSessionIdFromCookie();
	if (pendingCheckoutSessionId) {
		if (!stripeCheckoutSessionIdPattern.test(pendingCheckoutSessionId)) {
			return access;
		}
		const claimResult = await claimCheckoutSessionForViewer(
			pendingCheckoutSessionId,
		);
		if (claimResult.kind === "validated") {
			return await refreshViewerProductAccess(session.token);
		}
		if (
			claimResult.kind === "wrong_account" ||
			claimResult.kind === "sign_in_required" ||
			claimResult.kind === "payment_pending"
		) {
			return withPendingCheckoutRecovery(access, claimResult);
		}
	}

	const emailClaimResult = await claimLatestPendingCheckoutForViewer();
	if (emailClaimResult.kind === "validated") {
		return await refreshViewerProductAccess(session.token);
	}
	if (
		emailClaimResult.kind === "wrong_account" ||
		emailClaimResult.kind === "sign_in_required"
	) {
		return withPendingCheckoutRecovery(access, emailClaimResult);
	}

	return access;
}

export async function getServerResumeDestination(): Promise<ServerResumeDestination | null> {
	const access = await getServerProductAccess();
	if (!access.hasAccess) {
		return null;
	}

	return {
		destination: routeConfig.appHome,
		kind: "fulfillment_choice",
		codebaseStageId: null,
		postReviewTargets: null,
	};
}

export async function redirectGrantedHomeVisitor({
	allowMarketing,
}: {
	allowMarketing: boolean;
}) {
	if (allowMarketing) {
		return;
	}

	const resumeDestination = await getServerResumeDestination();
	if (resumeDestination?.destination) {
		redirect(resumeDestination.destination);
	}
}
