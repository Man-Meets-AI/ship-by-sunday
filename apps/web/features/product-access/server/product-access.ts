import "server-only";

import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { api } from "@/convex/_generated/api";
import type { ProductAccess } from "@/features/product-access/lib/product-access";
import { getConvexServerSession } from "@/platform/auth/convex-auth";

type ResumeDestination = {
	destination: string;
	stageId: string;
};

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

	return (await fetchQuery(
		api.access.viewerProductAccess,
		{},
		{ token: session.token },
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
		api.packet.getPacketResumeDestination,
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
