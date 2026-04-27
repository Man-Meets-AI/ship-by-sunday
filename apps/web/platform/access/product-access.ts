import "server-only";

import type { FunctionReturnType } from "convex/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { api } from "@/convex/_generated/api";
import {
	claimCheckoutSessionForViewer,
	claimLatestPendingCheckoutForViewer,
	getPendingCheckoutSessionIdFromCookie,
} from "@/features/checkout/server/checkout-session-recovery";
import type { ProductAccess } from "@/lib/product-access";
import { getConvexServerSession } from "@/platform/auth/convex-auth";

type ResumeDestination = FunctionReturnType<
	typeof api.blueprint.getBlueprintResumeDestination
>;

async function refreshViewerProductAccess(token: string) {
	return (await fetchQuery(
		api.access.viewerProductAccess,
		{},
		{ token },
	)) as ProductAccess;
}

export async function getServerProductAccess(): Promise<ProductAccess> {
	const session = await getConvexServerSession();
	if (!session.userId) {
		return {
			clerkUserId: null,
			hasAccess: false,
			status: "signed_out",
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
	}

	const emailClaimResult = await claimLatestPendingCheckoutForViewer();
	if (emailClaimResult.kind !== "validated") {
		return access;
	}

	return await refreshViewerProductAccess(session.token);
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
		api.blueprint.getBlueprintResumeDestination,
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
