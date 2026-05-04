import "server-only";

import type { FunctionReturnType } from "convex/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { api } from "@/convex/_generated/api";
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

type ResumeDestination = FunctionReturnType<
	typeof api.codebase.getCodebaseResumeDestination
>;

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
		kind: "checkout_email_handoff_required",
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
			...(pendingCheckoutRecovery ? { pendingCheckoutRecovery } : {}),
		};
	}

	if (!session.token) {
		return {
			clerkUserId: session.userId,
			hasAccess: false,
			status: "token_missing",
		};
	}

	const access = await refreshViewerProductAccess(session.token);

	if (access.hasAccess) {
		return access;
	}

	const pendingCheckoutSessionId =
		await getPendingCheckoutSessionIdFromCookie();
	if (pendingCheckoutSessionId) {
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

export async function getServerResumeDestination() {
	const access = await getServerProductAccess();
	if (!access.hasAccess) {
		return null;
	}

	const session = await getConvexServerSession();
	if (!session.token) {
		return null;
	}

	return (await fetchQuery(
		api.codebase.getCodebaseResumeDestination,
		{},
		{ token: session.token },
	)) as ResumeDestination;
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
