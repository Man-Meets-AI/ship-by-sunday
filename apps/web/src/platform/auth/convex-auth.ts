import "server-only";

import { auth } from "@clerk/nextjs/server";

export const CLERK_CONVEX_TOKEN_TEMPLATE = "convex" as const;

export type ConvexServerSession = {
	userId: string | null;
	token: string | null;
};

export async function getConvexServerSession(): Promise<ConvexServerSession> {
	const authState = await auth();
	if (!authState.userId) {
		return {
			userId: null,
			token: null,
		};
	}

	return {
		userId: authState.userId,
		token: await authState.getToken({
			template: CLERK_CONVEX_TOKEN_TEMPLATE,
		}),
	};
}
