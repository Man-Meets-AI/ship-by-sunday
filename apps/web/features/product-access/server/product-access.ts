import "server-only";

import type { FunctionReturnType } from "convex/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { api } from "@/convex/_generated/api";
import {
	claimCheckoutSessionForViewer,
	getPendingCheckoutSessionIdFromCookie,
} from "@/features/checkout/server/checkout-session-recovery";
import type { ProductAccess } from "@/features/product-access/lib/product-access";
import { getConvexServerSession } from "@/platform/auth/convex-auth";

type ResumeDestination = FunctionReturnType<
	typeof api.blueprint.getBlueprintResumeDestination
>;

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

	const access = (await fetchQuery(
		api.access.viewerProductAccess,
		{},
		{ token: session.token },
	)) as ProductAccess;

	if (access.hasAccess) {
		return access;
	}

	const pendingCheckoutSessionId =
		await getPendingCheckoutSessionIdFromCookie();
	if (!pendingCheckoutSessionId) {
		return access;
	}

	const claimResult = await claimCheckoutSessionForViewer(
		pendingCheckoutSessionId,
	);
	if (claimResult.kind !== "validated") {
		return access;
	}

	return (await fetchQuery(
		api.access.viewerProductAccess,
		{},
		{
			token: session.token,
		},
	)) as ProductAccess;
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
